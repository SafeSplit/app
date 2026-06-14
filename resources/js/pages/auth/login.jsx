import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "../../components/AuthLayout";

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post("/login", { onFinish: () => reset("password") });
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your SafeSplit account"
            footer={
                <>
                    New to SafeSplit?{" "}
                    <Link href="/register" className="font-semibold text-brand-400 hover:text-brand-500">
                        Create an account
                    </Link>
                </>
            }
        >
            <Head title="Sign in" />

            <form onSubmit={submit} className="stagger space-y-5">
                <div style={{ "--i": 1 }}>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@example.com"
                    />
                    <Error message={errors.email} />
                </div>

                <div style={{ "--i": 2 }}>
                    <Label>Password</Label>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                    />
                    <Error message={errors.password} />
                </div>

                <label
                    style={{ "--i": 3 }}
                    className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-400"
                >
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData("remember", e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500"
                    />
                    Remember me
                </label>

                <button
                    style={{ "--i": 4 }}
                    type="submit"
                    disabled={processing}
                    className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                    {processing ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </AuthLayout>
    );
}

function Label({ children }) {
    return <label className="mb-1.5 block text-sm font-medium text-slate-300">{children}</label>;
}

function Input(props) {
    return (
        <input
            {...props}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/40"
        />
    );
}

function Error({ message }) {
    if (!message) return null;
    return <p className="mt-1.5 text-sm text-rose-400">{message}</p>;
}
