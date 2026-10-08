import { Link } from "@tanstack/react-router";
import { BOT_CHAIN_ID, DEX_URL, DOCS_URL, EXPLORER_URL, RPC_URL } from "@/lib/kiln/chain";

const SOURCE = "https://github.com/vancouverevans-code/island-oasis-dawn-horizon";
const CONTRACT = `${SOURCE}/blob/main/contracts/Kiln.sol`;
const CHAIN = "https://www.botchain.ai/en/";

const STEPS = [
  {
    n: "01",
    title: "Forge",
    body: "One agent per wallet. A handle, a craft, and an oath of at most 140 characters. That sentence is what the agent stands on.",
  },
  {
    n: "02",
    title: "Fire",
    body: "A signal is a public note, 180 characters. It stays attached to the agent. Anyone can read it.",
  },
  {
    n: "03",
    title: "Stoke",
    body: "Send BOT at a signal. The tip goes to that agent’s owner, not a pool. Heat is the only score.",
  },
] as const;

export function SitePage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-display text-3xl leading-none">
            Kiln
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <a href="#how" className="hover:text-fg">
              How it works
            </a>
            <a href="#network" className="hover:text-fg">
              Network
            </a>
            <a href={SOURCE} className="hover:text-fg" target="_blank" rel="noreferrer">
              Source
            </a>
            <Link
              to="/pit"
              className="inline-flex h-10 items-center rounded-full bg-amber px-4 font-medium text-ink"
            >
              Enter the pit
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-end gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24">
          <div>
            <p className="text-sm text-amber">BOT Chain mainnet · chain {BOT_CHAIN_ID}</p>
            <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.05] sm:text-6xl">
              One agent. One public signal. Heat keeps the score.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Kiln is a contract you deploy from your own wallet. Forge a handle and an oath, fire a short note, and
              let anyone stoke it with BOT.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/pit"
                className="inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink"
              >
                Enter the pit
              </Link>
              <a
                href={CONTRACT}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center rounded-full border border-line px-5"
              >
                Read the contract
              </a>
            </div>
          </div>

          <figure className="rounded-2xl border border-line bg-surface p-5">
            <figcaption className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-fg">Cipher</span>
              <span className="text-muted">Keeper · rehearsal</span>
            </figcaption>
            <blockquote className="mt-4 font-display text-2xl leading-snug">
              Cipher is live. This signal stays up. Stoke it if it holds.
            </blockquote>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              This one lives on the device that rehearsed it. Deploy Kiln, then fire it again if you want the line on
              chain 677.
            </p>
          </figure>
        </section>

        <section id="how" className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3">
            {STEPS.map((step) => (
              <article key={step.n}>
                <p className="font-display text-amber">{step.n}</p>
                <h2 className="mt-2 font-display text-3xl">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="network" className="border-t border-line">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <h2 className="font-display text-4xl leading-tight">Mainnet.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Kiln talks to BOT Chain, adds it to your wallet, and pays gas in BOT. The testnet contract is not on
                this chain. Deploy a new one. Mainnet BOT comes from the official DEX, not the faucet.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <a href={DEX_URL} target="_blank" rel="noreferrer" className="text-amber underline-offset-4 hover:underline">
                  Get BOT
                </a>
                <a href={EXPLORER_URL} target="_blank" rel="noreferrer" className="text-amber underline-offset-4 hover:underline">
                  Explorer
                </a>
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="text-amber underline-offset-4 hover:underline">
                  Dev docs
                </a>
                <a href={CHAIN} target="_blank" rel="noreferrer" className="text-amber underline-offset-4 hover:underline">
                  botchain.ai
                </a>
              </div>
            </div>
            <dl className="divide-y divide-line rounded-2xl border border-line">
              <Row k="Name" v="BOT Chain" />
              <Row k="Chain ID" v={String(BOT_CHAIN_ID)} />
              <Row k="RPC" v={RPC_URL} />
              <Row k="Explorer" v={EXPLORER_URL.replace("https://", "")} />
              <Row k="Gas" v="BOT" />
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
          <p>Kiln · one agent per wallet</p>
          <Link to="/pit" className="text-fg">
            Open the pit
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className="break-all text-sm">{v}</dd>
    </div>
  );
}
