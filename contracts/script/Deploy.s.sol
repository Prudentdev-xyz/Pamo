// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {PamoSavings} from "../src/PamoSavings.sol";

/// Deploys PamoSavings with its three tier vaults. Network and vaults come from env,
/// so the same script serves testnet and mainnet.
///
///   arc-forge script script/Deploy.s.sol --rpc-url $ARC_RPC_URL --network arc --broadcast
///
/// Env: PRIVATE_KEY, CALM_VAULT, STEADY_VAULT, BOLD_VAULT, and optionally OWNER
/// (the admin; defaults to the deployer).
contract Deploy is Script {
    function run() external returns (PamoSavings savings) {
        uint256 key = _envKey("PRIVATE_KEY");
        address owner = vm.envOr("OWNER", vm.addr(key));
        address calm = vm.envAddress("CALM_VAULT");
        address steady = vm.envAddress("STEADY_VAULT");
        address bold = vm.envAddress("BOLD_VAULT");

        vm.startBroadcast(key);
        savings = new PamoSavings(owner, calm, steady, bold);
        vm.stopBroadcast();

        console.log("PamoSavings", address(savings));
        console.log("chain id   ", block.chainid);
        console.log("owner      ", owner);
        console.log("calm vault ", calm);
        console.log("steady     ", steady);
        console.log("bold       ", bold);
    }

    /// Wallets export keys without the 0x prefix; accept both forms.
    function _envKey(string memory name) internal view returns (uint256) {
        string memory raw = vm.envString(name);
        bytes memory b = bytes(raw);
        bool prefixed = b.length >= 2 && b[0] == "0" && (b[1] == "x" || b[1] == "X");
        return vm.parseUint(prefixed ? raw : string.concat("0x", raw));
    }
}
