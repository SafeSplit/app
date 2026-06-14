import React, { useState } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppLayout from "../components/AppLayout";
import ConnectMetaMask from "../components/ConnectMetaMask";
import { store as createGroup, show as showGroup } from "@/actions/App/Http/Controllers/GroupController";

export default function Dashboard() {
    const { auth, groups = [] } = usePage().props;
    const user = auth?.user;
    const [creating, setCreating] = useState(false);

    return (
        <AppLayout title="Dashboard">
            {/* Hero */}
            <section className="animate-rise [animation-delay:80ms]">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Welcome, {user?.name?.split(" ")[0] ?? "there"} 👋
                </h1>
                <p className="mt-2 max-w-xl text-slate-400">
                    Create a group, add members, and start splitting expenses you can prove.
                </p>
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Groups */}
                <section className="lg:col-span-2 animate-rise [animation-delay:160ms]">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Your groups</h2>
                        <button
                            onClick={() => setCreating((v) => !v)}
                            className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.03] active:scale-95"
                        >
                            {creating ? "Close" : "+ New group"}
                        </button>
                    </div>

                    {creating && <CreateGroupForm onDone={() => setCreating(false)} />}

                    {groups.length === 0 ? (
                        <EmptyGroups />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {groups.map((g) => (
                                <Link
                                    key={g.id}
                                    href={showGroup.url(g.id)}
                                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-white/10"
                                >
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-semibold group-hover:text-brand-400">
                                            {g.name}
                                        </h3>
                                        <RoleBadge role={g.role} />
                                    </div>
                                    {g.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                                            {g.description}
                                        </p>
                                    )}
                                    <p className="mt-4 text-xs text-slate-500">
                                        {g.members_count} member{g.members_count > 1 ? "s" : ""}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* MetaMask */}
                <aside className="animate-rise [animation-delay:240ms]">
                    <ConnectMetaMask walletAddress={user?.wallet_address ?? null} />
                </aside>
            </div>
        </AppLayout>
    );
}

function CreateGroupForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
    });

    function submit(e) {
        e.preventDefault();
        post(createGroup.url(), {
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    }

    return (
        <form
            onSubmit={submit}
            className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl animate-rise"
        >
            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Group name</label>
                    <input
                        autoFocus
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Week-end à Lyon"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-rose-400">{errors.name}</p>}
                </div>
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                        Description <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                        placeholder="Trip with friends"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                    />
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                    {processing ? "Creating…" : "Create group"}
                </button>
            </div>
        </form>
    );
}

function EmptyGroups() {
    return (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                🧾
            </div>
            <p className="font-medium">No groups yet</p>
            <p className="mt-1 text-sm text-slate-400">Create your first group to get started.</p>
        </div>
    );
}

function RoleBadge({ role }) {
    const owner = role === "owner";
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                owner ? "bg-brand-500/20 text-brand-400" : "bg-white/10 text-slate-300"
            }`}
        >
            {owner ? "Owner" : "Member"}
        </span>
    );
}
