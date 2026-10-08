import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatEther,
  http,
  isAddress,
  type Address,
} from "viem";
import { KILN_ABI, KILN_BYTECODE } from "@/lib/kiln/artifact";
import type { Agent, Ember, Pit } from "@/lib/kiln/model";

export const BOT_CHAIN_ID = 677;
export const BOT_CHAIN_HEX = "0x2a5";
export const RPC_URL = "https://rpc.botchain.ai";
export const EXPLORER_URL = "https://scan.botchain.ai";
export const DEX_URL = "https://dex.botchain.ai/";
export const DOCS_URL = "https://dev-docs.botchain.ai/docs/Developers/quick-guide/";

export const botChain = defineChain({
  id: BOT_CHAIN_ID,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "BOT Explorer", url: EXPLORER_URL } },
});

export const publicClient = createPublicClient({
  chain: botChain,
  transport: http(RPC_URL),
});

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export function injectedProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

export function explorerAddress(address: string) {
  return `${EXPLORER_URL}/address/${address}`;
}

export function explorerTx(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function shortAddr(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatBot(wei: string) {
  try {
    const value = Number(formatEther(BigInt(wei || "0")));
    if (!Number.isFinite(value) || value === 0) return "0";
    if (value < 0.0001) return "<0.0001";
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  } catch {
    return "0";
  }
}

export function sameAddr(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

type AgentRaw = {
  owner: Address;
  handle: string;
  craft: string;
  oath: string;
  forgedAt: bigint;
  fires: number | bigint;
  heat: bigint;
};

type EmberRaw = {
  agentId: bigint;
  author: Address;
  note: string;
  firedAt: bigint;
  heat: bigint;
};

function toAgent(id: number, raw: AgentRaw): Agent {
  return {
    id,
    owner: raw.owner,
    handle: raw.handle,
    craft: raw.craft,
    oath: raw.oath,
    forgedAt: Number(raw.forgedAt),
    fires: Number(raw.fires),
    heat: raw.heat.toString(),
  };
}

function toEmber(id: number, raw: EmberRaw): Ember {
  return {
    id,
    agentId: Number(raw.agentId),
    author: raw.author,
    note: raw.note,
    firedAt: Number(raw.firedAt),
    heat: raw.heat.toString(),
  };
}

export async function readPit(address: Address): Promise<Pit> {
  const version = await publicClient.readContract({
    address,
    abi: KILN_ABI,
    functionName: "version",
  });
  if (version !== "kiln-1") throw new Error("That address is not a Kiln.");

  const [agentCount, emberCount] = await Promise.all([
    publicClient.readContract({ address, abi: KILN_ABI, functionName: "agentCount" }),
    publicClient.readContract({ address, abi: KILN_ABI, functionName: "emberCount" }),
  ]);

  const agentTotal = Number(agentCount);
  const emberTotal = Number(emberCount);
  const agentFrom = Math.max(1, agentTotal - 39);
  const emberFrom = Math.max(1, emberTotal - 39);

  const agentIds = range(agentFrom, agentTotal);
  const emberIds = range(emberFrom, emberTotal);

  const [agents, embers] = await Promise.all([
    Promise.all(
      agentIds.map(async (id) => {
        const raw = await publicClient.readContract({
          address,
          abi: KILN_ABI,
          functionName: "agent",
          args: [BigInt(id)],
        });
        return toAgent(id, raw);
      }),
    ),
    Promise.all(
      emberIds.map(async (id) => {
        const raw = await publicClient.readContract({
          address,
          abi: KILN_ABI,
          functionName: "ember",
          args: [BigInt(id)],
        });
        return toEmber(id, raw);
      }),
    ),
  ]);

  return { agents, embers };
}

function range(from: number, to: number) {
  if (to < from) return [];
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export async function ensureBotChain(provider: EthereumProvider) {
  const current = String(await provider.request({ method: "eth_chainId" })).toLowerCase();
  const parsed = current.startsWith("0x") ? Number.parseInt(current, 16) : Number(current);
  if (current === BOT_CHAIN_HEX || parsed === BOT_CHAIN_ID) return;
  const add = {
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: BOT_CHAIN_HEX,
        chainName: "BOT Chain",
        nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
        rpcUrls: [RPC_URL],
        blockExplorerUrls: [EXPLORER_URL],
      },
    ],
  };
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BOT_CHAIN_HEX }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 4902) {
      await provider.request(add);
      return;
    }
    try {
      await provider.request(add);
    } catch {
      throw error;
    }
  }
}

export function walletFrom(provider: EthereumProvider, account: Address) {
  return createWalletClient({
    account,
    chain: botChain,
    transport: custom(provider),
  });
}

export async function deployKiln(provider: EthereumProvider, account: Address) {
  const wallet = walletFrom(provider, account);
  const hash = await wallet.deployContract({
    abi: KILN_ABI,
    bytecode: KILN_BYTECODE,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error("Deploy confirmed without a contract address.");
  return { hash, address: receipt.contractAddress };
}

export async function sendForge(
  provider: EthereumProvider,
  account: Address,
  kiln: Address,
  handle: string,
  craft: string,
  oath: string,
) {
  const wallet = walletFrom(provider, account);
  const hash = await wallet.writeContract({
    address: kiln,
    abi: KILN_ABI,
    functionName: "forge",
    args: [handle, craft, oath],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function sendFire(
  provider: EthereumProvider,
  account: Address,
  kiln: Address,
  note: string,
) {
  const wallet = walletFrom(provider, account);
  const hash = await wallet.writeContract({
    address: kiln,
    abi: KILN_ABI,
    functionName: "fire",
    args: [note],
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function sendStoke(
  provider: EthereumProvider,
  account: Address,
  kiln: Address,
  emberId: number,
  value: bigint,
) {
  const wallet = walletFrom(provider, account);
  const hash = await wallet.writeContract({
    address: kiln,
    abi: KILN_ABI,
    functionName: "stoke",
    args: [BigInt(emberId)],
    value,
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export function parseAttach(value: string): Address | null {
  const trimmed = value.trim();
  if (!isAddress(trimmed)) return null;
  return trimmed;
}

export function explain(error: unknown) {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/user rejected|user denied|rejected the request/i.test(text)) return "Signature cancelled.";
  if (/AlreadyForged/.test(text)) return "This wallet already forged an agent in this kiln.";
  if (/NoAgent/.test(text)) return "Forge an agent before you fire a signal.";
  if (/TooLong/.test(text)) return "That text is over the on-chain limit.";
  if (/UnknownEmber/.test(text)) return "That signal is not in this kiln.";
  if (/TipFailed/.test(text)) return "The agent owner could not receive the tip.";
  if (/insufficient funds/i.test(text)) return "Not enough BOT for gas. Mainnet BOT is required.";
  if (/not a Kiln/i.test(text)) return "That address is not a Kiln contract.";
  const line = text.replace(/^Error:\s*/, "").split("\n")[0];
  return line.length > 180 ? `${line.slice(0, 177)}…` : line || "That transaction failed.";
}

export const CREATION_BYTES = (KILN_BYTECODE.length - 2) / 2;
