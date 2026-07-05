import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import DashboardShell from "../../../app/DashboardShell";
import { useAuthStore } from "../../../store/authStore";
import { createUser, getUsers, updateUserContact, updateUserStatus } from "../services/userService";
import type { CreateUserRequest, UpdateUserContactRequest, UserListItem } from "../types/user.types";

type StatusFilter = "all" | "active" | "passive";

type UserForm = {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    password: string;
};

type ContactForm = {
    email: string;
    phone: string;
};

const emptyForm: UserForm = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "User",
    password: "",
};

const emptyContactForm: ContactForm = {
    email: "",
    phone: "",
};

const PAGE_SIZE = 8;
const MANAGED_ROLES = ["Admin", "Teknisyen"];

const fallbackUsers: UserListItem[] = [
    {
        id: 1,
        fullName: "Ayşe Yılmaz",
        username: "ayse.yilmaz",
        email: "ayse.yilmaz@arizanet.com",
        phone: "+90 555 123 45 67",
        role: "Admin",
        active: true,
        status: "Sistem Yöneticisi",
    },
    {
        id: 2,
        fullName: "Zeynep Demir",
        username: "zeynep.demir",
        email: "zeynep.demir@arizanet.com",
        phone: "+90 555 987 65 43",
        role: "User",
        active: true,
        status: "Saha Kullanıcısı",
    },
    {
        id: 3,
        fullName: "Ali Çelik",
        username: "ali.celik",
        email: "ali.celik@arizanet.com",
        phone: "+90 555 456 11 22",
        role: "Teknisyen",
        active: false,
        status: "Teknik Servis",
    },
    {
        id: 4,
        fullName: "Elif Şahin",
        username: "elif.sahin",
        email: "elif.sahin@arizanet.com",
        phone: "+90 555 441 70 18",
        role: "User",
        active: true,
        status: "Operasyon",
    },
    {
        id: 5,
        fullName: "Mehmet Kaya",
        username: "mehmet.kaya",
        email: "mehmet.kaya@arizanet.com",
        phone: "+90 555 230 66 10",
        role: "Admin",
        active: true,
        status: "Yetkili",
    },
];

function Icon({
    name,
    className = "h-5 w-5",
}: {
    name: "users" | "search" | "plus" | "shield" | "check" | "pause" | "mail" | "phone" | "user" | "save" | "close" | "refresh" | "edit";
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
        users: (
            <>
                <path d="M16 21a6 6 0 0 0-12 0" />
                <circle cx="10" cy="8" r="4" />
                <path d="M22 21a5 5 0 0 0-4-4.9" />
                <path d="M18 4.5a3 3 0 0 1 0 6" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-5" />
            </>
        ),
        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </>
        ),
        pause: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M10 8v8" />
                <path d="M14 8v8" />
            </>
        ),
        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </>
        ),
        phone: (
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
        ),
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        save: (
            <>
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
            </>
        ),
        close: (
            <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </>
        ),
        refresh: (
            <>
                <path d="M21 12a9 9 0 0 1-15.2 6.5" />
                <path d="M3 12A9 9 0 0 1 18.2 5.5" />
                <path d="M18 2v4h-4" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </>
        ),
    };

    return <svg {...common}>{paths[name]}</svg>;
}

function normalizeText(value?: string | number | boolean | null) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("tr-TR");
}

function normalizeUserRole(user: UserListItem): UserListItem {
    const roleText = normalizeText(user.role);
    const statusText = normalizeText(user.status);

    if (roleText === "admin") {
        return {
            ...user,
            role: "Admin",
        };
    }

    if (
        roleText === "user" ||
        roleText === "teknisyen" ||
        roleText === "technician" ||
        statusText.includes("teknisyen") ||
        statusText.includes("teknik servis")
    ) {
        return {
            ...user,
            role: "Teknisyen",
        };
    }

    return user;
}

function sortUsersNewestFirst(users: UserListItem[]) {
    return [...users].sort((first, second) => second.id - first.id);
}

function getInitials(fullName: string) {
    return fullName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toLocaleUpperCase("tr-TR");
}

function getRoleClass(role: string) {
    if (role === "Admin") {
        return "border-sky-400/40 bg-sky-500/14 text-sky-200";
    }

    if (role === "Teknisyen") {
        return "border-violet-400/40 bg-violet-500/14 text-violet-200";
    }

    return "border-cyan-400/35 bg-cyan-500/12 text-cyan-200";
}

