import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../../../app/DashboardShell";
import { getMySolutionTrackings } from "../../solutionTracking/services/solutionTrackingService";
import type { SolutionStatus, SolutionTracking } from "../../solutionTracking/types/solutionTracking.types";
import { getMyProfile } from "../services/userService";
import type { UserDetail } from "../types/user.types";

const RECORDS_PER_PAGE = 5;

function Icon({
    name,
    className = "h-5 w-5",
}: {
    name: "user" | "mail" | "phone" | "shield" | "calendar" | "box" | "check" | "close" | "star" | "clock" | "note";
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
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        mail: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
            </>
        ),
        phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />,
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-5" />
            </>
        ),
        calendar: (
            <>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
            </>
        ),
        box: (
            <>
                <path d="m21 8-9-5-9 5 9 5 9-5Z" />
                <path d="M3 8v8l9 5 9-5V8" />
                <path d="M12 13v8" />
            </>
        ),
        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </>
        ),
        close: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9 9 15" />
                <path d="m9 9 6 6" />
            </>
        ),
        star: (
            <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9Z" />
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        note: (
            <>
                <path d="M4 4h16v16H4Z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </>
        ),
    };

    return <svg {...common}>{paths[name]}</svg>;
}

function formatDate(value?: string) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
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

function getStatusLabel(status: SolutionStatus) {
    if (status === "SUCCESS") {
        return "Başarılı";
    }

    if (status === "FAILED") {
        return "Başarısız";
    }

    return "Devam Ediyor";
}

function getStatusClass(status: SolutionStatus) {
    if (status === "SUCCESS") {
        return "bg-emerald-500/14 text-emerald-300";
    }

    if (status === "FAILED") {
        return "bg-red-500/14 text-red-300";
    }

    return "bg-amber-500/14 text-amber-300";
}

function getMostUsedDevice(records: SolutionTracking[]) {
    const counts = new Map<string, number>();

    records.forEach((record) => {
        counts.set(record.deviceModel, (counts.get(record.deviceModel) ?? 0) + 1);
    });

    return Array.from(counts.entries()).sort((first, second) => second[1] - first[1])[0]?.[0] ?? "-";
}

function getDisplayRole(role?: string | null) {
    return role === "User" ? "Teknisyen" : role || "-";
}

