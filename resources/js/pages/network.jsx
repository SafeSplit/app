import React, { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import AppLayout from "../components/AppLayout";

function shortName(address) {
    const m = String(address).match(/node\d+/i);
    return m ? m[0] : address;
}

function portOf(url) {
    return String(url).split(":").pop();
}

export default function Network() {
    const { nodes = [], in_sync, online_count } = usePage().props;

    // Poll every 3s for a live map.
    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ["nodes", "in_sync", "online_count"] });
        }, 3000);
        return () => clearInterval(id);
    }, []);

    return (
        <AppLayout title="Network">
            <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Network</h1>
                    <p className="mt-1 text-slate-400">Live status of the SafeSplit blockchain nodes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        live
                    </span>
                    <span
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            in_sync ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                        }`}
                    >
                        {in_sync ? "in sync" : "syncing…"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">
                        {online_count}/{nodes.length} online
                    </span>
                </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nodes.map((n, i) => (
                    <div
                        key={n.url}
                        className={`animate-rise rounded-3xl border bg-white/5 p-6 backdrop-blur-xl ${
                            n.online ? "border-white/10" : "border-rose-500/30 opacity-80"
                        }`}
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide">
                                    {n.id || `node ${i + 1}`}
                                </h2>
                                <p className="font-mono text-xs text-slate-500">:{portOf(n.url)}</p>
                            </div>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                    n.online
                                        ? "bg-emerald-500/15 text-emerald-300"
                                        : "bg-rose-500/15 text-rose-300"
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        n.online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                                    }`}
                                />
                                {n.online ? "online" : "offline"}
                            </span>
                        </div>

                        {n.online ? (
                            <>
                                <div className="mt-6">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Block height</p>
                                    <p className="text-4xl font-black">{n.chain_height}</p>
                                </div>

                                <div className="mt-4 space-y-1 text-sm">
                                    <Row label="Last block">
                                        <span className="font-mono text-slate-300">
                                            {n.tip ? `${n.tip.slice(0, 12)}…` : "—"}
                                        </span>
                                    </Row>
                                    <Row label="Events seen">
                                        <span className="text-slate-300">{n.events_count}</span>
                                    </Row>
                                </div>

                                <div className="mt-5">
                                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Peers</p>
                                    {n.peers.length === 0 ? (
                                        <p className="text-sm text-slate-500">discovering…</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {n.peers.map((p) => (
                                                <span
                                                    key={p.address}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs"
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            p.active ? "bg-emerald-400" : "bg-slate-600"
                                                        }`}
                                                    />
                                                    {shortName(p.address)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/20 bg-rose-500/5 py-8 text-center">
                                <span className="text-3xl">⚠️</span>
                                <p className="mt-2 text-sm font-medium text-rose-300">Node unreachable</p>
                                <p className="mt-1 text-xs text-slate-500">No response from :{portOf(n.url)}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-slate-500">{label}</span>
            {children}
        </div>
    );
}
