# Pamo contracts

Foundry project for `PamoSavings`, built with [Arc Foundry](https://docs.arc.io/arc/tutorials/install-arc-foundry) (`arc-forge`, `arc-cast`, `arc-anvil`). Plain Foundry does not model Arc's USDC, so tests that move USDC fail under it.

```shell
git submodule update --init --recursive   # after a fresh clone
arc-forge build
arc-forge test --network arc              # fork tests read Arc mainnet over RPC
FOUNDRY_PROFILE=deep arc-forge test --network arc   # 10,000 fuzz runs, before a deploy
```

Deploy and verify (testnet shown):

```shell
arc-forge script script/Deploy.s.sol --rpc-url arc_testnet --network arc --broadcast
arc-forge verify-contract <address> src/PamoSavings.sol:PamoSavings \
  --chain-id 5042002 --verifier blockscout --verifier-url https://explorer.testnet.arc.io/api/ \
  --constructor-args $(arc-cast abi-encode "constructor(address,address,address,address)" <owner> <calm> <steady> <bold>) --watch
```

Copy `.env.example` to `.env` for the deployer key. See [Docs/Build_Guide.md](../Docs/Build_Guide.md) §4 for the contract and its test list.