function ProfilePage() {
    const [profile, setProfile] = useState<UserDetail | null>(null);
    const [records, setRecords] = useState<SolutionTracking[]>([]);
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [recordPage, setRecordPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadProfile() {
            try {
                setLoading(true);
                setErrorMessage("");
                const profileData = await getMyProfile();

                if (isMounted) {
                    setProfile(profileData);
                }

                try {
                    const userRecords = await getMySolutionTrackings(profileData.username);

                    if (isMounted) {
                        const sortedRecords = [...userRecords].sort((first, second) => second.id - first.id);
                        setRecords(sortedRecords);
                        setSelectedRecordId(sortedRecords[0]?.id ?? null);
                        setRecordPage(1);
                    }
                } catch {
                    if (isMounted) {
                        setRecords([]);
                        setSelectedRecordId(null);
                        setRecordPage(1);
                    }
                }
            } catch {
                if (isMounted) {
                    setErrorMessage("Profil bilgileri yüklenirken bir sorun oluştu.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const stats = useMemo(
        () => ({
            total: records.length,
            success: records.filter((record) => record.resultStatus === "SUCCESS").length,
            failed: records.filter((record) => record.resultStatus === "FAILED").length,
            topDevice: getMostUsedDevice(records),
        }),
        [records],
    );

    const pageCount = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE));
    const currentPage = Math.min(recordPage, pageCount);
    const visibleRecords = records.slice((currentPage - 1) * RECORDS_PER_PAGE, currentPage * RECORDS_PER_PAGE);
    const latestRecord = records[0] ?? null;
    const selectedRecord =
        records.find((record) => record.id === selectedRecordId) ?? latestRecord;

    const metricCards = [
        {
            label: "Toplam Çözüm Kaydım",
            value: stats.total,
            helper: "kendi oluşturduğum kayıtlar",
            icon: "box" as const,
            tone: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        },
        {
            label: "Başarılı Çözümlerim",
            value: stats.success,
            helper: "başarıyla sonuçlanan",
            icon: "check" as const,
            tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        },
        {
            label: "Başarısız Çözümlerim",
            value: stats.failed,
            helper: "başarısız sonuçlanan",
            icon: "close" as const,
            tone: "border-red-500/30 bg-red-500/10 text-red-300",
        },
        {
            label: "En Çok İşlem Yaptığım Model",
            value: stats.topDevice,
            helper: "en sık işlenen model",
            icon: "star" as const,
            tone: "border-violet-500/30 bg-violet-500/10 text-violet-300",
        },
    ];

    return (
        <DashboardShell activePage="profile">
            <section className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#06111f] text-slate-100">
                <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-700/45 bg-[#071422]/95 px-5 py-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-normal text-white">Profilim</h1>
                        <p className="mt-1 text-sm text-slate-400">Kişisel bilgilerim ve çözüm kaydı geçmişim.</p>
                    </div>
                    {loading && <p className="text-sm text-slate-400">Yükleniyor...</p>}
                </header>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section className="flex min-h-0 min-w-0 flex-col">
                        <section className="rounded-md border border-sky-500/35 bg-[#081827]/92 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            {profile ? (
                                <div className="grid gap-5 lg:grid-cols-[minmax(280px,1fr)_minmax(360px,1fr)]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-sky-400/45 bg-sky-500/12 text-xl font-black text-sky-100">
                                            {getInitials(profile.fullName) || "KU"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="break-words text-3xl font-bold text-white">{profile.fullName}</h2>
                                                <span className="rounded-md border border-cyan-400/35 bg-cyan-500/12 px-2.5 py-1 text-xs font-bold text-cyan-200">
                                                    {getDisplayRole(profile.role)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-400">@{profile.username}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 text-sm md:grid-cols-2">
                                        {[
                                            ["Kullanıcı adı", profile.username, "user" as const],
                                            ["E-posta", profile.email || "-", "mail" as const],
                                            ["Telefon", profile.phone || "-", "phone" as const],
                                            ["Rol", getDisplayRole(profile.role), "shield" as const],
                                            ["Durum", profile.active ? "Aktif" : "Pasif", "check" as const],
                                            ["Kayıt tarihi", formatDate(profile.createdAt), "calendar" as const],
                                        ].map(([label, value, icon]) => (
                                            <div key={label as string} className="grid grid-cols-[22px_1fr] gap-3 rounded-md border border-slate-700/45 bg-[#0a1726] p-3">
                                                <Icon name={icon as "user" | "mail" | "phone" | "shield" | "check" | "calendar"} className="mt-0.5 h-4 w-4 text-sky-400" />
                                                <div>
                                                    <p className="text-slate-400">{label}</p>
                                                    <p className="mt-1 break-words font-semibold text-white">{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-sm text-slate-400">
                                    {errorMessage || "Profil bilgisi bulunamadı."}
                                </div>
                            )}
                        </section>

                        <div className="mt-3 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                            {metricCards.map((card) => (
                                <article key={card.label} className={`rounded-md border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] ${card.tone}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-300">{card.label}</p>
                                            <p className="mt-2 break-words text-3xl font-bold text-white">{card.value}</p>
                                            <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
                                        </div>
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-current/25 bg-current/10">
                                            <Icon name={card.icon} className="h-7 w-7" />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-700/45 px-4">
                                <h2 className="text-lg font-bold text-white">Çözüm Kayıtlarım</h2>
                                <span className="text-sm text-slate-400">{records.length} kayıt</span>
                            </div>

                            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
                                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                                    <thead className="bg-[#0b1b2c] text-xs font-semibold text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3">Kayıt No</th>
                                            <th className="px-4 py-3">Hata Kodu</th>
                                            <th className="px-4 py-3">Cihaz Modeli</th>
                                            <th className="px-4 py-3">Durum</th>
                                            <th className="px-4 py-3">Son Güncelleme</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleRecords.map((record) => (
                                            <tr
                                                key={record.id}
                                                onClick={() => setSelectedRecordId(record.id)}
                                                className={`border-t border-slate-700/45 transition hover:bg-sky-500/7 ${
                                                    selectedRecord?.id === record.id ? "bg-sky-500/12 outline outline-1 outline-sky-500/45" : "cursor-pointer"
                                                }`}
                                            >
                                                <td className="px-4 py-3 font-bold text-white">#{record.id}</td>
                                                <td className="px-4 py-3 font-semibold text-slate-200">{record.errorCode}</td>
                                                <td className="px-4 py-3 text-slate-300">{record.deviceModel}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${getStatusClass(record.resultStatus)}`}>
                                                        {getStatusLabel(record.resultStatus)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{formatDate(record.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!loading && records.length === 0 && (
                                <div className="border-t border-slate-700/45 px-4 py-8 text-center text-sm text-slate-400">
                                    Henüz çözüm kaydınız bulunmuyor.
                                </div>
                            )}

                            {records.length > 0 && (
                                <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-t border-slate-700/45 px-4 text-sm text-slate-300">
                                    <span>
                                        Sayfa {currentPage} / {pageCount}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setRecordPage((page) => Math.max(1, page - 1))}
                                            disabled={currentPage === 1}
                                            className="rounded-md border border-slate-700/65 px-3 py-2 font-bold text-slate-200 transition hover:border-sky-400/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Geri
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRecordPage((page) => Math.min(pageCount, page + 1))}
                                            disabled={currentPage === pageCount}
                                            className="rounded-md border border-slate-700/65 px-3 py-2 font-bold text-slate-200 transition hover:border-sky-400/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            İleri
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </section>

                    <aside className="min-h-0 overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
                        {selectedRecord ? (
                            <div className="flex h-full min-h-0 flex-col">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-slate-400">TRK-{String(selectedRecord.id).padStart(5, "0")}</p>
                                        <h2 className="text-xl font-bold text-white">Çözüm Kaydı Detayı</h2>
                                    </div>
                                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${getStatusClass(selectedRecord.resultStatus)}`}>
                                        {getStatusLabel(selectedRecord.resultStatus)}
                                    </span>
                                </div>

                                <div className="space-y-4 border-b border-slate-700/45 pb-5 text-sm">
                                    {[
                                        ["Kayıt No", `#${selectedRecord.id}`, "note" as const],
                                        ["Hata Kodu", selectedRecord.errorCode, "clock" as const],
                                        ["Cihaz Modeli", selectedRecord.deviceModel, "box" as const],
                                        ["Durum", getStatusLabel(selectedRecord.resultStatus), selectedRecord.resultStatus === "FAILED" ? "close" as const : "check" as const],
                                        ["Oluşturma Tarihi", formatDate(selectedRecord.createdAt), "calendar" as const],
                                    ].map(([label, value, icon]) => (
                                        <div key={label as string} className="grid grid-cols-[22px_1fr] gap-3">
                                            <Icon name={icon as "note" | "clock" | "box" | "check" | "close" | "calendar"} className="mt-0.5 h-4 w-4 text-sky-400" />
                                            <div>
                                                <p className="text-slate-400">{label}</p>
                                                <p className="mt-1 break-words font-semibold text-white">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 min-h-0 space-y-4 overflow-auto">
                                    <div className="rounded-md border border-slate-700/55 bg-[#0a1726] p-4">
                                        <p className="mb-2 text-sm font-bold text-slate-300">Teknisyen Notu</p>
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{selectedRecord.note || "-"}</p>
                                    </div>
                                    <div className="rounded-md border border-slate-700/55 bg-[#0a1726] p-4">
                                        <p className="mb-2 text-sm font-bold text-slate-300">Çözüm Süreci</p>
                                        <p className="text-sm leading-6 text-slate-100">
                                            {selectedRecord.resultStatus === "SUCCESS"
                                                ? "Kayıt başarıyla sonuçlandırılmış."
                                                : selectedRecord.resultStatus === "FAILED"
                                                  ? "Kayıt başarısız olarak işaretlenmiş."
                                                  : "Kayıt üzerindeki çözüm süreci devam ediyor."}
                                        </p>
                                    </div>
                                    {latestRecord && (
                                        <div className="rounded-md border border-sky-500/35 bg-sky-500/8 p-4">
                                            <p className="mb-3 text-sm font-bold text-slate-300">Kullanıcının Son Kullandığı Çözüm Kaydı</p>
                                            <div className="space-y-2 text-sm">
                                                <p className="font-semibold text-white">TRK-{String(latestRecord.id).padStart(5, "0")}</p>
                                                <p className="text-slate-300">
                                                    {latestRecord.errorCode} - {latestRecord.deviceModel}
                                                </p>
                                                <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${getStatusClass(latestRecord.resultStatus)}`}>
                                                    {getStatusLabel(latestRecord.resultStatus)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                                Detay görüntülemek için bir çözüm kaydı seçin.
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </DashboardShell>
    );
}

export default ProfilePage;
