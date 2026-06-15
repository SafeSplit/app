import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { store as saveWallet } from "@/actions/App/Http/Controllers/WalletController";
import {
    connectWallet,
    getCurrentAccount,
    onAccountsChanged,
    shortAddress,
    hasMetaMask,
} from "../lib/metamask";

const ERRORS = {
    METAMASK_MISSING: "MetaMask isn't installed. Add the browser extension to continue.",
    USER_REJECTED: "Connection request was rejected.",
    NO_ACCOUNTS: "No account was returned by MetaMask.",
};

/**
 * MetaMask connect / link card.
 * Props: walletAddress — the address linked to the SafeSplit account (or null).
 */
export default function ConnectMetaMask({ walletAddress }) {
    const linked = walletAddress ?? null;
    const [active, setActive] = useState(null); // live MetaMask account
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsub = () => {};
        getCurrentAccount().then(setActive).catch(() => {});
        unsub = onAccountsChanged(setActive);
        return () => unsub();
    }, []);

    const matched = linked && active && active === linked;
    const drift = linked && active && active !== linked;
    const locked = linked && !active;

    function persist(address) {
        setBusy(true);
        router.post(
            saveWallet.url(),
            { wallet_address: address },
            {
                preserveScroll: true,
                onError: (errs) => setError(errs.wallet_address ?? "Could not save the address."),
                onFinish: () => setBusy(false),
            },
        );
    }

    async function link() {
        setError(null);
        setBusy(true);
        try {
            const addr = await connectWallet();
            setActive(addr);
            persist(addr);
        } catch (e) {
            setError(ERRORS[e.message] ?? "Something went wrong connecting to MetaMask.");
            setBusy(false);
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div
                className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl transition-colors duration-700 ${
                    matched ? "bg-emerald-400/30" : drift ? "bg-amber-400/30" : "bg-amber-400/20"
                }`}
            />

            <div className="relative flex items-start gap-4">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-lg transition-all duration-500 ${
                        matched ? "bg-emerald-500/20 shadow-emerald-500/30" : "bg-amber-500/15 shadow-amber-500/20 animate-float"
                    }`}
                >
                    🦊
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">
                        {matched ? "Wallet connected" : drift ? "Different account active" : "Connect your wallet"}
                    </h3>

                    {/* Linked address */}
                    {linked && (
                        <p className="mt-1 text-sm text-slate-400">
                            Linked: <span className="font-mono text-slate-300">{shortAddress(linked)}</span>
                        </p>
                    )}

                    {/* Drift warning */}
                    {drift && (
                        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200 animate-rise">
                            MetaMask is on{" "}
                            <span className="font-mono">{shortAddress(active)}</span>, which isn't your linked
                            wallet. Switch back in MetaMask, or link this account instead.
                            <button
                                onClick={() => persist(active)}
                                disabled={busy}
                                className="mt-3 block w-full rounded-lg bg-amber-400/90 px-4 py-2 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
                            >
                                {busy ? "Linking…" : `Use ${shortAddress(active)} instead`}
                            </button>
                        </div>
                    )}

                    {/* Matched confirmation */}
                    {matched && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-sm text-emerald-300 animate-pop">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {shortAddress(active)} active
                        </div>
                    )}

                    {/* Locked */}
                    {locked && (
                        <p className="mt-3 text-sm text-amber-300">
                            MetaMask is locked or disconnected. Unlock it to sign.
                        </p>
                    )}

                    {/* Not linked yet */}
                    {!linked && (
                        <p className="mt-1 text-sm text-slate-400">
                            Link MetaMask to sign your expenses on the SafeSplit Local network.
                        </p>
                    )}

                    {error && <p className="mt-3 text-sm text-rose-400 animate-rise">{error}</p>}

                    {/* Connect button (only when nothing is linked) */}
                    {!linked && (
                        <button
                            type="button"
                            onClick={link}
                            disabled={busy}
                            className="group relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-5 py-3 font-semibold text-black shadow-lg shadow-amber-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
                        >
                            <span
                                className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer"
                                aria-hidden
                            />
                            <span className="relative">{busy ? "Connecting…" : "🦊 Connect MetaMask"}</span>
                        </button>
                    )}

                    {!hasMetaMask() && (
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
