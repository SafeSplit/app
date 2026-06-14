import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import ConnectMetaMask from "../components/ConnectMetaMask";

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b18] text-slate-100">
            {/* Aurora background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-40 h-[26rem] w-[26rem] rounded-full bg-brand-500/25 blur-[120px] animate-aurora" />
                <div className="absolute bottom-[-12rem] right-1/4 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-[130px] animate-aurora [animation-delay:-9s]" />
            </div>

            <Head title="Dashboard" />

            <div className="relative z-10 mx-auto max-w-5xl px-5 py-8">
                {/* Top bar */}
                <header className="flex items-center justify-between animate-rise">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-black shadow-lg shadow-brand-500/40">
                            S
                        </div>
                        <span className="text-lg font-semibold tracking-tight">SafeSplit</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-slate-400 sm:block">
                            {user?.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                        >
                            Log out
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <section className="mt-12 animate-rise [animation-delay:80ms]">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Welcome, {user?.name?.split(" ")[0] ?? "there"} 👋
                    </h1>
                    <p className="mt-2 max-w-xl text-slate-400">
                        Link your wallet to start declaring expenses that are cryptographically
                        signed and anchored — impossible to alter after the fact.
                    </p>
                </section>

                {/* Cards */}
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <div className="animate-rise [animation-delay:160ms]">
                        <ConnectMetaMask walletAddress={user?.wallet_address ?? null} />
                    </div>

                    <div className="animate-rise rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl [animation-delay:240ms]">
                        <h3 className="text-lg font-semibold">Coming next</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-3">
                                <Dot /> Create a group &amp; add members
                            </li>
                            <li className="flex items-center gap-3">
                                <Dot /> Declare &amp; split expenses
                            </li>
                            <li className="flex items-center gap-3">
                                <Dot /> Sign with MetaMask &amp; anchor on-chain
                            </li>
                            <li className="flex items-center gap-3">
                                <Dot /> Tamper detection &amp; audit
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Dot() {
    return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />;
}
