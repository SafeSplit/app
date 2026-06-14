import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { connectWallet, shortAddress, hasMetaMask } from "../lib/metamask";

const ERRORS = {
    METAMASK_MISSING: "MetaMask isn't installed. Add the browser extension to continue.",
    USER_REJECTED: "Connection request was rejected.",
    NO_ACCOUNTS: "No account was returned by MetaMask.",
};

/**
 * MetaMask connect card. Props:
 *   - walletAddress: the user's already-linked address (or null)
 */
export default function ConnectMetaMask({ walletAddress }) {
    const [status, setStatus] = useState(walletAddress ? "connected" : "idle");
    const [address, setAddress] = useState(walletAddress ?? null);
    const [error, setError] = useState(null);

    const connected = status === "connected";
    const connecting = status === "connecting" || status === "saving";

    async function handleConnect() {
        setError(null);
        setStatus("connecting");
        try {
            const addr = await connectWallet();
            setAddress(addr);
            setStatus("saving");
            router.post(
                "/wallet",
                { wallet_address: addr },
                {
                    preserveScroll: true,
                    onSuccess: () => setStatus("connected"),
                    onError: (errs) => {
                        setError(errs.wallet_address ?? "Could not save the address.");
                        setStatus("idle");
                    },
                },
            );
        } catch (e) {
            setError(ERRORS[e.message] ?? "Something went wrong connecting to MetaMask.");
            setStatus("idle");
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            {/* glow */}
            <div
                className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-colors duration-700 ${
                    connected ? "bg-emerald-400/30" : "bg-amber-400/25"
                }`}
            />

            <div className="relative flex items-start gap-4">
                {/* Fox badge */}
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-lg transition-all duration-500 ${
                        connected
                            ? "bg-emerald-500/20 shadow-emerald-500/30"
                            : "bg-amber-500/15 shadow-amber-500/20 animate-float"
                    }`}
                >
                    🦊
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">
                        {connected ? "Wallet connected" : "Connect your wallet"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        {connected
                            ? "Your MetaMask address is linked to SafeSplit."
                            : "Link MetaMask to sign your expenses on the SafeSplit Local network."}
                    </p>

                    {/* Address pill */}
                    {address && (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 font-mono text-sm animate-pop">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    connected ? "bg-emerald-400" : "bg-amber-400"
                                } ${connected ? "" : "animate-pulse"}`}
                            />
                            {shortAddress(address)}
                        </div>
                    )}

                    {error && (
                        <p className="mt-3 text-sm text-rose-400 animate-rise">{error}</p>
                    )}

                    {/* Action */}
                    {!connected && (
                        <button
                            type="button"
                            onClick={handleConnect}
                            disabled={connecting}
                            className="group relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-5 py-3 font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
                        >
                            {/* shimmer */}
                            <span
                                className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer"
                                aria-hidden
                            />
                            <span className="relative flex items-center gap-2">
                                {connecting ? (
                                    <>
                                        <Spinner />
                                        {status === "saving" ? "Saving…" : "Connecting…"}
                                    </>
                                ) : (
                                    <>🦊 Connect MetaMask</>
                                )}
                            </span>
                        </button>
                    )}

                    {connected && (
                        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 animate-pop">
                            <CheckIcon /> Linked
                        </div>
                    )}

                    {!hasMetaMask() && status === "idle" && (
                        <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 block text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline"
                        >
                            Don't have MetaMask? Get it here →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}
