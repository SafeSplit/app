import React, { useMemo, useState } from "react";
import { Link, router, useForm, usePage } from "@inertiajs/react";
import AppLayout from "../../components/AppLayout";
import { store as addMember } from "@/actions/App/Http/Controllers/GroupMemberController";
import { store as createExpense, show as showExpense } from "@/actions/App/Http/Controllers/ExpenseController";
import { store as declareSettlement, accept as acceptSettlement } from "@/actions/App/Http/Controllers/SettlementController";
import { shortAddress } from "../../lib/metamask";

function euro(v) {
    return `€${Number(v).toFixed(2)}`;
}

export default function GroupShow() {
    const { group, expenses = [], settlements = [], auth } = usePage().props;
    const me = auth?.user?.id;

    return (
        <AppLayout title={group.name}>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
            >
                ← Back to dashboard
            </Link>

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

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Main column */}
                <div className="space-y-6">
                    <BalancesCard members={group.members} />
                    <ExpensesCard group={group} expenses={expenses} />
                    <SettlementsCard group={group} settlements={settlements} me={me} />
                </div>

                {/* Side column */}
                <div className="space-y-6">
                    <MembersCard members={group.members} />
                    <AddMemberForm groupId={group.id} />
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- Balances ---------- */

function BalancesCard({ members }) {
    return (
        <Card className="animate-rise [animation-delay:120ms]">
            <h2 className="text-lg font-semibold">Balances</h2>
            <div className="mt-4 space-y-2">
                {members.map((m) => {
                    const b = Number(m.balance);
                    const settled = Math.abs(b) < 0.005;
                    return (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">{m.name}</span>
                            {settled ? (
                                <span className="text-slate-500">settled up</span>
                            ) : b > 0 ? (
                                <span className="font-medium text-emerald-400">gets back {euro(b)}</span>
                            ) : (
                                <span className="font-medium text-rose-400">owes {euro(-b)}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

/* ---------- Expenses ---------- */

function ExpensesCard({ group, expenses }) {
    const [adding, setAdding] = useState(false);

    return (
        <Card className="animate-rise [animation-delay:160ms]">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Expenses</h2>
                <button
                    onClick={() => setAdding((v) => !v)}
                    className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.03] active:scale-95"
                >
                    {adding ? "Close" : "+ Add expense"}
                </button>
            </div>

            {adding && <AddExpenseForm group={group} onDone={() => setAdding(false)} />}

            {expenses.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No expenses yet.</p>
            ) : (
                <div className="mt-4 divide-y divide-white/5">
                    {expenses.map((e) => (
                        <Link
                            key={e.id}
                            href={showExpense.url(e.id)}
                            className="flex items-center justify-between py-3 transition hover:opacity-80"
                        >
                            <div>
                                <p className="font-medium">
                                    {e.description}
                                    {e.status !== "active" && (
                                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                                            {e.status}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Paid by {e.payer.name} · {e.participants_count} participant
                                    {e.participants_count > 1 ? "s" : ""} · {e.created_at}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">{euro(e.amount)}</p>
                                {e.my_status && <StatusDot status={e.my_status} />}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </Card>
    );
}

function AddExpenseForm({ group, onDone }) {
    const members = group.members;
    const { auth } = usePage().props;

    const [payerId, setPayerId] = useState(auth?.user?.id ?? members[0]?.id);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [selected, setSelected] = useState(() => new Set(members.map((m) => m.id)));
    const [amounts, setAmounts] = useState({});
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const total = useMemo(
        () => [...selected].reduce((s, id) => s + (parseFloat(amounts[id]) || 0), 0),
        [selected, amounts],
    );

    function toggle(id) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function splitEqually() {
        const ids = [...selected];
        const amt = parseFloat(amount);
        if (!ids.length || !amt) return;
        const each = Math.floor((amt / ids.length) * 100) / 100;
        const next = {};
        let running = 0;
        ids.forEach((id, i) => {
            // Put the rounding remainder on the last participant.
            const val = i === ids.length - 1 ? Math.round((amt - running) * 100) / 100 : each;
            running += each;
            next[id] = val.toFixed(2);
        });
        setAmounts(next);
    }

    function submit(e) {
        e.preventDefault();
        setError(null);
        const participants = [...selected].map((id) => ({
            user_id: id,
            amount_owed: parseFloat(amounts[id]) || 0,
        }));
        if (!participants.length) return setError("Select at least one participant.");

        setProcessing(true);
        router.post(
            createExpense.url(group.id),
            { payer_id: payerId, description, amount, participants },
            {
                preserveScroll: true,
                onError: (errs) => setError(Object.values(errs)[0] ?? "Could not save the expense."),
                onSuccess: () => onDone?.(),
                onFinish: () => setProcessing(false),
            },
        );
    }

    const totalMatches = Math.abs(total - (parseFloat(amount) || 0)) < 0.005;

    return (
        <form onSubmit={submit} className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4 animate-rise">
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Description">
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Restaurant"
                        className={inputClass}
                    />
                </Field>
                <Field label="Amount (€)">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="80.00"
                        className={inputClass}
                    />
                </Field>
            </div>

            <Field label="Paid by">
                <select value={payerId} onChange={(e) => setPayerId(Number(e.target.value))} className={inputClass}>
                    {members.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#0b1020]">
                            {m.name}
                        </option>
                    ))}
                </select>
            </Field>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Split between</span>
                    <button
                        type="button"
                        onClick={splitEqually}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                    >
                        Split equally
                    </button>
                </div>
                <div className="space-y-2">
                    {members.map((m) => {
                        const on = selected.has(m.id);
                        return (
                            <div key={m.id} className="flex items-center gap-3">
                                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={on}
                                        onChange={() => toggle(m.id)}
                                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500"
                                    />
                                    {m.name}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    disabled={!on}
                                    value={amounts[m.id] ?? ""}
                                    onChange={(e) => setAmounts((p) => ({ ...p, [m.id]: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-right text-sm text-slate-100 outline-none focus:border-brand-400 disabled:opacity-40"
                                />
                            </div>
                        );
                    })}
                </div>
                <p className={`mt-2 text-right text-xs ${totalMatches ? "text-slate-500" : "text-amber-400"}`}>
                    Split total: {euro(total)} / {euro(parseFloat(amount) || 0)}
                </p>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
                {processing ? "Saving…" : "Save expense"}
            </button>
        </form>
    );
}

/* ---------- Settlements ---------- */

function SettlementsCard({ group, settlements, me }) {
    const [declaring, setDeclaring] = useState(false);

    return (
        <Card className="animate-rise [animation-delay:200ms]">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Reimbursements</h2>
                <button
                    onClick={() => setDeclaring((v) => !v)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                    {declaring ? "Close" : "Declare"}
                </button>
            </div>

            {declaring && <DeclareSettlementForm group={group} me={me} onDone={() => setDeclaring(false)} />}

            {settlements.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No reimbursements yet.</p>
            ) : (
                <div className="mt-4 space-y-2">
                    {settlements.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">
                                {s.from.name} → {s.to.name} · <span className="font-medium">{euro(s.amount)}</span>
                            </span>
                            {s.status === "accepted" ? (
                                <span className="text-emerald-400">accepted</span>
                            ) : s.can_accept ? (
                                <button
                                    onClick={() =>
                                        router.post(acceptSettlement.url(s.id), {}, { preserveScroll: true })
                                    }
                                    className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
                                >
                                    Accept
                                </button>
                            ) : (
                                <span className="text-amber-400">declared</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function DeclareSettlementForm({ group, me, onDone }) {
    const others = group.members.filter((m) => m.id !== me);
    const { data, setData, post, processing, errors, reset } = useForm({
        to_user_id: others[0]?.id ?? "",
        amount: "",
    });

    function submit(e) {
        e.preventDefault();
        post(declareSettlement.url(group.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onDone?.();
            },
        });
    }

    return (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 animate-rise">
            <Field label="Pay to">
                <select
                    value={data.to_user_id}
                    onChange={(e) => setData("to_user_id", Number(e.target.value))}
                    className={inputClass}
                >
                    {others.map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#0b1020]">
                            {m.name}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Amount (€)">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    placeholder="20.00"
                    className={inputClass}
                />
                {errors.amount && <p className="mt-1 text-sm text-rose-400">{errors.amount}</p>}
            </Field>
            <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
                {processing ? "Declaring…" : "Declare reimbursement"}
            </button>
        </form>
    );
}

/* ---------- Members ---------- */

function MembersCard({ members }) {
    return (
        <Card className="animate-rise [animation-delay:160ms]">
            <h2 className="text-lg font-semibold">
                Members <span className="text-slate-500">({members.length})</span>
            </h2>
            <div className="mt-4 space-y-3">
                {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold">
                                {m.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {m.name}
                                    {m.role === "owner" && (
                                        <span className="ml-2 rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
                                            owner
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500">{m.email}</p>
                            </div>
                        </div>
                        {m.wallet_address ? (
                            <span className="font-mono text-xs text-emerald-300">
                                {shortAddress(m.wallet_address)}
                            </span>
                        ) : (
                            <span className="text-xs text-slate-600">no wallet</span>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}

function AddMemberForm({ groupId }) {
    const { data, setData, post, processing, errors, reset } = useForm({ email: "" });

    function submit(e) {
        e.preventDefault();
        post(addMember.url(groupId), { preserveScroll: true, onSuccess: () => reset() });
    }

    return (
        <Card className="animate-rise [animation-delay:240ms]">
            <h3 className="text-lg font-semibold">Add a member</h3>
            <p className="mt-1 text-sm text-slate-400">Email of a registered SafeSplit user.</p>
            <form onSubmit={submit} className="mt-4">
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="bob@example.com"
                    className={inputClass}
                />
                {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                    {processing ? "Adding…" : "Add member"}
                </button>
            </form>
        </Card>
    );
}

/* ---------- Shared bits ---------- */

const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40";

function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl ${className}`}>
            {children}
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
            {children}
        </label>
    );
}

function StatusDot({ status }) {
    const map = {
        accepted: ["bg-emerald-500/15 text-emerald-300", "accepted"],
        rejected: ["bg-rose-500/15 text-rose-300", "disputed"],
        pending: ["bg-amber-500/15 text-amber-300", "pending"],
    };
    const [cls, label] = map[status] ?? map.pending;
    return <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}
