import React from "react";

/**
 * Full-screen auth shell: animated aurora background + centered glass card.
 * Props: title, subtitle, children (form), footer (link row).
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b18] text-slate-100">
            {/* Aurora blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/30 blur-[120px] animate-aurora" />
                <div className="absolute right-[-10rem] top-1/3 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/20 blur-[120px] animate-aurora [animation-delay:-6s]" />
                <div className="absolute bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[130px] animate-aurora [animation-delay:-12s]" />
            </div>

            {/* Subtle grid overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md animate-rise">
                    {/* Brand */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/40 animate-float">
                            <span className="text-2xl font-black">S</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
                        )}
                    </div>

                    {/* Glass card */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">
                        {children}
                    </div>

                    {footer && (
                        <p className="mt-6 text-center text-sm text-slate-400">{footer}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
