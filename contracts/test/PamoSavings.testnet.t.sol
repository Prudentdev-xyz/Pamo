// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {PamoSavings} from "../src/PamoSavings.sol";

/// The same money flow against the two Arc testnet vaults the build deploys on.
/// One of them has 6-decimal shares, so this also proves nothing assumes 18.
contract PamoSavingsTestnetTest is Test {
    IERC20 constant USDC = IERC20(0x3600000000000000000000000000000000000000);
    address constant EARNKIT_VAULT = 0xAabbeF1D3971c710276ed41eC791BbE14CdB8E88; // 18-decimal shares
    address constant MOCK_MORPHO_VAULT = 0x8f2D33B5D4B9B5F02DF635AE308F7B4C9dA8D2DC; // 6-decimal shares

    PamoSavings savings;
    address alice = makeAddr("alice");

    function setUp() public {
        vm.createSelectFork("arc_testnet");
        savings = new PamoSavings(address(this), EARNKIT_VAULT, MOCK_MORPHO_VAULT, EARNKIT_VAULT);
        vm.deal(alice, 1_000 ether);
    }

    function test_ShareDecimalsDiffer() public view {
        assertEq(IERC4626(EARNKIT_VAULT).decimals(), 18);
        assertEq(IERC4626(MOCK_MORPHO_VAULT).decimals(), 6);
    }

    function test_FullFlow_EarnKitVault() public {
        _fullFlow(PamoSavings.Tier.Calm, EARNKIT_VAULT);
    }

    function test_FullFlow_SixDecimalShareVault() public {
        _fullFlow(PamoSavings.Tier.Steady, MOCK_MORPHO_VAULT);
    }

    function _fullFlow(PamoSavings.Tier tier, address vault) internal {
        uint256 start = USDC.balanceOf(alice);

        vm.startPrank(alice);
        USDC.approve(address(savings), 50_000000);
        uint256 id = savings.openPot(PamoSavings.Kind.Anytime, tier, 0, 0, "Emergency fund", 50_000000);
        assertEq(savings.getPot(id).vault, vault);
        assertApproxEqAbs(savings.potValue(id), 50_000000, 60);

        savings.withdraw(id, 20_000000);
        assertApproxEqAbs(USDC.balanceOf(alice), start - 30_000000, 60);
        assertApproxEqAbs(savings.getPot(id).principal, 30_000000, 60);

        savings.withdrawAll(id);
        vm.stopPrank();

        assertApproxEqAbs(USDC.balanceOf(alice), start, 120);
        assertEq(savings.getPot(id).shares, 0);
        assertEq(IERC4626(vault).balanceOf(address(savings)), 0);
    }
}
