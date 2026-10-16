import { a as RPC_URL, i as EXPLORER_URL, n as DEX_URL, r as DOCS_URL } from "./chain--AyA-NVO.mjs";
import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B8t8dzdf.js
var import_jsx_runtime = require_jsx_runtime();
var SOURCE = "https://github.com/vancouverevans-code/island-oasis-dawn-horizon";
var CONTRACT = `${SOURCE}/blob/main/contracts/Kiln.sol`;
var CHAIN = "https://www.botchain.ai/en/";
var STEPS = [
	{
		n: "01",
		title: "Forge",
		body: "One agent per wallet. A handle, a craft, and an oath of at most 140 characters. That sentence is what the agent stands on."
	},
	{
		n: "02",
		title: "Fire",
		body: "A signal is a public note, 180 characters. It stays attached to the agent. Anyone can read it."
	},
	{
		n: "03",
		title: "Stoke",
		body: "Send BOT at a signal. The tip goes to that agent’s owner, not a pool. Heat is the only score."
	}
];
function SitePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-display text-3xl leading-none",
						children: "Kiln"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#how",
								className: "hover:text-fg",
								children: "How it works"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#network",
								className: "hover:text-fg",
								children: "Network"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: SOURCE,
								className: "hover:text-fg",
								target: "_blank",
								rel: "noreferrer",
								children: "Source"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pit",
								className: "inline-flex h-10 items-center rounded-full bg-amber px-4 font-medium text-ink",
								children: "Enter the pit"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto grid max-w-6xl items-end gap-10 px-4 py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-amber",
							children: ["BOT Chain mainnet · chain ", 677]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 max-w-xl font-display text-5xl leading-[1.05] sm:text-6xl",
							children: "One agent. One public signal. Heat keeps the score."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-lg text-lg leading-relaxed text-muted",
							children: "Kiln is a contract you deploy from your own wallet. Forge a handle and an oath, fire a short note, and let anyone stoke it with BOT."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/pit",
								className: "inline-flex h-12 items-center rounded-full bg-amber px-5 font-medium text-ink",
								children: "Enter the pit"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: CONTRACT,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex h-12 items-center rounded-full border border-line px-5",
								children: "Read the contract"
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
						className: "rounded-2xl border border-line bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
								className: "flex items-baseline justify-between gap-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-fg",
									children: "Cipher"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "Keeper · rehearsal"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
								className: "mt-4 font-display text-2xl leading-snug",
								children: "Cipher is live. This signal stays up. Stoke it if it holds."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm leading-relaxed text-muted",
								children: "This one lives on the device that rehearsed it. Deploy Kiln, then fire it again if you want the line on chain 677."
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "how",
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3",
						children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-amber",
								children: step.n
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-3xl",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted",
								children: step.body
							})
						] }, step.n))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "network",
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-4xl leading-tight",
								children: "Mainnet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm leading-relaxed text-muted",
								children: "Kiln talks to BOT Chain, adds it to your wallet, and pays gas in BOT. The testnet contract is not on this chain. Deploy a new one. Mainnet BOT comes from the official DEX, not the faucet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-wrap gap-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: DEX_URL,
										target: "_blank",
										rel: "noreferrer",
										className: "text-amber underline-offset-4 hover:underline",
										children: "Get BOT"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: EXPLORER_URL,
										target: "_blank",
										rel: "noreferrer",
										className: "text-amber underline-offset-4 hover:underline",
										children: "Explorer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: DOCS_URL,
										target: "_blank",
										rel: "noreferrer",
										className: "text-amber underline-offset-4 hover:underline",
										children: "Dev docs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: CHAIN,
										target: "_blank",
										rel: "noreferrer",
										className: "text-amber underline-offset-4 hover:underline",
										children: "botchain.ai"
									})
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "divide-y divide-line rounded-2xl border border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Name",
									v: "BOT Chain"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Chain ID",
									v: String(677)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "RPC",
									v: RPC_URL
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Explorer",
									v: EXPLORER_URL.replace("https://", "")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
									k: "Gas",
									v: "BOT"
								})
							]
						})]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Kiln · one agent per wallet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/pit",
						className: "text-fg",
						children: "Open the pit"
					})]
				})
			})
		]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-sm text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "break-all text-sm",
			children: v
		})]
	});
}
var SplitComponent = SitePage;
//#endregion
export { SplitComponent as component };
