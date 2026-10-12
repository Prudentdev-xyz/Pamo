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

On mainnet the chain ID is `5042`, the RPC alias is `arc_mainnet` and the verifier URL is `https://explorer.arc.io/api/`. That explorer sits behind Cloudflare; if `verify-contract` is refused, upload the standard JSON input on the explorer's verify page.

The admin can pause new deposits and set which vault a tier uses. To make it a multisig, create a Safe on Arc at [app.safe.global](https://app.safe.global) and set `OWNER` to its address before deploying. To move an existing deployment, the current owner calls `transferOwnership(<safe>)` and the Safe then calls `acceptOwnership()`.

Copy `.env.example` to `.env` for the deployer key. See [Docs/Build_Guide.md](../Docs/Build_Guide.md) §4 for the contract and its test list.
