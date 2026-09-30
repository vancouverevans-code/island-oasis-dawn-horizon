# Kiln

Forge one agent, fire a public signal, and stoke it with testnet BOT. Kiln is a small dApp for [BOT Chain](https://www.botchain.ai/en/) testnet. The pit on the right starts as a rehearsal on your device. Deploy writes a real `Kiln` contract from your wallet.

## Use it

1. Open the app and connect MetaMask, Rabby, or another injected EVM wallet. Kiln adds **BOT Chain Testnet** if it is missing.
2. Claim test BOT from the [faucet](https://faucet.botchain.ai/en/basic). Gas is paid in BOT.
3. **Deploy Kiln to testnet.** That is one contract-creation transaction. Copy the address or open it on the [explorer](https://scan.bohr.life).
4. Forge an agent (one per wallet), fire a signal, or stoke someone else's. Staking a signal sends that BOT straight to the agent owner.

Already deployed? Paste the contract address into **Open**. Hide it on this device any time. The chain copy stays where it is.

Rehearsal does not spend BOT. Reset clears only the local pit.

## Network

| | |
|---|---|
| Name | BOT Chain Testnet |
| Chain ID | 968 (`0x3c8`) |
| RPC | https://rpc.bohr.life |
| Explorer | https://scan.bohr.life |
| Gas token | BOT |
| Faucet | https://faucet.botchain.ai/en/basic |
| Docs | https://dev-docs.botchain.ai/docs/Developers/quick-guide/ |

Mainnet is a different network (chain ID 677, `https://rpc.botchain.ai`). This app targets testnet only.

## Contract

Source: [`contracts/Kiln.sol`](contracts/Kiln.sol) (MIT, Solidity 0.8.24).

The app deploys the bytecode already compiled into [`src/lib/kiln/artifact.ts`](src/lib/kiln/artifact.ts) (optimizer 200 runs, EVM `paris`). You do not need Foundry to deploy from the UI. If you change the Solidity, recompile and replace that artifact or the wallet will deploy the old bytecode.

| Call | What it does | Limits |
|---|---|---|
| `forge(handle, craft, oath)` | Creates the wallet's only agent | handle 24, craft 16, oath 140 bytes |
| `fire(note)` | Posts a signal from that agent | note 180 bytes |
| `stoke(emberId)` | Tips the signal's agent owner | `msg.value` must be greater than 0 |
| `version()` | Returns `kiln-1` | used to reject a random address |

Crafts in the UI are Scout, Oracle, Raider, and Keeper.

## Run locally

Node 22.

```bash
npm install
npm run dev
```

The dev server listens on port 8080. Then:

```bash
npm run typecheck
npm run build
```

## Layout

| Path | |
|---|---|
| `contracts/Kiln.sol` | Contract source |
| `src/lib/kiln/artifact.ts` | ABI and creation bytecode |
| `src/lib/kiln/chain.ts` | Testnet client, deploy, and writes |
| `src/lib/kiln/model.ts` | Rehearsal pit |
| `src/components/kiln/kiln-app.tsx` | UI |
