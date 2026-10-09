// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test, console} from "forge-std/Test.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/// Checks the Arc assumptions PamoSavings is built on, against a fork of Arc mainnet.
contract ForkSmokeTest is Test {
    IERC20Metadata constant USDC = IERC20Metadata(0x3600000000000000000000000000000000000000);

    address constant STEAKHOUSE_PRIME = 0xbeef0016cb2Fd5C352ea7CA08a9f54739DFa7298;
    address constant KEYROCK_PRIME = 0x5bEfAb92a5A3D60F578Cb51EEb4e4FD50a1e3123;
    address constant BITWISE_RWA = 0x7610094B846657dCF166D59e42973db52c7015F9;
    address constant GAUNTLET_PRIME = 0xdECcd53BE5453215821184824B519E04C7e00bC7;
    address constant GALAXY = 0x8E357432CC12ff425c36432F312968aEb16112AF;

    function setUp() public {
        vm.createSelectFork("arc_mainnet");
    }

    function test_UsdcIsSixDecimals() public view {
        assertEq(USDC.decimals(), 6);
    }

    function test_NativeBalanceIsUsdcBalance() public {
        address user = makeAddr("user");
        vm.deal(user, 5 ether);
        assertEq(USDC.balanceOf(user), 5_000000);
    }

    function test_Erc20TransferMovesNative() public {
        address user = makeAddr("user");
        address other = makeAddr("other");
        vm.deal(user, 5 ether);
        vm.prank(user);
        USDC.transfer(other, 2_000000);
        assertEq(USDC.balanceOf(other), 2_000000);
        assertEq(other.balance, 2 ether);
    }

    function test_RoundTrip_SteakhousePrime() public {
        _roundTrip(STEAKHOUSE_PRIME);
    }

    function test_RoundTrip_KeyrockPrime() public {
        _roundTrip(KEYROCK_PRIME);
    }

    function test_RoundTrip_BitwiseRwa() public {
        _roundTrip(BITWISE_RWA);
    }

    function test_RoundTrip_GauntletPrime() public {
        _roundTrip(GAUNTLET_PRIME);
    }

    function test_RoundTrip_Galaxy() public {
        _roundTrip(GALAXY);
    }

    /// A contract deposits 1 USDC into a real vault and redeems it straight away.
    function _roundTrip(address vaultAddr) internal {
        IERC4626 vault = IERC4626(vaultAddr);
        assertEq(vault.asset(), address(USDC));
        console.log("share decimals", vault.decimals());
        console.log("maxDeposit", vault.maxDeposit(address(this)));

        vm.deal(address(this), 1 ether);
        USDC.approve(vaultAddr, 1_000000);
        uint256 shares = vault.deposit(1_000000, address(this));
        console.log("shares for 1 USDC", shares);
        console.log("maxWithdraw", vault.maxWithdraw(address(this)));

        address receiver = makeAddr("receiver");
        uint256 assets = vault.redeem(shares, receiver, address(this));
        console.log("USDC back", assets);

        assertEq(USDC.balanceOf(receiver), assets);
        assertApproxEqAbs(assets, 1_000000, 2);
        assertEq(vault.balanceOf(address(this)), 0);
    }
}
