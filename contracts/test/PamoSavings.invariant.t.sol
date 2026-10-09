// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {PamoSavings} from "../src/PamoSavings.sol";
import {PamoFixture} from "./PamoSavings.t.sol";

/// Drives PamoSavings with random saves and withdrawals from a few savers,
/// and has a thief try every pot along the way.
contract Handler is Test {
    IERC20 constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    PamoSavings immutable savings;
    address[] public actors;
    address public immutable thief = makeAddr("thief");

    uint256 public totalIn;
    uint256 public totalOut;
    uint256 public thiefSucceeded;

    constructor(PamoSavings savings_) {
        savings = savings_;
        for (uint256 i = 0; i < 3; i++) {
            address actor = makeAddr(string.concat("saver", vm.toString(i)));
            actors.push(actor);
            vm.deal(actor, 1_000_000 ether);
        }
        vm.deal(thief, 1_000 ether);
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _potOf(address actor, uint256 seed) internal view returns (uint256 id, bool found) {
        uint256 n = savings.potCount(actor);
        if (n == 0) return (0, false);
        return (savings.potsOf(actor, seed % n), true);
    }

    function openPot(uint256 actorSeed, uint8 tierSeed, bool goal, uint256 target, uint256 assets) external {
        address actor = _actor(actorSeed);
        if (savings.potCount(actor) >= 6) return;
        assets = bound(assets, 0, 2_000e6);
        target = bound(target, 1e6, 3_000e6);

        vm.startPrank(actor);
        USDC.approve(address(savings), assets);
        savings.openPot(
            goal ? PamoSavings.Kind.Goal : PamoSavings.Kind.Anytime,
            PamoSavings.Tier(tierSeed % 3),
            target,
            uint64(block.timestamp + 7 days),
            "pot",
            assets
        );
        vm.stopPrank();
        totalIn += assets;
    }

    function deposit(uint256 actorSeed, uint256 potSeed, uint256 assets) external {
        address actor = _actor(actorSeed);
        (uint256 id, bool found) = _potOf(actor, potSeed);
        if (!found) return;
        assets = bound(assets, 1000, 2_000e6);

        vm.startPrank(actor);
        USDC.approve(address(savings), assets);
        savings.deposit(id, assets);
        vm.stopPrank();
        totalIn += assets;
    }

    function withdraw(uint256 actorSeed, uint256 potSeed, uint256 assets) external {
        address actor = _actor(actorSeed);
        (uint256 id, bool found) = _potOf(actor, potSeed);
        if (!found || !savings.isUnlocked(id)) return;
        uint256 value = savings.potValue(id);
        if (value < 2000) return;
        assets = bound(assets, 1000, value - 1000);

        uint256 before = USDC.balanceOf(actor);
        vm.prank(actor);
        savings.withdraw(id, assets);
        totalOut += USDC.balanceOf(actor) - before;
    }

    function withdrawAll(uint256 actorSeed, uint256 potSeed) external {
        address actor = _actor(actorSeed);
        (uint256 id, bool found) = _potOf(actor, potSeed);
        if (!found || !savings.isUnlocked(id) || savings.getPot(id).shares == 0) return;

        uint256 before = USDC.balanceOf(actor);
        vm.prank(actor);
        savings.withdrawAll(id);
        totalOut += USDC.balanceOf(actor) - before;
    }

    function thiefTries(uint256 id, uint256 assets) external {
        id = bound(id, 1, savings.nextId());
        assets = bound(assets, 1, 1_000e6);
        vm.startPrank(thief);
        try savings.withdraw(id, assets) {
            thiefSucceeded++;
        } catch {}
        try savings.withdrawAll(id) {
            thiefSucceeded++;
        } catch {}
        vm.stopPrank();
    }

    function skipTime(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 1 hours, 3 days));
    }
}

contract PamoSavingsInvariantTest is PamoFixture {
    Handler handler;
    address[3] vaults = [CALM_VAULT, STEADY_VAULT, BOLD_VAULT];

    function setUp() public {
        _deploy();
        handler = new Handler(savings);
        targetContract(address(handler));
        // One fixed caller: the fuzzer's random senders can land on a blocked address on Arc.
        targetSender(makeAddr("fuzzer"));
    }

    /// For each vault, the shares recorded across pots equal the shares PamoSavings holds.
    function invariant_PotSharesMatchVaultBalances() public view {
        uint256[3] memory sum;
        for (uint256 id = 1; id < savings.nextId(); id++) {
            PamoSavings.Pot memory p = savings.getPot(id);
            for (uint256 v = 0; v < 3; v++) {
                if (p.vault == vaults[v]) sum[v] += p.shares;
            }
        }
        for (uint256 v = 0; v < 3; v++) {
            assertEq(sum[v], IERC4626(vaults[v]).balanceOf(address(savings)));
        }
    }

    /// PamoSavings never keeps USDC of its own, and leaves no standing approval on a vault.
    function invariant_NoIdleUsdcOrApprovals() public view {
        assertEq(USDC.balanceOf(address(savings)), 0);
        for (uint256 v = 0; v < 3; v++) {
            assertEq(USDC.allowance(address(savings), vaults[v]), 0);
        }
    }

    /// Nobody but a pot's owner ever withdraws from it.
    function invariant_ThiefNeverSucceeds() public view {
        assertEq(handler.thiefSucceeded(), 0);
        assertEq(USDC.balanceOf(handler.thief()), 1_000e6);
    }

    /// Principal is what went in minus the pro-rata share of what came out; it never exceeds deposits.
    function invariant_PrincipalNeverExceedsDeposits() public view {
        uint256 principal;
        for (uint256 id = 1; id < savings.nextId(); id++) {
            principal += savings.getPot(id).principal;
        }
        assertLe(principal, handler.totalIn());
    }
}