function UserManagementPage() {
    const currentUser = useAuthStore((state) => state.user);
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<UserForm>(emptyForm);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContactUser, setEditingContactUser] = useState<UserListItem | null>(null);
    const [contactForm, setContactForm] = useState<ContactForm>(emptyContactForm);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmToggleUser, setConfirmToggleUser] = useState<UserListItem | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            const data = await getUsers();
            const nextUsers = sortUsersNewestFirst((data.length > 0 ? data : fallbackUsers).map(normalizeUserRole));

            setUsers(nextUsers);
            setSelectedId((current) => current ?? nextUsers[0]?.id ?? null);
        } catch {
            const nextUsers = sortUsersNewestFirst(fallbackUsers.map(normalizeUserRole));

            setUsers(nextUsers);
            setSelectedId((current) => current ?? nextUsers[0]?.id ?? null);
            setErrorMessage("Kullanıcı servisine ulaşılamadı, örnek kayıtlar gösteriliyor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = normalizeText(query);

        return users.filter((user) => {
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus =
                statusFilter === "all" ? true : statusFilter === "active" ? user.active : !user.active;
            const searchableText = [
                user.fullName,
                user.username,
                user.email,
                user.phone,
                user.role,
                user.active ? "aktif" : "pasif",
                user.status,
            ]
                .map(normalizeText)
                .join(" ");

            return matchesRole && matchesStatus && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
        });
    }, [query, roleFilter, statusFilter, users]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const selectedUser =
        filteredUsers.find((user) => user.id === selectedId) ?? filteredUsers[0] ?? users[0] ?? null;

    const stats = useMemo(
        () => ({
            total: users.length,
            active: users.filter((user) => user.active).length,
            passive: users.filter((user) => !user.active).length,
            admins: users.filter((user) => user.role === "Admin").length,
        }),
        [users],
    );

    useEffect(() => {
        setPage(1);
    }, [query, roleFilter, statusFilter]);

    useEffect(() => {
        setPage((current) => Math.min(current, totalPages));
    }, [totalPages]);

    const openCreateForm = () => {
        setForm(emptyForm);
        setMessage("");
        setErrorMessage("");
        setIsFormOpen(true);
    };

    const openEditContactForm = (user: UserListItem) => {
        setEditingContactUser(user);
        setContactForm({
            email: user.email || "",
            phone: user.phone || "",
        });
        setMessage("");
        setErrorMessage("");
    };

    const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.fullName.trim() || !form.username.trim() || !form.password.trim()) {
            setErrorMessage("Ad soyad, kullanıcı adı ve şifre zorunludur.");
            return;
        }

        const request: CreateUserRequest = {
            fullName: form.fullName.trim(),
            username: form.username.trim(),
            password: form.password,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            role: form.role,
            status: "Aktif",
        };

        try {
            setLoading(true);
            setErrorMessage("");
            const savedUser = await createUser(request);
            const nextUser = normalizeUserRole({
                ...savedUser,
                role: request.role,
            });

            setUsers((current) => [nextUser, ...current.filter((user) => user.id !== nextUser.id)]);
            setSelectedId(nextUser.id);
            setPage(1);
            setIsFormOpen(false);
            setForm(emptyForm);
            setMessage("Yeni kullanıcı eklendi.");
        } catch {
            const localUser: UserListItem = {
                id: Date.now(),
                fullName: request.fullName,
                username: request.username,
                email: request.email,
                phone: request.phone,
                role: request.role,
                active: true,
                status: request.status,
            };

            setUsers((current) => [normalizeUserRole(localUser), ...current]);
            setSelectedId(localUser.id);
            setPage(1);
            setIsFormOpen(false);
            setForm(emptyForm);
            setMessage("Servis yanıt vermedi, kullanıcı ekranda geçici olarak eklendi.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: UserListItem) => {
        const nextActive = !user.active;

        try {
            setLoading(true);
            setErrorMessage("");
            const updatedUser = await updateUserStatus(user.id, { active: nextActive });
            setUsers((current) =>
                current.map((item) => (item.id === user.id ? normalizeUserRole({ ...item, ...updatedUser }) : item)),
            );
            setMessage(nextActive ? "Kullanıcı aktif duruma alındı." : "Kullanıcı pasif duruma alındı.");
        } catch {
            setUsers((current) =>
                current.map((item) => (item.id === user.id ? { ...item, active: nextActive } : item)),
            );
            setMessage(nextActive ? "Kullanıcı ekranda aktif duruma alındı." : "Kullanıcı ekranda pasif duruma alındı.");
        } finally {
            setConfirmToggleUser(null);
            setLoading(false);
        }
    };

    const handleUpdateContact = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingContactUser) {
            return;
        }

        const request: UpdateUserContactRequest = {
            email: contactForm.email.trim() || null,
            phone: contactForm.phone.trim() || null,
        };

        try {
            setLoading(true);
            setErrorMessage("");
            const updatedUser = await updateUserContact(editingContactUser.id, request);
            const nextUser = normalizeUserRole(updatedUser);

            setUsers((current) =>
                current.map((user) => (user.id === editingContactUser.id ? { ...user, ...nextUser } : user)),
            );
            setSelectedId(nextUser.id);
            setEditingContactUser(null);
            setContactForm(emptyContactForm);
            setMessage("");
        } catch {
            setUsers((current) =>
                current.map((user) =>
                    user.id === editingContactUser.id
                        ? { ...user, email: request.email, phone: request.phone }
                        : user,
                ),
            );
            setEditingContactUser(null);
            setContactForm(emptyContactForm);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        { label: "Toplam Kullanıcı", value: stats.total, helper: "tüm hesaplar", icon: "users" as const, tone: "border-sky-500/30 bg-sky-500/10 text-sky-300" },
        { label: "Aktif Kullanıcı", value: stats.active, helper: "erişime açık", icon: "check" as const, tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
        { label: "Pasif Kullanıcı", value: stats.passive, helper: "erişimi kapalı", icon: "pause" as const, tone: "border-red-500/30 bg-red-500/10 text-red-300" },
        { label: "Admin Sayısı", value: stats.admins, helper: "yönetici hesapları", icon: "shield" as const, tone: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
    ];

    return (
        <DashboardShell activePage="users">
            <section className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#06111f] text-slate-100">
                <header className="flex h-[72px] shrink-0 flex-wrap items-center gap-4 border-b border-slate-700/45 bg-[#071422]/95 px-5 py-3">
                    <div className="min-w-[250px]">
                        <h1 className="text-2xl font-bold tracking-normal text-white">Kullanıcı Yönetimi</h1>
                        <p className="mt-1 text-sm text-slate-400">Kullanıcıları listele, ara, filtrele ve durumlarını yönet.</p>
                    </div>

                    <label className="ml-auto flex h-11 w-full max-w-[420px] items-center rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-400">
                        <Icon name="search" className="mr-3 h-4 w-4" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Ara: ad, kullanıcı adı, e-posta..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-500"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Yeni Kullanıcı
                    </button>

                    <div className="flex items-center gap-3 border-l border-slate-700/60 pl-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-white">{currentUser?.fullName || "Admin"}</p>
                            <p className="text-xs text-slate-400">{currentUser?.role || "-"}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/70 bg-slate-700/50 text-slate-200">
                            <Icon name="user" className="h-5 w-5" />
                        </div>
                    </div>
                </header>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="flex min-h-0 min-w-0 flex-col">
                        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                            {metricCards.map((card) => (
                                <article key={card.label} className={`rounded-md border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] ${card.tone}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-300">{card.label}</p>
                                            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
                                            <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
                                        </div>
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-current/25 bg-current/10">
                                            <Icon name={card.icon} className="h-7 w-7" />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_220px]">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["all", "Tüm Durumlar"],
                                    ["active", "Aktif"],
                                    ["passive", "Pasif"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setStatusFilter(value as StatusFilter)}
                                        className={`flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                                            statusFilter === value
                                                ? "border-sky-500 bg-sky-500/16 text-sky-100"
                                                : "border-slate-700/65 bg-[#0a1726] text-slate-300 hover:border-sky-500/60"
                                        }`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${value === "active" ? "bg-emerald-400" : value === "passive" ? "bg-red-400" : "bg-sky-400"}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <select
                                value={roleFilter}
                                onChange={(event) => setRoleFilter(event.target.value)}
                                className="h-10 rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-sm font-semibold text-slate-200 outline-none transition focus:border-sky-500"
                            >
                                <option value="all">
                                    Tüm Roller
                                </option>
                                {MANAGED_ROLES.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            <div className="min-h-0 flex-1 overflow-x-auto">
                                <table className="w-full min-w-[940px] border-collapse text-left text-sm">
                                    <thead className="bg-[#0b1b2c] text-xs font-semibold text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3">Ad Soyad</th>
                                            <th className="px-4 py-3">Kullanıcı Adı</th>
                                            <th className="px-4 py-3">Rol</th>
                                            <th className="px-4 py-3">Durum</th>
                                            <th className="px-4 py-3">İletişim</th>
                                            <th className="px-4 py-3">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                onClick={() => setSelectedId(user.id)}
                                                className={`cursor-pointer border-t border-slate-700/45 transition hover:bg-sky-500/7 ${
                                                    selectedUser?.id === user.id ? "bg-sky-500/12 outline outline-1 outline-sky-500/45" : ""
                                                }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-sky-400/35 bg-sky-500/12 text-xs font-black text-sky-100">
                                                            {getInitials(user.fullName) || "KU"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{user.fullName}</p>
                                                            <p className="text-xs text-slate-500">#{user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-200">{user.username}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${getRoleClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-bold ${user.active ? "bg-emerald-500/14 text-emerald-300" : "bg-red-500/14 text-red-300"}`}>
                                                        <span className={`h-2 w-2 rounded-full ${user.active ? "bg-emerald-400" : "bg-red-400"}`} />
                                                        {user.active ? "Aktif" : "Pasif"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">
                                                    <p>{user.email || "-"}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{user.phone || "-"}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setConfirmToggleUser(user);
                                                        }}
                                                        disabled={loading}
                                                        className={`inline-flex h-9 min-w-[112px] items-center justify-center rounded-md px-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                            user.active ? "bg-red-700 hover:bg-red-600" : "bg-emerald-700 hover:bg-emerald-600"
                                                        }`}
                                                    >
                                                        {user.active ? "Pasif Yap" : "Aktif Yap"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-700/45 px-4 py-3 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {"<"}
                                    </button>
                                    <span className="min-w-[58px] text-center text-sm font-semibold text-sky-100">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {">"}
                                    </button>
                                </div>
                            </div>

                            {(message || errorMessage || loading || filteredUsers.length === 0) && (
                                <div className="border-t border-slate-700/45 px-4 py-3 text-sm">
                                    {loading && <p className="text-slate-300">Kullanıcılar yükleniyor...</p>}
                                    {message && <p className="text-emerald-200">{message}</p>}
                                    {errorMessage && <p className="text-amber-200">{errorMessage}</p>}
                                    {!loading && filteredUsers.length === 0 && <p className="text-slate-400">Filtrelere uygun kullanıcı bulunamadı.</p>}
                                </div>
                            )}
                        </section>
                    </section>

                    <aside className="min-h-0 overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
                        {selectedUser ? (
                            <div className="flex h-full min-h-0 flex-col">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Kullanıcı Detay Paneli</h2>
                                    </div>
                                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${selectedUser.active ? "bg-emerald-500/14 text-emerald-300" : "bg-red-500/14 text-red-300"}`}>
                                        {selectedUser.active ? "Aktif" : "Pasif"}
                                    </span>
                                </div>

                                <div className="mb-5 rounded-md border border-slate-700/55 bg-[#0a1726] p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-sky-400/35 bg-sky-500/12 text-base font-black text-sky-100">
                                            {getInitials(selectedUser.fullName) || "KU"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="break-words text-lg font-bold text-white">{selectedUser.fullName}</h3>
                                                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${getRoleClass(selectedUser.role)}`}>
                                                    {selectedUser.role}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-400">@{selectedUser.username}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 border-b border-slate-700/45 pb-5 text-sm">
                                    {[
                                        ["E-posta", selectedUser.email || "-", "mail" as const],
                                        ["Telefon", selectedUser.phone || "-", "phone" as const],
                                        ["Rol", selectedUser.role, "shield" as const],
                                        ["Durum", selectedUser.active ? "Aktif" : "Pasif", selectedUser.active ? "check" as const : "pause" as const],
                                    ].map(([label, value, icon]) => (
                                        <div key={label as string} className="grid grid-cols-[22px_1fr] gap-3">
                                            <Icon name={icon as "mail" | "phone" | "shield" | "check" | "pause" | "user"} className="mt-0.5 h-4 w-4 text-sky-400" />
                                            <div>
                                                <p className="text-slate-400">{label}</p>
                                                <p className="mt-1 break-words font-semibold text-white">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5">
                                    <button
                                        type="button"
                                        onClick={() => openEditContactForm(selectedUser)}
                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-violet-700 font-bold text-white shadow-[0_0_24px_rgba(124,58,237,0.24)] transition hover:bg-violet-600"
                                    >
                                        <Icon name="edit" className="h-5 w-5" />
                                        Düzenle
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                                Detay görüntülemek için bir kullanıcı seçin.
                            </div>
                        )}
                    </aside>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                        <section className="w-full max-w-3xl rounded-md border border-slate-600/55 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Yeni Kullanıcı Ekle</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <Icon name="close" className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
                                {[
                                    ["fullName", "Ad Soyad", "Ad soyad giriniz"],
                                    ["username", "Kullanıcı Adı", "Kullanıcı adı giriniz"],
                                    ["email", "E-posta", "E-posta adresi giriniz"],
                                    ["phone", "Telefon", "Telefon numarası giriniz"],
                                ].map(([field, label, placeholder]) => (
                                    <label key={field} className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
                                        <input
                                            value={form[field as keyof UserForm]}
                                            onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                                            className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                            placeholder={placeholder}
                                        />
                                    </label>
                                ))}

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Rol</span>
                                    <select
                                        value={form.role}
                                        onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Şifre</span>
                                    <input
                                        value={form.password}
                                        onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                                        type="password"
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                        placeholder="Şifre oluşturunuz"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-3 pt-2 md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex h-11 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex h-11 items-center justify-center gap-2 rounded-md bg-blue-600 font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Icon name="save" className="h-5 w-5" />
                                        {loading ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {editingContactUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                        <section className="w-full max-w-xl rounded-md border border-slate-600/55 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">İletişim Bilgilerini Düzenle</h2>
                                    <p className="mt-2 text-sm text-slate-400">{editingContactUser.fullName}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingContactUser(null);
                                        setContactForm(emptyContactForm);
                                    }}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <Icon name="close" className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateContact} className="space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">E-posta</span>
                                    <input
                                        value={contactForm.email}
                                        onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
                                        placeholder="E-posta adresi giriniz"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Telefon</span>
                                    <input
                                        value={contactForm.phone}
                                        onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
                                        placeholder="Telefon numarası giriniz"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingContactUser(null);
                                            setContactForm(emptyContactForm);
                                        }}
                                        className="flex h-11 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex h-11 items-center justify-center gap-2 rounded-md bg-violet-700 font-bold text-white shadow-[0_0_24px_rgba(124,58,237,0.24)] transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Icon name="save" className="h-5 w-5" />
                                        {loading ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {confirmToggleUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                        <section className="w-full max-w-md rounded-lg border border-slate-500/45 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Onay</h2>
                                    <p className="mt-3 text-[16px] leading-6 text-slate-200">
                                        {confirmToggleUser.active
                                            ? "Bu kullanıcıyı pasif yapmak istediğinize emin misiniz?"
                                            : "Bu kullanıcıyı aktif yapmak istediğinize emin misiniz?"}
                                    </p>
                                    <p className="mt-2 break-words text-sm font-semibold text-slate-400">
                                        {confirmToggleUser.fullName}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfirmToggleUser(null)}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <Icon name="close" className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmToggleUser(null)}
                                    className="flex h-11 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(confirmToggleUser)}
                                    disabled={loading}
                                    className={`flex h-11 items-center justify-center rounded-md font-bold text-white shadow-[0_0_24px_rgba(0,0,0,0.22)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        confirmToggleUser.active
                                            ? "bg-red-700 hover:bg-red-600"
                                            : "bg-emerald-700 hover:bg-emerald-600"
                                    }`}
                                >
                                    {confirmToggleUser.active ? "Pasif Yap" : "Aktif Yap"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </section>
        </DashboardShell>
    );
}

export default UserManagementPage;
