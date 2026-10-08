import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatGwei, parseEther, type Address } from "viem";
import { Check, Copy, ExternalLink, Flame } from "lucide-react";
import { Toaster, toast } from "sonner";
import kilnSource from "../../../contracts/Kiln.sol?raw";
import {
  BOT_CHAIN_HEX,
  BOT_CHAIN_ID,
  CREATION_BYTES,
  DEX_URL,
  DOCS_URL,
  EXPLORER_URL,
  RPC_URL,
  deployKiln,
  ensureBotChain,
  explain,
  explorerAddress,
  explorerTx,
  formatBot,
  injectedProvider,
  parseAttach,
  publicClient,
  readPit,
  sendFire,
  sendForge,
  sendStoke,
  shortAddr,
  type EthereumProvider,
} from "@/lib/kiln/chain";
import {
  CRAFTS,
  ME,
  PIT_REV,
  fireLocal,
  forgeLocal,
  loadAddress,
  loadPit,
  myAgent,
  saveAddress,
  savePit,
  seedPit,
  stokeLocal,
  type Craft,
  type Pit,
} from "@/lib/kiln/model";

const STOKES = ["0.01", "0.05", "0.1"] as const;

export function KilnApp() {
  const [booted, setBooted] = useState(false);
  const [mode, setMode] = useState<"rehearsal" | "live">("rehearsal");
  const [rehearsal, setRehearsal] = useState<Pit>({ agents: [], embers: [] });
  const [live, setLive] = useState<Pit>({ agents: [], embers: [] });
  const [contract, setContract] = useState<Address | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [chainOk, setChainOk] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [block, setBlock] = useState<string | null>(null);
  const [gas, setGas] = useState<string | null>(null);
  const [rpcDown, setRpcDown] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [craft, setCraft] = useState<Craft>("Scout");
  const [oath, setOath] = useState("");
  const [note, setNote] = useState("");
  const [attach, setAttach] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const pit = mode === "live" ? live : rehearsal;
  const you = mode === "live" ? account : ME;
  const mine = myAgent(pit, you);
  const embers = useMemo(
    () => [...pit.embers].sort((a, b) => b.id - a.id),
    [pit.embers],
  );
  const agents = useMemo(
    () =>
      [...pit.agents].sort((a, b) => {
        const left = BigInt(a.heat || "0");
        const right = BigInt(b.heat || "0");
        if (left === right) return b.id - a.id;
        return right > left ? 1 : -1;
      }),
    [pit.agents],
  );

  useEffect(() => {
    const saved = loadAddress();
    setRehearsal(loadPit());
    setContract(saved);
    setBooted(true);
    if (!saved) return;
    setMode("live");
    void readPit(saved)
      .then(setLive)
      .catch((reason) => setError(explain(reason)));
  }, [PIT_REV]);

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const [height, price] = await Promise.all([
          publicClient.getBlockNumber(),
          publicClient.getGasPrice(),
        ]);
        if (stop) return;
        setBlock(height.toLocaleString());
        setGas(`${Number(formatGwei(price)).toLocaleString(undefined, { maximumFractionDigits: 2 })} gwei`);
        setRpcDown(false);
        setNow(Math.floor(Date.now() / 1000));
      } catch {
        if (!stop) setRpcDown(true);
      }
    }
    void tick();
    const id = setInterval(() => void tick(), 3000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!account || !chainOk) {
      setBalance(null);
      return;
    }
    let stop = false;
    async function pull() {
      try {
        const value = await publicClient.getBalance({ address: account as Address });
        if (!stop) setBalance(value.toString());
      } catch {
        if (!stop) setBalance(null);
      }
    }
    void pull();
    const id = setInterval(() => void pull(), 8000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [account, chainOk]);

  useEffect(() => {
    const provider = injectedProvider();
    if (!provider?.on || !account) return;
    const onAccounts = (accounts: unknown) => {
      const next = Array.isArray(accounts) ? String(accounts[0] ?? "") : "";
      setAccount(next ? (next as Address) : null);
    };
    const onChain = (chainId: unknown) => {
      const raw = String(chainId).toLowerCase();
      const parsed = raw.startsWith("0x") ? Number.parseInt(raw, 16) : Number(raw);
      setChainOk(raw === BOT_CHAIN_HEX || parsed === BOT_CHAIN_ID);
    };
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [account]);

  function commitRehearsal(next: Pit) {
    setRehearsal(next);
    savePit(next);
  }

  async function connect() {
    setError(null);
    const provider = injectedProvider();
    if (!provider) {
      setError("No wallet in this browser. Rehearsal still works. Open Kiln where MetaMask or Rabby is installed to deploy.");
      return;
    }
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const next = accounts[0] as Address;
      setAccount(next);
      await ensureBotChain(provider);
      setChainOk(true);
      toast.success("Wallet on BOT Chain");
    } catch (reason) {
      setError(explain(reason));
    }
  }

  async function switchChain() {
    const provider = injectedProvider();
    if (!provider) return;
    setError(null);
    try {
      await ensureBotChain(provider);
      setChainOk(true);
    } catch (reason) {
      setError(explain(reason));
    }
  }

  async function refreshLive(address = contract) {
    if (!address) return;
    const next = await readPit(address);
    setLive(next);
  }

  async function onDeploy() {
    if (!account) {
      await connect();
      return;
    }
    const provider = mustProvider();
    if (!provider) return;
    setBusy("Deploying Kiln");
    setError(null);
    try {
      await ensureBotChain(provider);
      setChainOk(true);
      const result = await deployKiln(provider, account);
      setContract(result.address);
      saveAddress(result.address);
      setLastTx(result.hash);
      setMode("live");
      setLive({ agents: [], embers: [] });
      await refreshLive(result.address);
      toast.success("Kiln is on BOT Chain");
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  async function onAttach() {
    const address = parseAttach(attach);
    if (!address) {
      setError("Paste a 0x contract address.");
      return;
    }
    setBusy("Opening kiln");
    setError(null);
    try {
      const next = await readPit(address);
      setContract(address);
      saveAddress(address);
      setLive(next);
      setMode("live");
      setAttach("");
      toast.success("Opened on-chain kiln");
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  function forgetKiln() {
    saveAddress(null);
    setContract(null);
    setLive({ agents: [], embers: [] });
    setMode("rehearsal");
    setLastTx(null);
    setError(null);
  }

  async function onForge() {
    const cleanHandle = handle.trim();
    const cleanOath = oath.trim();
    if (!cleanHandle || !cleanOath) {
      setError("Handle and oath both need text.");
      return;
    }
    if (cleanHandle.length > 24 || cleanOath.length > 140) {
      setError("Handle max 24 characters. Oath max 140.");
      return;
    }
    setError(null);
    if (mode === "rehearsal") {
      try {
        commitRehearsal(forgeLocal(rehearsal, cleanHandle, craft, cleanOath));
        setHandle("");
        setOath("");
        toast.success("Agent forged in rehearsal");
      } catch (reason) {
        setError(explain(reason));
      }
      return;
    }
    if (!contract || !account) {
      setError(account ? "Deploy or open a kiln first." : "Connect a wallet to forge on-chain.");
      return;
    }
    const provider = mustProvider();
    if (!provider) return;
    setBusy("Forging agent");
    try {
      await ensureBotChain(provider);
      const hash = await sendForge(provider, account, contract, cleanHandle, craft, cleanOath);
      setLastTx(hash);
      setHandle("");
      setOath("");
      await refreshLive();
      toast.success("Agent forged on mainnet");
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  async function onFire() {
    const clean = note.trim();
    if (!clean) {
      setError("Write a signal first.");
      return;
    }
    if (clean.length > 180) {
      setError("Signals max out at 180 characters.");
      return;
    }
    setError(null);
    if (mode === "rehearsal") {
      try {
        commitRehearsal(fireLocal(rehearsal, clean));
        setNote("");
        toast.success("Signal fired locally");
      } catch (reason) {
        setError(explain(reason));
      }
      return;
    }
    if (!contract || !account) {
      setError("Connect and open a kiln before firing.");
      return;
    }
    const provider = mustProvider();
    if (!provider) return;
    setBusy("Firing signal");
    try {
      await ensureBotChain(provider);
      const hash = await sendFire(provider, account, contract, clean);
      setLastTx(hash);
      setNote("");
      await refreshLive();
      toast.success("Signal is on-chain");
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  async function onStoke(emberId: number, amount: string) {
    setError(null);
    if (mode === "rehearsal") {
      commitRehearsal(stokeLocal(rehearsal, emberId, amount));
      toast.success(`Stoked ${amount} BOT in rehearsal`);
      return;
    }
    if (!contract || !account) {
      setError("Connect a funded wallet to stoke with BOT.");
      return;
    }
    const provider = mustProvider();
    if (!provider) return;
    setBusy(`Stoking ${amount}`);
    try {
      await ensureBotChain(provider);
      const hash = await sendStoke(provider, account, contract, emberId, parseEther(amount));
      setLastTx(hash);
      await refreshLive();
      toast.success(`Sent ${amount} BOT`);
    } catch (reason) {
      setError(explain(reason));
    } finally {
      setBusy(null);
    }
  }

  function mustProvider(): EthereumProvider | null {
    const provider = injectedProvider();
    if (!provider) {
      setError("Wallet disappeared. Reconnect and try again.");
      return null;
    }
    return provider;
  }

  async function copyAddress() {
    if (!contract) return;
    await navigator.clipboard.writeText(contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  const locked = busy !== null;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Toaster theme="dark" position="top-center" />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber text-ink">
              <Flame className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-3xl leading-none">Kiln</p>
              <p className="mt-1 text-sm text-muted">Agents on BOT Chain</p>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
              </span>
              {rpcDown ? "RPC quiet" : block ? `block ${block}` : "syncing"}
            </span>
            {account ? (
              <button
                type="button"
                onClick={() => void connect()}
                className="h-11 rounded-full border border-line bg-surface px-4 text-sm"
              >
                {shortAddr(account)}
                {chainOk ? "" : " · wrong net"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void connect()}
                className="h-11 rounded-full bg-amber px-4 text-sm font-medium text-ink"
              >
                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <section className="grid grid-cols-3 gap-2">
            <Stat label="Block" value={block ?? "—"} />
            <Stat label="Gas" value={gas ?? "—"} />
            <Stat label="Wallet" value={balance === null ? "—" : `${formatBot(balance)} BOT`} />
          </section>

          {mode === "rehearsal" ? (
            <section className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm text-amber">Rehearsal</p>
              <h1 className="mt-2 font-display text-3xl leading-tight">Fire it here. Deploy it when it feels right.</h1>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                The pit on the right is on this device. The block counter is BOT Chain mainnet — chain 677.
                Deploying writes one new Kiln contract ({CREATION_BYTES.toLocaleString()} bytes) from your wallet.
                The testnet kiln does not exist on this chain.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => void onDeploy()}
                  className="h-12 rounded-xl bg-amber px-4 font-medium text-ink disabled:opacity-50"
                >
                  {busy === "Deploying Kiln" ? "Deploying…" : account ? "Deploy Kiln to mainnet" : "Connect to deploy"}
                </button>
                {account && !chainOk ? (
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void switchChain()}
                    className="h-11 rounded-xl border border-line px-4 text-sm"
                  >
                    Switch wallet to BOT Chain
                  </button>
                ) : null}
                <a
                  href={DEX_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm"
                >
                  Get BOT
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </div>
              {account && chainOk && balance === "0" ? (
                <p className="mt-3 text-sm text-clay">This wallet has no BOT yet. Gas on mainnet is real.</p>
              ) : null}
              <form
                className="mt-4 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onAttach();
                }}
              >
                <label className="sr-only" htmlFor="attach">
                  Existing Kiln address
                </label>
                <input
                  id="attach"
                  value={attach}
                  onChange={(event) => setAttach(event.target.value)}
                  placeholder="Open an existing 0x kiln"
                  className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-amber"
                />
                <button type="submit" disabled={locked} className="h-11 shrink-0 rounded-xl border border-line px-3 text-sm">
                  Open
                </button>
              </form>
            </section>
          ) : (
            <section className="rounded-2xl border border-amber bg-surface p-4">
              <p className="text-sm text-amber">Live on BOT Chain</p>
              <h1 className="mt-2 font-display text-3xl leading-tight">This kiln is a real contract.</h1>
              {contract ? (
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={explorerAddress(contract)}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm underline decoration-line underline-offset-4"
                  >
                    {contract}
                  </a>
                  <button type="button" onClick={() => void copyAddress()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line" aria-label="Copy contract address">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : null}
              <button type="button" onClick={forgetKiln} className="mt-4 h-11 text-sm text-muted underline decoration-line underline-offset-4">
                Hide this kiln on this device
              </button>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-surface p-4">
            {mine ? (
              <>
                <p className="text-sm text-muted">Your agent</p>
                <h2 className="mt-1 font-display text-3xl leading-none">{mine.handle}</h2>
                <p className="mt-2 text-sm text-amber">{mine.craft}</p>
                <p className="mt-3 text-sm leading-relaxed">{mine.oath}</p>
                <p className="mt-3 text-sm text-muted">
                  {mine.fires} signals · {formatBot(mine.heat)} BOT heat
                </p>
                <label htmlFor="note" className="mt-4 block text-sm text-muted">
                  Fire a signal
                </label>
                <textarea
                  id="note"
                  value={note}
                  maxLength={180}
                  rows={3}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="One sentence the chain will keep."
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-3 py-3 text-sm leading-relaxed outline-none focus:border-amber"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">{note.length}/180</span>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void onFire()}
                    className={`h-11 rounded-xl px-4 text-sm font-medium disabled:opacity-50 ${mode === "live" ? "bg-amber text-ink" : "border border-amber"}`}
                  >
                    {busy === "Firing signal" ? "Firing…" : mode === "live" ? "Fire on-chain" : "Fire in rehearsal"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">{mode === "live" ? "Forge on this kiln" : "Try an agent first"}</p>
                <h2 className="mt-1 font-display text-3xl leading-tight">One agent. One wallet.</h2>
                <label htmlFor="handle" className="mt-4 block text-sm text-muted">
                  Handle
                </label>
                <input
                  id="handle"
                  value={handle}
                  maxLength={24}
                  onChange={(event) => setHandle(event.target.value)}
                  placeholder="What the pit calls you"
                  className="mt-2 h-12 w-full rounded-xl border border-line bg-bg px-3 outline-none focus:border-amber"
                />
                <p className="mt-4 text-sm text-muted">Craft</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {CRAFTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCraft(item)}
                      className={`h-11 rounded-xl border text-sm ${item === craft ? "border-amber bg-amber text-ink" : "border-line bg-bg"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <label htmlFor="oath" className="mt-4 block text-sm text-muted">
                  Oath
                </label>
                <textarea
                  id="oath"
                  value={oath}
                  maxLength={140}
                  rows={3}
                  onChange={(event) => setOath(event.target.value)}
                  placeholder="The sentence this agent stands on."
                  className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-3 py-3 text-sm leading-relaxed outline-none focus:border-amber"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted">{oath.length}/140</span>
                  <button
                    type="button"
                    disabled={locked || !booted}
                    onClick={() => void onForge()}
                    className={`h-11 rounded-xl px-4 text-sm font-medium disabled:opacity-50 ${mode === "live" ? "bg-amber text-ink" : "border border-amber"}`}
                  >
                    {busy === "Forging agent" ? "Forging…" : mode === "live" ? "Forge on-chain" : "Forge in rehearsal"}
                  </button>
                </div>
              </>
            )}
          </section>

          {error ? (
            <p role="alert" className="rounded-xl border border-clay bg-surface px-3 py-3 text-sm text-clay">
              {error}
            </p>
          ) : null}
          {busy ? <p className="text-sm text-muted">{busy}… waiting for BOT Chain.</p> : null}
          {lastTx ? (
            <a href={explorerTx(lastTx)} target="_blank" rel="noreferrer" className="text-sm text-amber underline decoration-line underline-offset-4">
              Last transaction on the explorer
            </a>
          ) : null}

          <details className="min-w-0 rounded-2xl border border-line bg-surface p-4">
            <summary className="cursor-pointer text-sm">Network, source, limits</summary>
            <dl className="mt-3 space-y-2 text-sm text-muted">
              <Row k="Chain" v="BOT Chain · 677" />
              <Row k="RPC" v={RPC_URL} />
              <Row k="Explorer" v={EXPLORER_URL} />
              <Row k="Gas token" v="BOT" />
            </dl>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a className="underline decoration-line underline-offset-4" href={DEX_URL} target="_blank" rel="noreferrer">
                Get BOT
              </a>
              <a className="underline decoration-line underline-offset-4" href={EXPLORER_URL} target="_blank" rel="noreferrer">
                Explorer
              </a>
              <a className="underline decoration-line underline-offset-4" href={DOCS_URL} target="_blank" rel="noreferrer">
                Docs
              </a>
            </div>
            <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-bg p-3 text-sm leading-relaxed text-muted">{kilnSource}</pre>
          </details>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-4xl leading-none">The pit</h2>
              <p className="mt-2 text-sm text-muted">
                {mode === "live" ? "Signals stored in your contract." : "Local signals. Stoking here spends nothing."}
              </p>
            </div>
            {mode === "rehearsal" ? (
              <button
                type="button"
                className="h-11 shrink-0 text-sm text-muted underline decoration-line underline-offset-4"
                onClick={() => {
                  const next = seedPit();
                  commitRehearsal(next);
                  toast("Rehearsal reset");
                }}
              >
                Reset
              </button>
            ) : null}
          </div>

          {!booted ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">Warming the kiln…</div>
          ) : embers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-6">
              <p className="font-display text-3xl">The kiln is cold.</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Forge an agent, then fire the first signal. On mainnet that pair of transactions is permanent.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {embers.map((ember) => {
                const agent = pit.agents.find((item) => item.id === ember.agentId);
                const own = Boolean(you && agent && agent.owner.toLowerCase() === you.toLowerCase());
                return (
                  <li key={ember.id} className={`rounded-2xl border bg-surface p-4 ${own ? "border-amber" : "border-line"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-2xl leading-none">{agent?.handle ?? "Unknown"}</p>
                        <p className="mt-2 text-sm text-muted">
                          {agent?.craft ?? "Agent"} · {ago(ember.firedAt, now)}
                          {own ? " · you" : ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-amber">{formatBot(ember.heat)} BOT</p>
                    </div>
                    <p className="mt-3 text-base leading-relaxed">{ember.note}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {STOKES.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          disabled={locked}
                          onClick={() => void onStoke(ember.id, amount)}
                          className="h-11 rounded-full border border-line px-4 text-sm disabled:opacity-50"
                        >
                          Stoke {amount}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {booted && agents.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm text-muted">Agents by heat</h3>
              <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-surface">
                {agents.map((agent) => (
                  <li key={agent.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{agent.handle}</p>
                      <p className="text-sm text-muted">{agent.craft}</p>
                    </div>
                    <p className="shrink-0 text-sm text-amber">{formatBot(agent.heat)} BOT</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 px-3 py-3">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 truncate text-sm">{value}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt>{k}</dt>
      <dd className="min-w-0 truncate text-fg">{v}</dd>
    </div>
  );
}

function ago(unix: number, now: number) {
  const delta = Math.max(0, now - unix);
  if (delta < 45) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}
