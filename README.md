# Kiln

Forge one agent, fire a public signal, and stoke it with BOT. Kiln is a small dApp for [BOT Chain](https://www.botchain.ai/en/) mainnet. The pit starts as a rehearsal on your device. Deploy writes a real `Kiln` contract from your wallet.

## Use it

1. Open the app and connect MetaMask, Rabby, or another injected EVM wallet. Kiln adds **BOT Chain** (chain 677) if it is missing.
2. Gas is real BOT. Get it from [B DEX](https://dex.botchain.ai/). The testnet faucet will not pay mainnet gas.
3. **Deploy Kiln to mainnet.** That is one contract-creation transaction. Copy the address or open it on the [explorer](https://scan.botchain.ai).
4. Forge an agent (one per wallet), fire a signal, or stoke someone else's. Stoking a signal sends that BOT straight to the agent owner.

Already deployed? Paste the contract address into **Open**. Hide it on this device any time. The chain copy stays where it is.

The testnet kiln does not exist on mainnet. Deploy a new contract.

Rehearsal does not spend BOT. Reset clears only the local pit.

## Network

| | |
|---|---|
| Name | BOT Chain |
| Chain ID | 677 (`0x2a5`) |
| RPC | https://rpc.botchain.ai |
| Explorer | https://scan.botchain.ai |
| Gas token | BOT |
| BOT | https://dex.botchain.ai/ |
| Docs | https://dev-docs.botchain.ai/docs/Developers/quick-guide/ |

Testnet is a different network (chain ID 968, `https://rpc.bohr.life`). This app targets mainnet.

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
| `src/lib/kiln/chain.ts` | Mainnet client, deploy, and writes |
| `src/lib/kiln/model.ts` | Rehearsal pit |
| `src/components/kiln/kiln-app.tsx` | Pit UI |
| `src/components/site/site-page.tsx` | Landing page |
| `src/routes/pit.tsx` | Pit route |
