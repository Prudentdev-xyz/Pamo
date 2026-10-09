// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {PamoSavings} from "../src/PamoSavings.sol";

/// A vault whose asset is not USDC, for the setTierVault check.
contract NotUsdcVault {
    function asset() external pure returns (address) {
        return address(0xBEEF);
    }
}

/// Shared setup: a fork of Arc mainnet with PamoSavings deployed over three real vaults.
abstract contract PamoFixture is Test {
    IERC20 constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    address constant CALM_VAULT = 0xbeef0016cb2Fd5C352ea7CA08a9f54739DFa7298; // Steakhouse Prime USDC
    address constant STEADY_VAULT = 0x5bEfAb92a5A3D60F578Cb51EEb4e4FD50a1e3123; // Keyrock Prime USDC
    address constant BOLD_VAULT = 0x7610094B846657dCF166D59e42973db52c7015F9; // Bitwise Premium RWA USDC

    PamoSavings savings;
    address admin = makeAddr("admin");

    function _deploy() internal {
        vm.createSelectFork("arc_mainnet");
        savings = new PamoSavings(admin, CALM_VAULT, STEADY_VAULT, BOLD_VAULT);
    }

    /// On Arc the native balance is the USDC balance: 1 ether of native = 1 USDC.
    function _fund(address who, uint256 usdc) internal {
        vm.deal(who, who.balance + usdc * 1e12);
    }

    function _open(
        address who,
        PamoSavings.Kind kind,
        PamoSavings.Tier tier,
        uint256 target,
        uint64 unlockAt,
        uint256 assets
    ) internal returns (uint256 id) {
        vm.startPrank(who);
        USDC.approve(address(savings), assets);
        id = savings.openPot(kind, tier, target, unlockAt, "Rent", assets);
        vm.stopPrank();
    }

    function _deposit(address who, uint256 id, uint256 assets) internal {
        vm.startPrank(who);
        USDC.approve(address(savings), assets);
        savings.deposit(id, assets);
        vm.stopPrank();
    }

    function _pot(uint256 id) internal view returns (PamoSavings.Pot memory p) {
        return savings.getPot(id);
    }
}

