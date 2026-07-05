import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import DashboardShell from "../../../app/DashboardShell";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import {
    createSolutionTracking,
    getSolutionTrackings,
    getSolutionTrackingsByUsername,
} from "../services/solutionTrackingService";
import {
    getMostUsedDeviceModels,
    getMostUsedErrorCodes,
    getReportSummary,
    getUserActivity,
} from "../services/reportService";
import type { SolutionStatus, SolutionTracking } from "../types/solutionTracking.types";
import type { ReportItem, ReportSummary } from "../types/report.types";
import { getFaultSolutions } from "../../fault/services/faultService";
import type { FaultSolution } from "../../fault/types/fault.types";

const statusLabels: Record<SolutionStatus, string> = {
    SUCCESS: "Başarılı",
    FAILED: "Başarısız",
    IN_PROGRESS: "İnceleniyor",
};

const statusClasses: Record<SolutionStatus, string> = {
    SUCCESS: "border-emerald-400/35 bg-emerald-500/18 text-emerald-300",
    FAILED: "border-red-400/45 bg-red-500/18 text-red-300",
    IN_PROGRESS: "border-blue-400/35 bg-blue-500/18 text-blue-300",
};

const USER_TRACKINGS_STORAGE_KEY = "arizanet:user-solution-trackings";
const USER_TRACKINGS_PAGE_SIZE = 4;
const ADMIN_TRACKINGS_PAGE_SIZE = 8;
const emptyReportSummary: ReportSummary = {
    totalTrackingCount: 0,
    successCount: 0,
    failedCount: 0,
};

function getStoredUserTrackings(username?: string): SolutionTracking[] {
    if (!username) {
        return [];
    }

    const storedTrackings = localStorage.getItem(USER_TRACKINGS_STORAGE_KEY);

    if (!storedTrackings) {
        return [];
    }

    try {
        const parsedTrackings = JSON.parse(storedTrackings) as Record<string, SolutionTracking[]>;
        return parsedTrackings[username] ?? [];
    } catch {
        localStorage.removeItem(USER_TRACKINGS_STORAGE_KEY);
        return [];
    }
}

function persistUserTracking(username: string | undefined, tracking: SolutionTracking) {
    if (!username) {
        return;
    }

    const storedTrackings = localStorage.getItem(USER_TRACKINGS_STORAGE_KEY);
    let parsedTrackings: Record<string, SolutionTracking[]> = {};

    if (storedTrackings) {
        try {
            parsedTrackings = JSON.parse(storedTrackings) as Record<string, SolutionTracking[]>;
        } catch {
            parsedTrackings = {};
        }
    }

    const userTrackings = parsedTrackings[username] ?? [];
    const nextTrackings = [tracking, ...userTrackings.filter((item) => item.id !== tracking.id)];
    localStorage.setItem(
        USER_TRACKINGS_STORAGE_KEY,
        JSON.stringify({
            ...parsedTrackings,
            [username]: nextTrackings,
        }),
    );
}

function mergeTrackings(serviceTrackings: SolutionTracking[], storedTrackings: SolutionTracking[]) {
    const trackingsById = new Map<number, SolutionTracking>();
    storedTrackings.forEach((tracking) => trackingsById.set(tracking.id, tracking));
    serviceTrackings.forEach((tracking) => trackingsById.set(tracking.id, tracking));
    return Array.from(trackingsById.values()).sort((first, second) => {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
        return secondTime - firstTime;
    });
}

