import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "../../components/AuthLayout";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    function submit(e) {
        e.preventDefault();
        post("/register", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start splitting expenses you can prove"
            footer={
                <>
                    Already have an account?
                    <Link
                        href="/login"
                        className="font-semibold text-brand-400 hover:text-brand-500"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <Head title="Create account" />

            <form onSubmit={submit} className="stagger space-y-5">
                <div style={{ "--i": 1 }}>
                    <Label>Name</Label>
                    <Input
                        autoComplete="name"
                        autoFocus
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Alice"
                    />
                    <Error message={errors.name} />
                </div>

                <div style={{ "--i": 2 }}>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@example.com"
                    />
                    <Error message={errors.email} />
                </div>

                <div style={{ "--i": 3 }}>
                    <Label>Password</Label>
                    <Input
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                    />
                    <Error message={errors.password} />
                </div>

                <div style={{ "--i": 4 }}>
                    <Label>Confirm password</Label>
                    <Input
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        placeholder="••••••••"
                    />
                </div>

                <button
                    style={{ "--i": 5 }}
                    type="submit"
                    disabled={processing}
                    className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                >
                    {processing ? "Creating account…" : "Create account"}
                </button>
            </form>
        </AuthLayout>
    );
}

function Label({ children }) {
    return (
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
            {children}
        </label>
    );
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