contract PamoSavingsTest is PamoFixture {
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    PamoSavings.Kind constant ANYTIME = PamoSavings.Kind.Anytime;
    PamoSavings.Kind constant GOAL = PamoSavings.Kind.Goal;
    PamoSavings.Tier constant CALM = PamoSavings.Tier.Calm;
    PamoSavings.Tier constant STEADY = PamoSavings.Tier.Steady;
    PamoSavings.Tier constant BOLD = PamoSavings.Tier.Bold;

    uint256 constant ONE = 1_000000; // 1 USDC

    function setUp() public {
        _deploy();
        _fund(alice, 10_000 * ONE);
        _fund(bob, 10_000 * ONE);
    }

    // ── opening and saving ──

    function test_OpenWithFirstDeposit_OneCall() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, ONE);

        PamoSavings.Pot memory p = _pot(id);
        assertEq(id, 1);
        assertEq(p.owner, alice);
        assertEq(p.vault, CALM_VAULT);
        assertEq(p.principal, ONE);
        assertGt(p.shares, 0);
        assertApproxEqAbs(savings.potValue(id), ONE, 2);
        assertEq(USDC.balanceOf(address(savings)), 0, "no idle USDC left in Pamo");
        assertEq(USDC.allowance(address(savings), CALM_VAULT), 0, "vault approval is exact");
    }

    function test_OpenWithoutDeposit() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 0);
        assertEq(_pot(id).shares, 0);
        assertEq(savings.potValue(id), 0);
    }

    function test_EachTierUsesItsOwnVault() public {
        uint256 a = _open(alice, ANYTIME, CALM, 0, 0, ONE);
        uint256 b = _open(alice, ANYTIME, STEADY, 0, 0, ONE);
        uint256 c = _open(alice, ANYTIME, BOLD, 0, 0, ONE);

        assertEq(_pot(a).vault, CALM_VAULT);
        assertEq(_pot(b).vault, STEADY_VAULT);
        assertEq(_pot(c).vault, BOLD_VAULT);
        assertEq(IERC4626(CALM_VAULT).balanceOf(address(savings)), _pot(a).shares);
        assertEq(IERC4626(STEADY_VAULT).balanceOf(address(savings)), _pot(b).shares);
        assertEq(IERC4626(BOLD_VAULT).balanceOf(address(savings)), _pot(c).shares);
    }

    function test_DepositWithdrawPartThenAll_RoundTrip() public {
        uint256 start = USDC.balanceOf(alice);
        uint256 id = _open(alice, ANYTIME, STEADY, 0, 0, 100 * ONE);
        _deposit(alice, id, 50 * ONE);
        assertEq(_pot(id).principal, 150 * ONE);

        vm.prank(alice);
        savings.withdraw(id, 40 * ONE);
        assertApproxEqAbs(USDC.balanceOf(alice), start - 110 * ONE, 2);
        assertApproxEqAbs(_pot(id).principal, 110 * ONE, 2);

        vm.prank(alice);
        savings.withdrawAll(id);
        assertApproxEqAbs(USDC.balanceOf(alice), start, 3, "alice ends with what she put in");
        assertEq(_pot(id).shares, 0);
        assertEq(_pot(id).principal, 0);
        assertEq(IERC4626(STEADY_VAULT).balanceOf(address(savings)), 0);
    }

    function test_OneUsdc_SixDecimalsInAndOut() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, ONE);
        assertApproxEqAbs(savings.potValue(id), ONE, 1);

        uint256 before = USDC.balanceOf(alice);
        vm.prank(alice);
        savings.withdrawAll(id);
        assertApproxEqAbs(USDC.balanceOf(alice) - before, ONE, 1);
    }

    function test_PotName_LengthCap() public {
        string memory tooLong = "This pot name is far too long to be accepted by the contract, sorry";
        assertGt(bytes(tooLong).length, savings.MAX_NAME_LENGTH());
        vm.prank(alice);
        vm.expectRevert(PamoSavings.NameTooLong.selector);
        savings.openPot(ANYTIME, CALM, 0, 0, tooLong, 0);
    }

    function test_ZeroAmounts_Revert() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, ONE);
        vm.startPrank(alice);
        vm.expectRevert(PamoSavings.ZeroAmount.selector);
        savings.deposit(id, 0);
        vm.expectRevert(PamoSavings.ZeroAmount.selector);
        savings.withdraw(id, 0);
        vm.stopPrank();
    }

    function test_WithdrawMoreThanValue_Reverts() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, ONE);
        vm.prank(alice);
        vm.expectRevert(PamoSavings.AmountExceedsValue.selector);
        savings.withdraw(id, 2 * ONE);
    }

    function test_WithdrawAll_EmptyPot_Reverts() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 0);
        vm.prank(alice);
        vm.expectRevert(PamoSavings.NothingToWithdraw.selector);
        savings.withdrawAll(id);
    }

    // ── goals ──

    function test_Goal_RefusedWhileLocked() public {
        uint256 id = _open(alice, GOAL, CALM, 100 * ONE, uint64(block.timestamp + 30 days), 10 * ONE);
        assertFalse(savings.isUnlocked(id));

        vm.startPrank(alice);
        vm.expectRevert(PamoSavings.GoalLocked.selector);
        savings.withdraw(id, ONE);
        vm.expectRevert(PamoSavings.GoalLocked.selector);
        savings.withdrawAll(id);
        vm.stopPrank();
    }

    function test_Goal_UnlocksOnDate() public {
        uint256 id = _open(alice, GOAL, CALM, 100 * ONE, uint64(block.timestamp + 30 days), 10 * ONE);
        vm.warp(block.timestamp + 30 days);
        assertTrue(savings.isUnlocked(id));

        vm.prank(alice);
        savings.withdrawAll(id);
        assertEq(_pot(id).shares, 0);
    }

    function test_Goal_UnlocksWhenTargetReached() public {
        uint256 id = _open(alice, GOAL, CALM, 5 * ONE, uint64(block.timestamp + 30 days), 3 * ONE);
        assertFalse(savings.isUnlocked(id));

        _deposit(alice, id, 3 * ONE);
        assertTrue(savings.isUnlocked(id));
        assertTrue(_pot(id).unlocked);
    }

    /// Depositing exactly the target is worth 1 micro-USDC less after rounding. It still unlocks.
    function test_Goal_ExactTargetDeposit_Unlocks() public {
        uint256 id = _open(alice, GOAL, CALM, 5 * ONE, uint64(block.timestamp + 30 days), 5 * ONE);
        assertTrue(savings.isUnlocked(id));
    }

    function test_Goal_StaysUnlockedAfterPartialWithdrawal() public {
        uint256 id = _open(alice, GOAL, CALM, 5 * ONE, uint64(block.timestamp + 30 days), 6 * ONE);

        vm.prank(alice);
        savings.withdraw(id, 4 * ONE);
        assertLt(savings.potValue(id), 5 * ONE, "back under the target");
        assertTrue(savings.isUnlocked(id), "still unlocked");

        vm.prank(alice);
        savings.withdraw(id, ONE);
    }

    function test_Goal_InvalidParams_Revert() public {
        vm.startPrank(alice);
        vm.expectRevert(PamoSavings.InvalidGoal.selector);
        savings.openPot(GOAL, CALM, 0, uint64(block.timestamp + 1 days), "x", 0);
        vm.expectRevert(PamoSavings.InvalidGoal.selector);
        savings.openPot(GOAL, CALM, ONE, uint64(block.timestamp), "x", 0);
        vm.stopPrank();
    }

    function test_Anytime_IgnoresGoalFields() public {
        uint256 id = _open(alice, ANYTIME, CALM, 99 * ONE, uint64(block.timestamp + 30 days), ONE);
        assertEq(_pot(id).target, 0);
        assertEq(_pot(id).unlockAt, 0);
        assertTrue(savings.isUnlocked(id));
    }

    // ── ownership of pots ──

    function test_OnlyOwnerCanTouchAPot() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 10 * ONE);

        vm.startPrank(bob);
        USDC.approve(address(savings), ONE);
        vm.expectRevert(PamoSavings.NotPotOwner.selector);
        savings.deposit(id, ONE);
        vm.expectRevert(PamoSavings.NotPotOwner.selector);
        savings.withdraw(id, ONE);
        vm.expectRevert(PamoSavings.NotPotOwner.selector);
        savings.withdrawAll(id);
        vm.stopPrank();
    }

    function test_AdminHasNoPathToUserFunds() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 10 * ONE);
        uint256 shares = _pot(id).shares;

        vm.startPrank(admin);
        vm.expectRevert(PamoSavings.NotPotOwner.selector);
        savings.withdraw(id, ONE);
        vm.expectRevert(PamoSavings.NotPotOwner.selector);
        savings.withdrawAll(id);
        // Repointing the tier and pausing change nothing for the existing pot.
        savings.setTierVault(CALM, BOLD_VAULT);
        savings.pause();
        vm.stopPrank();

        assertEq(_pot(id).vault, CALM_VAULT);
        assertEq(_pot(id).shares, shares);
        assertEq(USDC.balanceOf(admin), 0);

        vm.prank(alice);
        savings.withdrawAll(id);
    }

    // ── admin ──

    function test_SetTierVault_RejectsNonUsdcVault() public {
        address bad = address(new NotUsdcVault());
        vm.startPrank(admin);
        vm.expectRevert(PamoSavings.InvalidVault.selector);
        savings.setTierVault(CALM, bad);
        vm.expectRevert(PamoSavings.InvalidVault.selector);
        savings.setTierVault(CALM, address(0));
        vm.expectRevert(PamoSavings.InvalidVault.selector);
        savings.setTierVault(CALM, makeAddr("notAContract"));
        vm.stopPrank();
    }

    function test_SetTierVault_OnlyAffectsNewPots() public {
        uint256 oldPot = _open(alice, ANYTIME, CALM, 0, 0, ONE);

        vm.prank(admin);
        savings.setTierVault(CALM, STEADY_VAULT);

        uint256 newPot = _open(alice, ANYTIME, CALM, 0, 0, ONE);
        assertEq(_pot(oldPot).vault, CALM_VAULT);
        assertEq(_pot(newPot).vault, STEADY_VAULT);

        _deposit(alice, oldPot, ONE);
        assertEq(IERC4626(CALM_VAULT).balanceOf(address(savings)), _pot(oldPot).shares);
    }

    function test_AdminFunctions_OnlyOwner() public {
        vm.startPrank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        savings.setTierVault(CALM, STEADY_VAULT);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        savings.pause();
        vm.stopPrank();
    }

    function test_Pause_BlocksSavingNotWithdrawing() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 10 * ONE);

        vm.prank(admin);
        savings.pause();

        vm.startPrank(alice);
        USDC.approve(address(savings), ONE);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        savings.deposit(id, ONE);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        savings.openPot(ANYTIME, CALM, 0, 0, "x", ONE);

        savings.withdraw(id, 4 * ONE);
        savings.withdrawAll(id);
        vm.stopPrank();
        assertEq(_pot(id).shares, 0);

        vm.prank(admin);
        savings.unpause();
        _deposit(alice, id, ONE);
    }

    // ── failure in the vault ──

    /// A vault that cannot pay (short on cash, or a blocked receiver) reverts the whole
    /// withdrawal and leaves the pot exactly as it was.
    function test_Withdraw_RevertsCleanlyWhenVaultCannotPay() public {
        uint256 id = _open(alice, ANYTIME, CALM, 0, 0, 10 * ONE);
        PamoSavings.Pot memory before = _pot(id);

        vm.mockCallRevert(CALM_VAULT, abi.encodeWithSelector(IERC4626.redeem.selector), "no cash");
        vm.startPrank(alice);
        vm.expectRevert();
        savings.withdraw(id, ONE);
        vm.expectRevert();
        savings.withdrawAll(id);
        vm.stopPrank();
        vm.clearMockedCalls();

        assertEq(_pot(id).shares, before.shares);
        assertEq(_pot(id).principal, before.principal);
    }

    // ── events (the indexer depends on these) ──

    function test_Events_CarryIndexerFields() public {
        uint64 unlockAt = uint64(block.timestamp + 30 days);
        uint256 shares = IERC4626(STEADY_VAULT).previewDeposit(10 * ONE);

        vm.startPrank(alice);
        USDC.approve(address(savings), 10 * ONE);
        vm.expectEmit(address(savings));
        emit PamoSavings.PotOpened(1, alice, GOAL, STEADY, STEADY_VAULT, 500 * ONE, unlockAt, "Rent");
        vm.expectEmit(address(savings));
        emit PamoSavings.Deposited(1, alice, 10 * ONE, shares);
        savings.openPot(GOAL, STEADY, 500 * ONE, unlockAt, "Rent", 10 * ONE);
        vm.stopPrank();

        vm.warp(unlockAt);
        vm.expectEmit(true, true, false, false, address(savings));
        emit PamoSavings.Withdrawn(1, alice, 0, 0);
        vm.prank(alice);
        savings.withdrawAll(1);

        vm.expectEmit(address(savings));
        emit PamoSavings.TierVaultSet(BOLD, CALM_VAULT);
        vm.prank(admin);
        savings.setTierVault(BOLD, CALM_VAULT);
    }

    // ── views ──

    function test_GetPots_ReturnsEverythingForOneOwner() public {
        _open(alice, ANYTIME, CALM, 0, 0, 2 * ONE);
        _open(alice, GOAL, BOLD, 100 * ONE, uint64(block.timestamp + 30 days), 3 * ONE);
        _open(bob, ANYTIME, CALM, 0, 0, ONE);

        PamoSavings.PotView[] memory views = savings.getPots(alice);
        assertEq(views.length, 2);
        assertEq(savings.potCount(alice), 2);
        assertEq(views[0].id, 1);
        assertEq(views[1].id, 2);
        assertApproxEqAbs(views[0].value, 2 * ONE, 2);
        assertTrue(views[0].unlocked);
        assertFalse(views[1].unlocked);
        assertEq(views[1].pot.target, 100 * ONE);
        assertEq(savings.getPots(makeAddr("nobody")).length, 0);
    }

    function test_TwoPotsInOneVault_StaySeparate() public {
        uint256 a = _open(alice, ANYTIME, CALM, 0, 0, 10 * ONE);
        uint256 b = _open(bob, ANYTIME, CALM, 0, 0, 30 * ONE);

        vm.prank(alice);
        savings.withdrawAll(a);

        assertApproxEqAbs(savings.potValue(b), 30 * ONE, 2);
        assertEq(IERC4626(CALM_VAULT).balanceOf(address(savings)), _pot(b).shares);
    }

    // ── fuzz: share and pro-rata principal maths ──

    function testFuzz_DepositThenWithdrawAll(uint256 assets, uint8 tierSeed) public {
        assets = bound(assets, 1000, 5_000 * ONE);
        PamoSavings.Tier tier = PamoSavings.Tier(tierSeed % 3);

        uint256 start = USDC.balanceOf(alice);
        uint256 id = _open(alice, ANYTIME, tier, 0, 0, assets);
        assertApproxEqAbs(savings.potValue(id), assets, 2);

        vm.prank(alice);
        savings.withdrawAll(id);
        assertApproxEqAbs(USDC.balanceOf(alice), start, 2);
        assertLe(USDC.balanceOf(alice), start, "never more out than in, same block");
        assertEq(_pot(id).principal, 0);
    }

    function testFuzz_PartialWithdraw(uint256 assets, uint256 out, uint8 tierSeed) public {
        assets = bound(assets, 10_000, 5_000 * ONE);
        out = bound(out, 1000, assets - 1000);
        PamoSavings.Tier tier = PamoSavings.Tier(tierSeed % 3);

        uint256 start = USDC.balanceOf(alice);
        uint256 id = _open(alice, ANYTIME, tier, 0, 0, assets);

        vm.prank(alice);
        savings.withdraw(id, out);

        PamoSavings.Pot memory p = _pot(id);
        assertApproxEqAbs(USDC.balanceOf(alice), start - assets + out, 2);
        assertApproxEqAbs(p.principal, assets - out, 3, "principal falls pro rata");
        assertApproxEqAbs(savings.potValue(id), assets - out, 3);
        assertEq(IERC4626(p.vault).balanceOf(address(savings)), p.shares);

        vm.prank(alice);
        savings.withdrawAll(id);
        assertApproxEqAbs(USDC.balanceOf(alice), start, 4);
    }

    function testFuzz_ManyDeposits_PrincipalIsSumIn(uint256 a, uint256 b, uint256 c) public {
        a = bound(a, 1000, 1_000 * ONE);
        b = bound(b, 1000, 1_000 * ONE);
        c = bound(c, 1000, 1_000 * ONE);

        uint256 id = _open(alice, ANYTIME, BOLD, 0, 0, a);
        _deposit(alice, id, b);
        _deposit(alice, id, c);

        assertEq(_pot(id).principal, a + b + c);
        assertApproxEqAbs(savings.potValue(id), a + b + c, 4);
    }
}
