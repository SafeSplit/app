import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";

/**
 * Shared shell for authenticated pages: aurora background, branded header,
 * and a consistent max-width container.
 * Props: title (Head), children.
 */
export default function AppLayout({ title, children }) {
    const page = usePage();
    const user = page.props.auth?.user;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b18] text-slate-100">
            {title && <Head title={title} />}

            {/* Aurora background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-40 h-[26rem] w-[26rem] rounded-full bg-brand-500/25 blur-[120px] animate-aurora" />
                <div className="absolute bottom-[-12rem] right-1/4 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-[130px] animate-aurora [animation-delay:-9s]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-5 py-8">
                <header className="flex items-center justify-between animate-rise">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-black shadow-lg shadow-brand-500/40">
                                S
                            </div>
                            <span className="text-lg font-semibold tracking-tight">SafeSplit</span>
                        </Link>
                        <nav className="hidden items-center gap-1 sm:flex">
                            <NavLink href="/dashboard" active={page.url.startsWith("/dashboard")}>
                                Dashboard
                            </NavLink>
                            <NavLink href="/network" active={page.url.startsWith("/network")}>
                                Network
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-slate-400 sm:block">{user?.name}</span>
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

                <main className="mt-8">{children}</main>
            </div>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
        >
            {children}
        </Link>
    );
}
