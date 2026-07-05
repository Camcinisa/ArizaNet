import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type ActivePage = "faults" | "solution-trackings" | "devices" | "users" | "profile";

type DashboardShellProps = {
    activePage: ActivePage;
    children: ReactNode;
};

function ShellIcon({
    name,
    className = "h-6 w-6",
}: {
    name: "faults" | "solution" | "devices" | "users" | "profile" | "logout";
    className?: string;
}) {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        strokeWidth: 2,
        viewBox: "0 0 24 24",
        "aria-hidden": true,
    };

    const paths = {
        faults: (
            <>
                <path d="M16 21a6 6 0 0 0-12 0" />
                <circle cx="10" cy="8" r="4" />
                <path d="M22 21a5 5 0 0 0-4-4.9" />
            </>
        ),
        solution: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        devices: (
            <>
                <path d="m21 8-9-5-9 5 9 5 9-5Z" />
                <path d="M3 8v8l9 5 9-5V8" />
                <path d="M12 13v8" />
            </>
        ),
        users: (
            <>
                <path d="M16 21a6 6 0 0 0-12 0" />
                <circle cx="10" cy="8" r="4" />
                <path d="M22 21a5 5 0 0 0-4-4.9" />
                <path d="M18 4.5a3 3 0 0 1 0 6" />
            </>
        ),
        profile: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17 15 12l-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
            </>
        ),
    };

    return <svg {...common}>{paths[name]}</svg>;
}

function DashboardShell({ activePage, children }: DashboardShellProps) {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "Admin";
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const items = [
        { id: "faults" as const, label: "Hata Kayıtları", path: "/faults", icon: "faults" as const },
        { id: "solution-trackings" as const, label: "Çözüm Takibi", path: "/solution-trackings", icon: "solution" as const },
        { id: "profile" as const, label: "Profilim", path: "/profile", icon: "profile" as const },
        { id: "devices" as const, label: "Cihaz Yönetimi", path: "/devices", icon: "devices" as const },
        { id: "users" as const, label: "Kullanıcı Yönetimi", path: "/users", icon: "users" as const },
    ];

    return (
        <main className="flex h-screen overflow-hidden bg-[#06111f] text-slate-100">
            <aside className="hidden h-screen w-[252px] shrink-0 border-r border-slate-700/50 bg-[#06111d]/95 lg:flex lg:flex-col">
                <div className="flex h-[178px] flex-col items-center justify-center gap-3 border-b border-slate-700/50 px-6">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-sky-300/30 bg-[#0b1e33] shadow-[0_0_34px_rgba(14,165,233,0.22),inset_0_1px_14px_rgba(255,255,255,0.05)]">
                        <svg aria-hidden="true" viewBox="0 0 96 96" className="h-20 w-20" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M48 12 84 76H12L48 12Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="4" />
                            <path d="M48 34v20" stroke="#fee2e2" strokeWidth="6" />
                            <path d="M48 65h.01" stroke="#fee2e2" strokeWidth="7" />
                        </svg>
                    </div>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-500 bg-clip-text text-[30px] font-extrabold tracking-wide text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                        ArızaNet
                    </span>
                </div>

                <nav className="flex-1 space-y-2 px-4 py-8 text-[17px]">
                    {items.filter((item) => {
                        if (item.id === "devices" || item.id === "users") {
                            return isAdmin;
                        }

                        if (item.id === "profile") {
                            return !isAdmin;
                        }

                        return true;
                    }).map((item) => {
                        const isActive = activePage === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`flex h-14 w-full items-center gap-4 rounded-md px-4 transition ${
                                    isActive
                                        ? "bg-cyan-500/18 font-semibold text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]"
                                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                }`}
                            >
                                <ShellIcon name={item.icon} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex h-14 w-full items-center gap-4 rounded-md border border-slate-600/40 px-4 text-[17px] text-slate-300 transition hover:border-red-400/50 hover:text-red-200"
                    >
                        <ShellIcon name="logout" />
                        Çıkış
                    </button>
                </div>
            </aside>

            <section className="min-w-0 flex-1 overflow-auto">{children}</section>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                    <section className="w-full max-w-md rounded-lg border border-slate-500/45 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Onay</h2>
                                <p className="mt-3 text-[16px] leading-6 text-slate-200">
                                    Çıkmak istediğinize emin misiniz?
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex h-11 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex h-11 items-center justify-center rounded-md bg-red-700 font-bold text-white shadow-[0_0_24px_rgba(220,38,38,0.22)] transition hover:bg-red-600"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default DashboardShell;
