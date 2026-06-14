import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AppLayout from "../../components/AppLayout";
import { accept as acceptSplit, reject as rejectSplit } from "@/actions/App/Http/Controllers/ExpenseSplitController";
import { show as showGroup } from "@/actions/App/Http/Controllers/GroupController";

function euro(v) {
    return `€${Number(v).toFixed(2)}`;
}

export default function ExpenseShow() {
    const { expense, my_split } = usePage().props;

    const canRespond = my_split && !my_split.is_payer && expense.status === "active";

    function respond(action) {
        const url = action === "accept" ? acceptSplit.url(expense.id) : rejectSplit.url(expense.id);
        router.post(url, {}, { preserveScroll: true });
    }

    return (
        <AppLayout title={expense.description}>
            <Link
                href={showGroup.url(expense.group_id)}
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
            >
                ← {expense.group_name}
            </Link>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Detail */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-rise">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{expense.description}</h1>
                                <p className="mt-1 text-sm text-slate-400">
                                    Paid by {expense.payer.name} · {expense.created_at}
                                </p>
                            </div>
                            <ExpenseStatus status={expense.status} />
                        </div>
                        <p className="mt-6 text-4xl font-black">{euro(expense.amount)}</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-rise [animation-delay:120ms]">
                        <h2 className="text-lg font-semibold">Split</h2>
                        <div className="mt-4 divide-y divide-white/5">
                            {expense.splits.map((s) => (
                                <div key={s.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold">
                                            {s.user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm">
                                            {s.user.name}
                                            {s.is_payer && (
                                                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                                                    payer
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{euro(s.amount_owed)}</span>
                                        <SplitStatus status={s.status} isPayer={s.is_payer} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action panel */}
                <aside className="animate-rise [animation-delay:160ms]">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h3 className="text-lg font-semibold">Your share</h3>
                        {!my_split ? (
                            <p className="mt-2 text-sm text-slate-400">You are not part of this expense.</p>
                        ) : my_split.is_payer ? (
                            <p className="mt-2 text-sm text-slate-400">You paid for this expense.</p>
                        ) : (
                            <>
                                <p className="mt-2 text-sm text-slate-400">
                                    Current status: <SplitStatus status={my_split.status} />
                                </p>
                                {canRespond && (
                                    <div className="mt-4 flex gap-3">
                                        <button
                                            onClick={() => respond("accept")}
                                            className="flex-1 rounded-xl bg-emerald-500/20 px-4 py-2.5 font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => respond("reject")}
                                            className="flex-1 rounded-xl bg-rose-500/20 px-4 py-2.5 font-semibold text-rose-300 transition hover:bg-rose-500/30"
                                        >
                                            Dispute
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </aside>
            </div>
        </AppLayout>
    );
}

function ExpenseStatus({ status }) {
    const map = {
        active: ["bg-emerald-500/15 text-emerald-300", "active"],
        cancelled: ["bg-rose-500/15 text-rose-300", "cancelled"],
        replaced: ["bg-white/10 text-slate-400", "replaced"],
    };
    const [cls, label] = map[status] ?? map.active;
    return <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

function SplitStatus({ status, isPayer }) {
    if (isPayer) return <span className="text-xs text-slate-400">paid</span>;
    const map = {
        accepted: ["text-emerald-400", "accepted"],
        rejected: ["text-rose-400", "disputed"],
        pending: ["text-amber-400", "pending"],
    };
    const [cls, label] = map[status] ?? map.pending;
    return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
}
