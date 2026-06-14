import React from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import AppLayout from "../../components/AppLayout";
import { store as addMember } from "@/actions/App/Http/Controllers/GroupMemberController";
import { shortAddress } from "../../lib/metamask";

export default function GroupShow() {
    const { group } = usePage().props;

    return (
        <AppLayout title={group.name}>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
            >
                ← Back to dashboard
            </Link>

            {/* Group header */}
            <section className="mt-4 animate-rise [animation-delay:80ms]">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                    {group.is_owner && (
                        <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-400">
                            Owner
                        </span>
                    )}
                </div>
                {group.description && <p className="mt-2 text-slate-400">{group.description}</p>}
            </section>

            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
                {/* Members */}
                <section className="animate-rise [animation-delay:160ms]">
                    <h2 className="mb-4 text-xl font-semibold">
                        Members <span className="text-slate-500">({group.members.length})</span>
                    </h2>
                    <div className="space-y-3">
                        {group.members.map((m) => (
                            <div
                                key={m.id}
                                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold">
                                        {m.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {m.name}
                                            {m.role === "owner" && (
                                                <span className="ml-2 rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
                                                    owner
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-slate-400">{m.email}</p>
                                    </div>
                                </div>
                                {m.wallet_address ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        {shortAddress(m.wallet_address)}
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500">
                                        no wallet
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Add member */}
                <aside className="animate-rise [animation-delay:240ms]">
                    <AddMemberForm groupId={group.id} />
                </aside>
            </div>
        </AppLayout>
    );
}

function AddMemberForm({ groupId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: "" });

    function submit(e) {
        e.preventDefault();
        post(addMember.url(groupId), { onSuccess: () => reset() });
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
        >
            <h3 className="text-lg font-semibold">Add a member</h3>
            <p className="mt-1 text-sm text-slate-400">
                Enter the email of a registered SafeSplit user.
            </p>
            <div className="mt-4">
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="bob@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
                />
                {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
            </div>
            <button
                type="submit"
                disabled={processing}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
                {processing ? "Adding…" : "Add member"}
            </button>
        </form>
    );
}