function Icon({
    name,
    className = "h-5 w-5",
}: {
    name:
        | "clipboard"
        | "search"
        | "filter"
        | "calendar"
        | "bell"
        | "user"
        | "check"
        | "hourglass"
        | "clock"
        | "file"
        | "share"
        | "close"
        | "plus"
        | "pin"
        | "device"
        | "users"
        | "note"
        | "warning"
        | "tool"
        | "refresh"
        | "logout";
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
        clipboard: (
            <>
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M8 12h8" />
                <path d="M8 16h6" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
            </>
        ),
        filter: (
            <>
                <path d="M4 5h16" />
                <path d="M7 12h10" />
                <path d="M10 19h4" />
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
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </>
        ),
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 2.5 2.5L16 9" />
            </>
        ),
        hourglass: (
            <>
                <path d="M6 2h12" />
                <path d="M6 22h12" />
                <path d="M7 2c0 5 5 6 5 10s-5 5-5 10" />
                <path d="M17 2c0 5-5 6-5 10s5 5 5 10" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        file: (
            <>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
            </>
        ),
        share: (
            <>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.6 6.8-4.2" />
                <path d="m8.6 13.4 6.8 4.2" />
            </>
        ),
        close: (
            <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        pin: (
            <>
                <path d="M12 17v5" />
                <path d="M9 10 4 15l5 2 6-6 2-5-3-3-5 2Z" />
            </>
        ),
        device: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
            </>
        ),
        users: (
            <>
                <path d="M16 21a6 6 0 0 0-12 0" />
                <circle cx="10" cy="8" r="4" />
                <path d="M22 21a5 5 0 0 0-4-4.9" />
            </>
        ),
        note: (
            <>
                <path d="M4 4h16v16H4z" />
                <path d="M8 9h8" />
                <path d="M8 13h6" />
            </>
        ),
        warning: (
            <>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),
        tool: (
            <>
                <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.9 2.9-2.1-2.1Z" />
            </>
        ),
        refresh: (
            <>
                <path d="M21 12a9 9 0 0 1-15.2 6.5" />
                <path d="M3 12A9 9 0 0 1 18.2 5.5" />
                <path d="M18 2v4h-4" />
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

function getUserStatusLabel(status: SolutionStatus) {
    if (status === "SUCCESS") {
        return "Başarılı";
    }

    if (status === "FAILED") {
        return "Başarısız";
    }

    return statusLabels[status];
}

function getUserStatusClass(status: SolutionStatus) {
    if (status === "FAILED") {
        return "border-red-400/45 bg-red-500/18 text-red-300";
    }

    return statusClasses[status];
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

function getDisplayRole(role?: string | null) {
    return role === "User" ? "Teknisyen" : role || "-";
}

function SolutionTrackingPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const isAdmin = user?.role === "Admin";
    const [trackings, setTrackings] = useState<SolutionTracking[]>([]);
    const [faultSolutions, setFaultSolutions] = useState<FaultSolution[]>([]);
    const [reportSummary, setReportSummary] = useState<ReportSummary>(emptyReportSummary);
    const [reportErrorCodes, setReportErrorCodes] = useState<ReportItem[]>([]);
    const [reportDeviceModels, setReportDeviceModels] = useState<ReportItem[]>([]);
    const [reportUserActivity, setReportUserActivity] = useState<ReportItem[]>([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<SolutionStatus | "">("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [userTrackingsPage, setUserTrackingsPage] = useState(1);
    const [adminTrackingsPage, setAdminTrackingsPage] = useState(1);
    const [technicianForm, setTechnicianForm] = useState({
        faultSolutionId: "1",
        errorCode: "",
        deviceModel: "",
        resultStatus: "" as SolutionStatus | "",
        note: "",
    });

    const loadTrackings = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            const serviceData = isAdmin
                ? await getSolutionTrackings()
                : user?.username
                  ? await getSolutionTrackingsByUsername(user.username)
                  : [];
            const data = isAdmin ? serviceData : mergeTrackings(serviceData, getStoredUserTrackings(user?.username));
            setTrackings(data);
            setSelectedId((current) => current ?? data[0]?.id ?? null);
        } catch {
            if (!isAdmin) {
                const localTrackings = getStoredUserTrackings(user?.username);
                setTrackings(localTrackings);
                setSelectedId(localTrackings[0]?.id ?? null);
                return;
            }

            setErrorMessage("Çözüm takip kayıtları yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const loadReports = async () => {
        if (!isAdmin) {
            return;
        }

        try {
            const [summary, errorCodes, deviceModels, userActivity] = await Promise.all([
                getReportSummary(),
                getMostUsedErrorCodes(),
                getMostUsedDeviceModels(),
                getUserActivity(),
            ]);

            setReportSummary(summary);
            setReportErrorCodes(errorCodes);
            setReportDeviceModels(deviceModels);
            setReportUserActivity(userActivity);
        } catch {
            setErrorMessage("Rapor verileri yüklenirken bir sorun oluştu.");
        }
    };

    useEffect(() => {
        loadTrackings();
    }, [isAdmin, user?.username]);

    useEffect(() => {
        loadReports();
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            return;
        }

        getFaultSolutions()
            .then((data) => setFaultSolutions(data))
            .catch(() => setErrorMessage("Hata kodları yüklenirken bir sorun oluştu."));
    }, [isAdmin]);

    const filteredTrackings = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

        return trackings
            .filter((tracking) => {
                const matchesStatus = statusFilter === "" || tracking.resultStatus === statusFilter;
                const searchableText = [
                    tracking.id,
                    tracking.deviceModel,
                    tracking.errorCode,
                    tracking.username,
                    tracking.faultSolutionId,
                    tracking.note,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("tr-TR");

                return matchesStatus && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
            })
            .sort((first, second) => {
                const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0;
                const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0;
                return secondTime - firstTime;
            });
    }, [query, statusFilter, trackings]);

    const selectedTracking =
        filteredTrackings.find((tracking) => tracking.id === selectedId) ?? filteredTrackings[0] ?? null;

    const userTrackingsPageCount = Math.max(1, Math.ceil(filteredTrackings.length / USER_TRACKINGS_PAGE_SIZE));
    const visibleUserTrackings = filteredTrackings.slice(
        (Math.min(userTrackingsPage, userTrackingsPageCount) - 1) * USER_TRACKINGS_PAGE_SIZE,
        Math.min(userTrackingsPage, userTrackingsPageCount) * USER_TRACKINGS_PAGE_SIZE,
    );
    const adminTrackingsPageCount = Math.max(1, Math.ceil(filteredTrackings.length / ADMIN_TRACKINGS_PAGE_SIZE));
    const currentAdminTrackingsPage = Math.min(adminTrackingsPage, adminTrackingsPageCount);
    const visibleAdminTrackings = filteredTrackings.slice(
        (currentAdminTrackingsPage - 1) * ADMIN_TRACKINGS_PAGE_SIZE,
        currentAdminTrackingsPage * ADMIN_TRACKINGS_PAGE_SIZE,
    );

    const topErrorRecords = useMemo(
        () =>
            reportErrorCodes.slice(0, 3).map((record, index) => ({
                key: `${record.name}-${index}`,
                deviceModel: reportDeviceModels[index]?.name || "-",
                errorCode: record.name || "-",
                count: record.count,
            })),
        [reportDeviceModels, reportErrorCodes],
    );
    const topErrorCount = Math.max(1, ...topErrorRecords.map((record) => record.count));
    const topErrorTotal = topErrorRecords.reduce((total, record) => total + record.count, 0);
    const topErrorChartGradient = useMemo(() => {
        if (topErrorTotal === 0) {
            return "#1e293b 0deg 360deg";
        }

        const colors = ["#38bdf8", "#22c55e", "#f97316"];
        let start = 0;

        return topErrorRecords
            .map((record, index) => {
                const end = start + (record.count / topErrorTotal) * 360;
                const segment = `${colors[index]} ${start}deg ${end}deg`;
                start = end;
                return segment;
            })
            .join(", ");
    }, [topErrorRecords, topErrorTotal]);

    const topTechniciansFromTrackings = useMemo(
        () =>
            Array.from(
                filteredTrackings.reduce((records, tracking) => {
                    const username = tracking.username || "Atanmamış";
                    records.set(username, (records.get(username) ?? 0) + 1);
                    return records;
                }, new Map<string, number>()),
            )
                .map(([username, count]) => ({ username, count }))
                .sort((first, second) => second.count - first.count || first.username.localeCompare(second.username, "tr-TR"))
                .slice(0, 3),
        [filteredTrackings],
    );

    const topTechnicians = useMemo(
        () =>
            isAdmin
                ? reportUserActivity
                      .map((record) => ({
                          username: record.name || "Atanmamış",
                          count: record.count,
                      }))
                      .slice(0, 3)
                : topTechniciansFromTrackings,
        [isAdmin, reportUserActivity, topTechniciansFromTrackings],
    );

    useEffect(() => {
        setUserTrackingsPage((current) => Math.min(current, userTrackingsPageCount));
    }, [userTrackingsPageCount]);

    useEffect(() => {
        setAdminTrackingsPage((current) => Math.min(current, adminTrackingsPageCount));
    }, [adminTrackingsPageCount]);

    useEffect(() => {
        setUserTrackingsPage(1);
        setAdminTrackingsPage(1);
    }, [query, statusFilter]);

    const countsFromTrackings = useMemo(
        () => ({
            open: trackings.filter((tracking) => tracking.resultStatus === "IN_PROGRESS").length,
            solved: trackings.filter((tracking) => tracking.resultStatus === "SUCCESS").length,
            waiting: trackings.filter((tracking) => tracking.resultStatus === "FAILED").length,
            total: trackings.length,
            technicians: new Set(trackings.map((tracking) => tracking.username).filter(Boolean)).size,
        }),
        [trackings],
    );

    const counts = useMemo(
        () =>
            isAdmin
                ? {
                      open: Math.max(0, reportSummary.totalTrackingCount - reportSummary.successCount - reportSummary.failedCount),
                      solved: reportSummary.successCount,
                      waiting: reportSummary.failedCount,
                      total: reportSummary.totalTrackingCount,
                      technicians: reportUserActivity.length,
                  }
                : countsFromTrackings,
        [countsFromTrackings, isAdmin, reportSummary, reportUserActivity],
    );

    const deviceModels = useMemo(
        () => Array.from(new Set(faultSolutions.map((fault) => fault.deviceModel))).sort(),
        [faultSolutions],
    );

    const availableFaults = useMemo(
        () =>
            faultSolutions
                .filter((fault) => !technicianForm.deviceModel || fault.deviceModel === technicianForm.deviceModel)
                .sort((first, second) => first.errorCode.localeCompare(second.errorCode, "tr-TR")),
        [faultSolutions, technicianForm.deviceModel],
    );

    const selectedFault = useMemo(
        () =>
            faultSolutions.find(
                (fault) =>
                    fault.deviceModel === technicianForm.deviceModel &&
                    fault.errorCode === technicianForm.errorCode,
            ) ?? null,
        [faultSolutions, technicianForm.deviceModel, technicianForm.errorCode],
    );

    const shouldShowSelectedSolution = false;

    const getFaultForTracking = (tracking: SolutionTracking) =>
        faultSolutions.find(
            (fault) =>
                fault.id === tracking.faultSolutionId ||
                (fault.deviceModel === tracking.deviceModel && fault.errorCode === tracking.errorCode),
        ) ?? null;

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleCreateTracking = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (!selectedFault || !technicianForm.resultStatus) {
            setErrorMessage("Lütfen cihaz modeli, hata kodu ve sonuç seçiniz.");
            return;
        }

        setIsSaveConfirmOpen(true);
    };

    const saveTracking = async () => {
        if (!selectedFault || !technicianForm.resultStatus) {
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            setIsSaveConfirmOpen(false);

            if (!selectedFault || !technicianForm.resultStatus) {
                setErrorMessage("Lütfen cihaz modeli, hata kodu ve sonuç seçiniz.");
                return;
            }

            const fallbackTracking: SolutionTracking = {
                id: Date.now(),
                userId: 0,
                username: user?.username || user?.fullName || "",
                faultSolutionId: selectedFault.id,
                errorCode: selectedFault.errorCode,
                deviceModel: selectedFault.deviceModel,
                resultStatus: technicianForm.resultStatus,
                note: technicianForm.note.trim() || undefined,
                createdAt: new Date().toISOString(),
            };

            let savedTracking = fallbackTracking;

            try {
                savedTracking = await createSolutionTracking({
                    faultSolutionId: selectedFault.id,
                    errorCode: selectedFault.errorCode,
                    deviceModel: selectedFault.deviceModel,
                    resultStatus: technicianForm.resultStatus,
                    note: technicianForm.note.trim() || undefined,
                });
            } catch {
                savedTracking = fallbackTracking;
            }

            persistUserTracking(user?.username, {
                ...savedTracking,
                faultSolutionId: selectedFault.id,
                errorCode: selectedFault.errorCode,
                deviceModel: selectedFault.deviceModel,
                resultStatus: technicianForm.resultStatus,
                note: technicianForm.note.trim() || undefined,
                createdAt: savedTracking.createdAt || fallbackTracking.createdAt,
            });

            setTechnicianForm({
                faultSolutionId: "1",
                errorCode: "",
                deviceModel: "",
                resultStatus: "",
                note: "",
            });
            await loadTrackings();
        } catch {
            setErrorMessage("Çözüm kaydı oluşturulurken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        {
            label: "Toplam Çözüm Kaydı",
            value: counts.total,
            helper: "sistemdeki çözüm kaydı",
            icon: "file" as const,
            tone: "border-blue-500/30 bg-blue-500/10 text-blue-300",
        },
        {
            label: "Başarılı",
            value: counts.solved,
            helper: "başarıyla kapandı",
            icon: "check" as const,
            tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        },
        {
            label: "Başarısız",
            value: counts.waiting,
            helper: "başarısız kayıt",
            icon: "close" as const,
            tone: "border-red-500/30 bg-red-500/10 text-red-300",
        },
        {
            label: "Teknisyen Sayısı",
            value: counts.technicians,
            helper: "benzersiz teknisyen",
            icon: "users" as const,
            tone: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
        },
    ];

    if (!isAdmin) {
        return (
            <DashboardShell activePage="solution-trackings">
                <section className="min-w-0 flex-1 overflow-auto">
                    <header className="flex h-[58px] items-center gap-4 border-b border-slate-700/45 bg-[#071422]/95 px-4">
                        <div className="flex min-w-[260px] items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-300">
                                <Icon name="clipboard" className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-bold tracking-normal text-white">Çözüm Takibi</h1>
                        </div>

                        <div className="ml-auto flex items-center gap-3 border-l border-slate-700/60 pl-4">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-bold text-white">{user?.fullName || "Teknisyen"}</p>
                                <p className="text-xs text-slate-400">{getDisplayRole(user?.role)}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/70 bg-slate-700/50 text-slate-200">
                                <Icon name="user" className="h-5 w-5" />
                            </div>
                        </div>
                    </header>

                    <div className="grid min-h-[calc(100vh-58px)] gap-4 p-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                        <section className="rounded-md border border-slate-700/55 bg-[#081827]/92 p-5 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            <h2 className="text-xl font-bold text-white">Yeni Çözüm Kaydı</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Kendi yaptığınız çözüm işlemini kaydedin ve sonucu işaretleyin.
                            </p>

                            <form onSubmit={handleCreateTracking} className="mt-5 space-y-4 [&>div:nth-of-type(1)]:hidden [&>label:nth-of-type(3)]:hidden [&>label:nth-of-type(4)]:hidden [&>label:nth-of-type(5)]:hidden">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Cihaz Modeli</span>
                                    <select
                                        value={technicianForm.deviceModel}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({
                                                ...current,
                                                deviceModel: event.target.value,
                                                errorCode: "",
                                                resultStatus: "",
                                            }))
                                        }
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-100 outline-none transition focus:border-sky-400"
                                        required
                                    >
                                        <option value="" disabled hidden className="bg-[#0a1726] text-slate-100">
                                            Cihaz modeli seç
                                        </option>
                                        {deviceModels.map((model) => (
                                            <option key={model} value={model} className="bg-[#0a1726] text-slate-100">
                                                {model}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Hata Kodu</span>
                                    <select
                                        value={technicianForm.errorCode}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({
                                                ...current,
                                                errorCode: event.target.value,
                                                resultStatus: "",
                                            }))
                                        }
                                        disabled={!technicianForm.deviceModel}
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-100 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                        required
                                    >
                                        <option value="" disabled hidden className="bg-[#0a1726] text-slate-100">
                                            Hata kodu seç
                                        </option>
                                        {availableFaults.map((fault) => (
                                            <option key={fault.id} value={fault.errorCode} className="bg-[#0a1726] text-slate-100">
                                                {fault.errorCode} - {fault.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Hata Çözüm ID</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={technicianForm.faultSolutionId}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({
                                                ...current,
                                                faultSolutionId: event.target.value,
                                            }))
                                        }
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-100 outline-none transition focus:border-sky-400"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Hata Kodu</span>
                                    <input
                                        value={technicianForm.errorCode}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({ ...current, errorCode: event.target.value }))
                                        }
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-100 outline-none transition focus:border-sky-400"
                                        required
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Cihaz Modeli</span>
                                    <input
                                        value={technicianForm.deviceModel}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({ ...current, deviceModel: event.target.value }))
                                        }
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-100 outline-none transition focus:border-sky-400"
                                        required
                                    />
                                </label>

                                <div>
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Sonuç</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ["SUCCESS", "Başarılı"],
                                            ["FAILED", "Başarısız"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    setTechnicianForm((current) => ({
                                                        ...current,
                                                        resultStatus: value as SolutionStatus,
                                                    }));
                                                }}
                                                className={`h-11 rounded-md border text-sm font-semibold transition ${
                                                    technicianForm.resultStatus === value
                                                        ? value === "SUCCESS"
                                                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                                                            : "border-red-400 bg-red-500/20 text-red-100"
                                                        : "border-slate-700/70 bg-[#0a1726] text-slate-300 hover:border-sky-500/50"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Not</span>
                                    <textarea
                                        value={technicianForm.note}
                                        onChange={(event) =>
                                            setTechnicianForm((current) => ({ ...current, note: event.target.value }))
                                        }
                                        rows={5}
                                        className="w-full resize-none rounded-md border border-slate-700/70 bg-[#0a1726] px-3 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                                        placeholder="Yapılan işlem, kullanılan parça veya başarısızlık sebebi..."
                                    />
                                </label>

                                <div>
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Sonuç</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ["SUCCESS", "Başarılı"],
                                            ["FAILED", "Başarısız"],
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={!selectedFault}
                                                onClick={() =>
                                                    setTechnicianForm((current) => ({
                                                        ...current,
                                                        resultStatus: value as SolutionStatus,
                                                    }))
                                                }
                                                className={`h-11 rounded-md border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                                    technicianForm.resultStatus === value
                                                        ? value === "SUCCESS"
                                                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                                                            : "border-red-400 bg-red-500/20 text-red-100"
                                                        : "border-slate-700/70 bg-[#0a1726] text-slate-300 hover:border-sky-500/50"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {errorMessage && (
                                    <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                        {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 font-bold text-white transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Icon name="plus" className="h-4 w-4" />
                                    {loading ? "Kaydediliyor..." : "Çözüm Kaydını Kaydet"}
                                </button>
                            </form>
                        </section>

                        <section className="min-w-0 rounded-md border border-slate-700/55 bg-[#081827]/92 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            <div className="flex items-center justify-between border-b border-slate-700/45 px-5 py-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Benim Çözüm Kayıtlarım</h2>
                                    <p className="mt-1 text-sm text-slate-400">Toplam {trackings.length} kayıt</p>
                                </div>
                                <label className="hidden h-10 w-full max-w-[360px] items-center rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-400 md:flex">
                                    <Icon name="search" className="mr-3 h-4 w-4" />
                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Hata kodu, cihaz veya not ara..."
                                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                                    />
                                </label>
                            </div>

                            {selectedFault && false && shouldShowSelectedSolution && (
                                <div className="border-b border-slate-700/45 bg-sky-500/6 px-5 py-4">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md border border-sky-400/35 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-200">
                                            {selectedFault!.deviceModel}
                                        </span>
                                        <span className="rounded-md border border-slate-600/60 bg-[#0a1726] px-2.5 py-1 text-xs font-semibold text-slate-200">
                                            {selectedFault!.errorCode}
                                        </span>
                                        <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[technicianForm.resultStatus as SolutionStatus]}`}>
                                            {statusLabels[technicianForm.resultStatus as SolutionStatus]}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{selectedFault!.title}</h3>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {selectedFault!.shortDescription || selectedFault!.description || "Açıklama bulunamadı."}
                                    </p>
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        <div className="rounded-md border border-slate-700/55 bg-[#071422] p-3">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Teknisyen Notu</p>
                                            <p className="mt-2 min-h-[38px] whitespace-pre-line text-sm text-slate-200">
                                                {technicianForm.note.trim() || "-"}
                                            </p>
                                        </div>
                                        <div className="rounded-md border border-slate-700/55 bg-[#071422] p-3">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Kayıt Tarihi</p>
                                            <p className="mt-2 text-sm text-slate-200">{formatDate(new Date().toISOString())}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                                        <div className="rounded-md border border-slate-700/55 bg-[#071422] p-3">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Olası Nedenler</p>
                                            <p className="mt-2 text-sm text-slate-200">{selectedFault!.possibleCauses || "-"}</p>
                                        </div>
                                        <div className="rounded-md border border-slate-700/55 bg-[#071422] p-3 lg:col-span-2">
                                            <p className="text-xs font-semibold uppercase text-slate-500">Çözüm Adımları</p>
                                            <p className="mt-2 whitespace-pre-line text-sm text-slate-200">{selectedFault!.solutionSteps || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid min-h-[560px] content-start gap-3 px-5 py-4 lg:grid-cols-2">
                                {visibleUserTrackings.map((tracking) => {
                                    const trackingFault = getFaultForTracking(tracking);

                                    return (
                                        <article
                                            key={tracking.id}
                                            className="rounded-md border border-slate-700/55 bg-sky-500/6 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.22)]"
                                        >
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="rounded-md border border-sky-400/35 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-200">
                                                    {tracking.deviceModel}
                                                </span>
                                                <span className="rounded-md border border-slate-600/60 bg-[#0a1726] px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                                                    {tracking.errorCode}
                                                </span>
                                                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getUserStatusClass(tracking.resultStatus)}`}>
                                                    {getUserStatusLabel(tracking.resultStatus)}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold text-white">
                                                {trackingFault?.title || `${tracking.errorCode} çözüm kaydı`}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 min-h-[34px] text-xs text-slate-300">
                                                {trackingFault?.shortDescription || trackingFault?.description || "Kayıt için açıklama bulunamadı."}
                                            </p>
                                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                                                <div className="rounded-md border border-slate-700/55 bg-[#081827] p-2.5">
                                                    <p className="text-xs font-semibold uppercase text-slate-500">Teknisyen Notu</p>
                                                    <p className="mt-1 line-clamp-2 min-h-[32px] whitespace-pre-line text-xs text-slate-200">
                                                        {tracking.note || "-"}
                                                    </p>
                                                </div>
                                                <div className="rounded-md border border-slate-700/55 bg-[#081827] p-2.5">
                                                    <p className="text-xs font-semibold uppercase text-slate-500">Kayıt Tarihi</p>
                                                    <p className="mt-1 text-xs text-slate-200">{formatDate(tracking.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 grid gap-2 lg:grid-cols-3">
                                                <div className="rounded-md border border-slate-700/55 bg-[#081827] p-2.5">
                                                    <p className="text-xs font-semibold uppercase text-slate-500">Olası Nedenler</p>
                                                    <p className="mt-1 line-clamp-2 text-xs text-slate-200">{trackingFault?.possibleCauses || "-"}</p>
                                                </div>
                                                <div className="rounded-md border border-slate-700/55 bg-[#081827] p-2.5 lg:col-span-2">
                                                    <p className="text-xs font-semibold uppercase text-slate-500">Çözüm Adımları</p>
                                                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-slate-200">{trackingFault?.solutionSteps || "-"}</p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}

                                {!loading && filteredTrackings.length === 0 && (
                                    <div className="rounded-md border border-slate-700/55 bg-[#071422] px-4 py-10 text-center text-sm text-slate-400 lg:col-span-2">
                                        Henüz size ait çözüm kaydı bulunamadı.
                                    </div>
                                )}
                            </div>

                            {filteredTrackings.length > USER_TRACKINGS_PAGE_SIZE && (
                                <div className="flex items-center justify-between border-t border-slate-700/45 px-5 py-3 text-sm text-slate-400">
                                    <span>
                                        Sayfa {Math.min(userTrackingsPage, userTrackingsPageCount)} / {userTrackingsPageCount}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUserTrackingsPage((current) => Math.max(1, current - 1))}
                                            disabled={userTrackingsPage <= 1}
                                            className="h-8 rounded-md border border-slate-700/70 px-3 text-slate-300 transition hover:border-sky-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Önceki
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setUserTrackingsPage((current) =>
                                                    Math.min(userTrackingsPageCount, current + 1),
                                                )
                                            }
                                            disabled={userTrackingsPage >= userTrackingsPageCount}
                                            className="h-8 rounded-md border border-slate-700/70 px-3 text-slate-300 transition hover:border-sky-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Sonraki
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="hidden overflow-x-auto">
                                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                                    <thead className="bg-[#0b1b2c] text-xs font-semibold text-slate-300">
                                        <tr>
                                            <th className="px-4 py-4">Kayıt No</th>
                                            <th className="px-4 py-4">Hata Kodu</th>
                                            <th className="px-4 py-4">Cihaz Modeli</th>
                                            <th className="px-4 py-4">Sonuç</th>
                                            <th className="px-4 py-4">Not</th>
                                            <th className="px-4 py-4">Tarih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTrackings.map((tracking) => (
                                            <tr key={tracking.id} className="border-t border-slate-700/50 hover:bg-sky-500/8">
                                                <td className="px-4 py-3 font-semibold text-slate-100">
                                                    ARZ-{String(tracking.id).padStart(6, "0")}
                                                </td>
                                                <td className="px-4 py-3 text-slate-200">{tracking.errorCode}</td>
                                                <td className="px-4 py-3 text-slate-200">{tracking.deviceModel}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[tracking.resultStatus]}`}>
                                                        {statusLabels[tracking.resultStatus]}
                                                    </span>
                                                </td>
                                                <td className="max-w-[320px] truncate px-4 py-3 text-slate-300">
                                                    {tracking.note || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{formatDate(tracking.createdAt)}</td>
                                            </tr>
                                        ))}
                                        {!loading && filteredTrackings.length === 0 && (
                                            <tr className="border-t border-slate-700/50">
                                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                                                    Henüz size ait çözüm kaydı bulunamadı.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {loading && (
                                <div className="border-t border-slate-700/45 px-4 py-4 text-sm text-slate-300">
                                    Kayıtlar yükleniyor...
                                </div>
                            )}

                            {false && !loading && filteredTrackings.length === 0 && (
                                <div className="border-t border-slate-700/45 px-4 py-10 text-center text-sm text-slate-400">
                                    Henüz size ait çözüm kaydı bulunamadı.
                                </div>
                            )}
                        </section>
                    </div>
                </section>

                {isSaveConfirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-md border border-slate-600/60 bg-[#0b1726] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <h2 className="text-xl font-bold text-white">Çözüm kaydı kaydedilsin mi?</h2>
                            <p className="mt-3 text-sm text-slate-300">
                                Çözüm kaydı oluşturmak istediğinize emin misiniz?
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSaveConfirmOpen(false)}
                                    className="h-10 rounded-md border border-slate-600/70 px-5 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={saveTracking}
                                    className="h-10 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 px-5 text-sm font-bold text-white transition hover:from-cyan-500 hover:to-blue-500"
                                >
                                    Evet
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardShell>
        );
    }

    return (
        <DashboardShell activePage="solution-trackings">
            <aside className="hidden">
                <div className="flex h-[178px] flex-col items-center justify-center gap-3 border-b border-slate-700/50 px-6">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-sky-300/30 bg-[#0b1e33] shadow-[0_0_34px_rgba(14,165,233,0.22),inset_0_1px_14px_rgba(255,255,255,0.05)]">
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 96 96"
                            className="h-20 w-20"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
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
                    <button
                        type="button"
                        onClick={() => navigate("/faults")}
                        className="flex h-14 w-full items-center gap-4 rounded-md px-4 text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                    >
                        <Icon name="users" className="h-6 w-6" />
                        Hata Yönetimi
                    </button>
                    <button
                        type="button"
                        className="flex h-14 w-full items-center gap-4 rounded-md bg-cyan-500/18 px-4 font-semibold text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]"
                    >
                        <Icon name="clock" className="h-6 w-6" />
                        Çözüm Takibi
                    </button>
                </nav>

                <div className="p-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex h-14 w-full items-center gap-4 rounded-md border border-slate-600/40 px-4 text-[17px] text-slate-300 transition hover:border-red-400/50 hover:text-red-200"
                    >
                        <Icon name="logout" className="h-6 w-6" />
                        Çıkış
                    </button>
                </div>
            </aside>

            <section className="min-w-0 flex-1 overflow-hidden">
            <header className="flex h-[58px] items-center gap-4 border-b border-slate-700/45 bg-[#071422]/95 px-4">
                <div className="flex min-w-[260px] items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-300">
                        <Icon name="clipboard" className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-normal text-white">Çözüm Takip Sayfası</h1>
                </div>

                <label className="ml-auto hidden h-10 w-full max-w-[410px] items-center rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-400 lg:flex">
                    <Icon name="search" className="mr-3 h-4 w-4" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Kayıt No, Hata Kodu, Müşteri veya Cihaz Ara..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    />
                </label>

                <div className="relative">
                    <Icon name="filter" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as SolutionStatus | "")}
                        className="h-10 appearance-none rounded-md border border-sky-500/45 bg-[#0a1726] pl-9 pr-9 text-sm font-semibold text-sky-200 outline-none"
                    >
                        <option value="">Filtreler</option>
                        <option value="SUCCESS">Başarılı</option>
                        <option value="FAILED">Başarısız</option>
                    </select>
                    {statusFilter && (
                        <span className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">
                            1
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 border-l border-slate-700/60 pl-4">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-bold text-white">{user?.fullName || "Kullanıcı"}</p>
                        <p className="text-xs text-slate-400">{getDisplayRole(user?.role)}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/70 bg-slate-700/50 text-slate-200">
                        <Icon name="user" className="h-5 w-5" />
                    </div>
                </div>
            </header>

            <div className="grid h-[calc(100vh-58px)] min-h-0 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_330px]">
                <section className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
                    <div className="grid shrink-0 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                        {metricCards.map((card) => (
                            <article
                                key={card.label}
                                className={`rounded-md border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.22)] ${card.tone}`}
                            >
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

                    <section className="shrink-0 overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                                <thead className="bg-[#0b1b2c] text-xs font-semibold text-slate-300">
                                    <tr>
                                        <th className="px-4 py-4">Kayıt No</th>
                                        <th className="px-4 py-4">Hata Kodu</th>
                                        <th className="px-4 py-4">Cihaz Modeli</th>
                                        <th className="px-4 py-4">Atanan Teknisyen</th>
                                        <th className="px-4 py-4">Durum</th>
                                        <th className="px-4 py-4">Son Güncelleme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleAdminTrackings.map((tracking) => {
                                        const isSelected = selectedTracking?.id === tracking.id;

                                        return (
                                            <tr
                                                key={tracking.id}
                                                onClick={() => setSelectedId(tracking.id)}
                                                className={`cursor-pointer border-t border-slate-700/50 transition ${
                                                    isSelected
                                                        ? "bg-blue-500/16 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.7)]"
                                                        : "hover:bg-sky-500/8"
                                                }`}
                                            >
                                                <td className="px-4 py-3 font-semibold text-slate-100">ARZ-{String(tracking.id).padStart(6, "0")}</td>
                                                <td className="px-4 py-3 text-slate-200">{tracking.errorCode}</td>
                                                <td className="px-4 py-3 text-slate-200">{tracking.deviceModel}</td>
                                                <td className="px-4 py-3 text-slate-200">{tracking.username || "-"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusClasses[tracking.resultStatus]}`}>
                                                        {statusLabels[tracking.resultStatus]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{formatDate(tracking.createdAt)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-700/45 px-4 py-3 text-sm text-slate-400">
                            <span>Toplam {filteredTrackings.length} kayıt</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdminTrackingsPage((page) => Math.max(1, page - 1))}
                                    disabled={currentAdminTrackingsPage === 1}
                                    className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: adminTrackingsPageCount }, (_, index) => index + 1).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setAdminTrackingsPage(page)}
                                        className={`h-8 rounded-md border px-3 ${
                                            page === currentAdminTrackingsPage
                                                ? "border-sky-500 bg-sky-500/20 text-sky-100"
                                                : "border-slate-700/60 text-slate-400"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setAdminTrackingsPage((page) => Math.min(adminTrackingsPageCount, page + 1))}
                                    disabled={currentAdminTrackingsPage === adminTrackingsPageCount}
                                    className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        {loading && (
                            <div className="border-t border-slate-700/45 px-4 py-4 text-sm text-slate-300">
                                Çözüm kayıtları yükleniyor...
                            </div>
                        )}

                        {errorMessage && (
                            <div className="border-t border-red-500/35 bg-red-950/25 px-4 py-4 text-sm text-red-200">
                                {errorMessage}
                            </div>
                        )}

                        {!loading && !errorMessage && filteredTrackings.length === 0 && (
                            <div className="border-t border-slate-700/45 px-4 py-8 text-center text-sm text-slate-400">
                                Filtrelere uygun çözüm takip kaydı bulunamadı.
                            </div>
                        )}
                    </section>

                    <section className="mt-auto grid shrink-0 gap-3 rounded-md border border-slate-700/55 bg-[#081827]/92 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
                        <div>
                            <h2 className="text-sm font-bold text-white">En Çok Değerlendirilen Hata Kaydı</h2>
                            <div className="mt-3 grid items-center gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-slate-700/65 p-2">
                                    <div
                                        className="flex h-full w-full items-center justify-center rounded-full shadow-[inset_0_0_24px_rgba(0,0,0,0.35)]"
                                        style={{ background: `conic-gradient(${topErrorChartGradient})` }}
                                    >
                                        <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-slate-700/70 bg-[#081827]">
                                            <span className="text-lg font-bold text-white">{topErrorTotal}</span>
                                            <span className="text-[10px] font-semibold uppercase text-slate-400">kayıt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {topErrorRecords.length > 0 ? (
                                        topErrorRecords.map((record, index) => (
                                            <div key={record.key} className="grid grid-cols-[24px_minmax(0,1fr)_42px] items-center gap-3 text-sm">
                                                <span
                                                    className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${
                                                        index === 0
                                                            ? "border-sky-500/35 bg-sky-500/10 text-sky-200"
                                                            : index === 1
                                                              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200"
                                                              : "border-orange-500/35 bg-orange-500/10 text-orange-200"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="mb-1 flex items-center justify-between gap-3">
                                                        <p className="truncate font-semibold text-white">
                                                            {record.errorCode} - {record.deviceModel}
                                                        </p>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                index === 0 ? "bg-sky-400" : index === 1 ? "bg-emerald-400" : "bg-orange-400"
                                                            }`}
                                                            style={{ width: `${(record.count / topErrorCount) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-right text-xs font-semibold text-slate-300">{record.count} kayıt</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400">Henüz değerlendirilen hata kaydı yok.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/45 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                            <h2 className="text-sm font-bold text-white">En Çok Çözüm Kaydı Oluşturanlar</h2>
                            <div className="mt-3 space-y-2">
                                {topTechnicians.length > 0 ? (
                                    topTechnicians.map((technician, index) => (
                                        <div
                                            key={technician.username}
                                            className="flex items-center justify-between gap-3 rounded-md border border-slate-700/55 bg-[#0a1726] px-3 py-2 text-sm"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/70 text-xs font-bold text-slate-200">
                                                    {index + 1}
                                                </span>
                                                <span className="truncate font-semibold text-white">{technician.username}</span>
                                            </div>
                                            <span className="shrink-0 text-xs font-semibold text-sky-200">{technician.count} kayıt</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400">Henüz teknisyen kaydı yok.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </section>

                <aside className="rounded-md border border-slate-700/55 bg-[#081827]/92 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
                    {selectedTracking ? (
                        <div className="flex h-full flex-col">
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
                                        ARZ-{String(selectedTracking.id).padStart(6, "0")}
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selectedTracking.errorCode} Çözüm Kaydı</h2>
                                </div>
                            </div>

                            <div className="mb-5">
                                <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[selectedTracking.resultStatus]}`}>
                                    {statusLabels[selectedTracking.resultStatus]}
                                </span>
                            </div>

                            <div className="space-y-4 border-b border-slate-700/45 pb-5 text-sm">
                                {[
                                    ["Atanan Teknisyen", selectedTracking.username || "-", "users" as const],
                                    ["Hata Çözüm ID", selectedTracking.faultSolutionId, "clipboard" as const],
                                    ["Cihaz Modeli", selectedTracking.deviceModel, "device" as const],
                                    ["Oluşturulma Tarihi", formatDate(selectedTracking.createdAt), "calendar" as const],
                                ].map(([label, value, icon]) => (
                                    <div key={label as string} className="grid grid-cols-[22px_1fr] gap-3">
                                        <Icon
                                            name={icon as "users" | "clipboard" | "device" | "calendar"}
                                            className="mt-0.5 h-4 w-4 text-slate-500"
                                        />
                                        <div>
                                            <p className="text-slate-400">{label}</p>
                                            <p className="mt-1 font-semibold text-white">{value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="grid grid-cols-[22px_1fr] gap-3">
                                    <Icon name="clipboard" className="mt-0.5 h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-slate-400">Teknisyen Notu</p>
                                        <p className="mt-1 whitespace-pre-line font-semibold text-white">{selectedTracking.note || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5">
                                <h3 className="mb-4 text-sm font-bold text-white">Çözüm Süreci</h3>
                                <div className="space-y-5">
                                    {[
                                        { title: "Kayıt Açıldı", description: "Kayıt sisteme oluşturuldu", state: "done" },
                                        { title: "İnceleme Yapıldı", description: "Çözüm takibi başlatıldı", state: "done" },
                                        {
                                            title: selectedTracking.resultStatus === "FAILED" ? "Çözüm Denendi" : "Çözüm Uygulandı",
                                            description: selectedTracking.note || "Teknisyen çözüm kaydını işledi",
                                            state: selectedTracking.resultStatus === "IN_PROGRESS" ? "pending" : "done",
                                        },
                                        {
                                            title: selectedTracking.resultStatus === "FAILED" ? "Başarısız Sonuçlandı" : "Başarılı Sonuçlandı",
                                            description: selectedTracking.note || (
                                                selectedTracking.resultStatus === "FAILED"
                                                    ? "Çözüm başarısız olarak işaretlendi."
                                                    : "Çözüm başarılı olarak işaretlendi."
                                            ),
                                            state:
                                                selectedTracking.resultStatus === "FAILED"
                                                    ? "failed"
                                                    : selectedTracking.resultStatus === "SUCCESS"
                                                      ? "done"
                                                      : "pending",
                                        },
                                    ].map((step, index) => {
                                        const isFailed = step.state === "failed";
                                        const isDone = step.state === "done";

                                        return (
                                            <div key={step.title} className="relative grid grid-cols-[28px_1fr] gap-3">
                                                {index < 3 && <div className="absolute left-[13px] top-7 h-9 w-px bg-slate-700" />}
                                                <div
                                                    className={`z-10 flex h-7 w-7 items-center justify-center rounded-full border ${
                                                        isFailed
                                                            ? "border-red-400 bg-red-500 text-white"
                                                            : isDone
                                                              ? "border-emerald-400 bg-emerald-500 text-white"
                                                              : "border-slate-500 bg-[#081827] text-slate-400"
                                                    }`}
                                                >
                                                    {isFailed ? (
                                                        <Icon name="close" className="h-4 w-4" />
                                                    ) : isDone ? (
                                                        <Icon name="check" className="h-4 w-4" />
                                                    ) : (
                                                        <span className="h-2 w-2 rounded-full bg-current" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white">{step.title}</p>
                                                    <p className="mt-1 text-xs text-slate-400">{step.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
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

export default SolutionTrackingPage;
