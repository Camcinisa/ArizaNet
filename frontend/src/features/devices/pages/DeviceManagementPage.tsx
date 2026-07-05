import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import DashboardShell from "../../../app/DashboardShell";
import { useAuthStore } from "../../../store/authStore";
import { getFaultSolutions } from "../../fault/services/faultService";
import type { FaultSolution } from "../../fault/types/fault.types";
import {
    activateDeviceModel,
    createDeviceModel,
    deactivateDeviceModel,
    getDeviceModels,
    updateDeviceModel,
} from "../services/deviceService";
import type { DeviceModel } from "../types/device.types";

type DeviceFilter = "all" | "active" | "passive";

type DeviceForm = {
    modelName: string;
    externalModelId: string;
};

const emptyForm: DeviceForm = {
    modelName: "",
    externalModelId: "",
};
const DEVICE_MODELS_PAGE_SIZE = 7;
const ATTACHED_FAULTS_PAGE_SIZE = 5;
const STORED_FAULTS_KEY = "arizanet_fault_records";

function getStoredFaults(): FaultSolution[] {
    const storedFaults = localStorage.getItem(STORED_FAULTS_KEY);

    if (!storedFaults) {
        return [];
    }

    try {
        const parsedFaults = JSON.parse(storedFaults);
        return Array.isArray(parsedFaults) ? (parsedFaults as FaultSolution[]) : [];
    } catch {
        localStorage.removeItem(STORED_FAULTS_KEY);
        return [];
    }
}

function mergeFaults(serviceFaults: FaultSolution[], storedFaults: FaultSolution[]) {
    const faultsById = new Map<number, FaultSolution>();

    serviceFaults.forEach((fault) => faultsById.set(fault.id, fault));
    storedFaults.forEach((fault) => faultsById.set(fault.id, { ...faultsById.get(fault.id), ...fault }));

    return Array.from(faultsById.values());
}

function Icon({
    name,
    className = "h-5 w-5",
}: {
    name:
        | "box"
        | "check"
        | "pause"
        | "search"
        | "plus"
        | "filter"
        | "edit"
        | "eye"
        | "power"
        | "calendar"
        | "hash"
        | "close"
        | "refresh"
        | "info"
        | "user";
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
        pause: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M10 8v8" />
                <path d="M14 8v8" />
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
        filter: (
            <>
                <path d="M4 5h16" />
                <path d="M7 12h10" />
                <path d="M10 19h4" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ),
        power: (
            <>
                <path d="M12 2v10" />
                <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
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
        hash: (
            <>
                <path d="M4 9h16" />
                <path d="M4 15h16" />
                <path d="M10 3 8 21" />
                <path d="m16 3-2 18" />
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
        info: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
            </>
        ),
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
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

function normalizeText(value?: string | number | null) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("tr-TR");
}

function DeviceThumbnail({ modelName, active }: { modelName: string; active: boolean }) {
    const initials = modelName
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toLocaleUpperCase("tr-TR");

    return (
        <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${
                active
                    ? "border-sky-400/45 bg-sky-500/12 text-sky-200"
                    : "border-amber-400/35 bg-amber-500/10 text-amber-200"
            }`}
        >
            <Icon name="box" className="absolute h-8 w-8 opacity-25" />
            <span className="relative text-xs font-black">{initials || "CM"}</span>
        </div>
    );
}

function DeviceManagementPage() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "Admin";
    const [models, setModels] = useState<DeviceModel[]>([]);
    const [faults, setFaults] = useState<FaultSolution[]>([]);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<DeviceFilter>("all");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<DeviceForm>(emptyForm);
    const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmToggleModel, setConfirmToggleModel] = useState<DeviceModel | null>(null);
    const [page, setPage] = useState(1);
    const [faultPage, setFaultPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadModels = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            const data = await getDeviceModels();
            const sortedModels = [...data].sort((first, second) =>
                first.modelName.localeCompare(second.modelName, "tr-TR"),
            );

            setModels(sortedModels);
            setSelectedId((current) => current ?? sortedModels[0]?.id ?? null);
        } catch {
            setErrorMessage("Cihaz modelleri yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const loadFaults = async () => {
        try {
            const data = await getFaultSolutions();
            setFaults(mergeFaults(data, getStoredFaults()));
        } catch {
            setFaults(getStoredFaults());
        }
    };

    useEffect(() => {
        loadModels();
        loadFaults();
    }, []);

    const stats = useMemo(
        () => {
            const modelIds = new Set(models.map((model) => model.id));
            const modelNames = new Set(models.map((model) => normalizeText(model.modelName)).filter(Boolean));

            return {
            total: models.length,
            active: models.filter((model) => model.active).length,
            passive: models.filter((model) => !model.active).length,
            relatedFaults: faults.filter(
                (fault) => modelIds.has(fault.deviceModelId ?? -1) || modelNames.has(normalizeText(fault.deviceModel)),
            ).length,
            };
        },
        [faults, models],
    );

    const filteredModels = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

        return models.filter((model) => {
            const matchesFilter =
                filter === "active" ? model.active : filter === "passive" ? !model.active : true;
            const searchableText = [model.id, model.externalModelId, model.modelName, model.active ? "aktif" : "pasif"]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            return matchesFilter && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
        });
    }, [filter, models, query]);

    const pageCount = Math.max(1, Math.ceil(filteredModels.length / DEVICE_MODELS_PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visibleModels = filteredModels.slice(
        (currentPage - 1) * DEVICE_MODELS_PAGE_SIZE,
        currentPage * DEVICE_MODELS_PAGE_SIZE,
    );
    const emptyRowCount = Math.max(0, DEVICE_MODELS_PAGE_SIZE - visibleModels.length);

    const selectedModel =
        filteredModels.find((model) => model.id === selectedId) ?? filteredModels[0] ?? models[0] ?? null;

    const attachedFaults = useMemo(() => {
        if (!selectedModel) {
            return [];
        }

        const selectedModelName = normalizeText(selectedModel.modelName);
        return faults.filter((fault) =>
            fault.deviceModelId === selectedModel.id || normalizeText(fault.deviceModel) === selectedModelName,
        );
    }, [faults, selectedModel]);

    const attachedFaultPageCount = Math.max(1, Math.ceil(attachedFaults.length / ATTACHED_FAULTS_PAGE_SIZE));
    const currentAttachedFaultPage = Math.min(faultPage, attachedFaultPageCount);
    const visibleAttachedFaults = attachedFaults.slice(
        (currentAttachedFaultPage - 1) * ATTACHED_FAULTS_PAGE_SIZE,
        currentAttachedFaultPage * ATTACHED_FAULTS_PAGE_SIZE,
    );

    useEffect(() => {
        setPage(1);
    }, [filter, query]);

    useEffect(() => {
        setPage((current) => Math.min(current, pageCount));
    }, [pageCount]);

    useEffect(() => {
        setFaultPage(1);
    }, [selectedModel?.id]);

    useEffect(() => {
        setFaultPage((current) => Math.min(current, attachedFaultPageCount));
    }, [attachedFaultPageCount]);

    const openCreateForm = () => {
        setEditingModel(null);
        setForm(emptyForm);
        setErrorMessage("");
        setSuccessMessage("");
        setIsFormOpen(true);
    };

    const openEditForm = (model: DeviceModel) => {
        setEditingModel(model);
        setForm({
            modelName: model.modelName,
            externalModelId: model.externalModelId ? String(model.externalModelId) : "",
        });
        setErrorMessage("");
        setSuccessMessage("");
        setIsFormOpen(true);
    };

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.modelName.trim()) {
            setErrorMessage("Model adı boş bırakılamaz.");
            return;
        }

        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            const payload = {
                modelName: form.modelName.trim(),
                externalModelId: form.externalModelId.trim() ? Number(form.externalModelId) : null,
            };

            const savedModel = editingModel
                ? await updateDeviceModel(editingModel.id, payload)
                : await createDeviceModel(payload);

            setIsFormOpen(false);
            setSelectedId(savedModel.id);
            setSuccessMessage(editingModel ? "Cihaz modeli güncellendi." : "Yeni cihaz modeli eklendi.");
            await loadModels();
        } catch {
            setErrorMessage("Cihaz modeli kaydedilirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (model: DeviceModel) => {
        try {
            setLoading(true);
            setConfirmToggleModel(null);
            setErrorMessage("");
            setSuccessMessage("");
            if (model.active) {
                await deactivateDeviceModel(model.id);
                setSuccessMessage("Cihaz modeli pasif duruma alındı.");
            } else {
                await activateDeviceModel(model.id);
                setSuccessMessage("Cihaz modeli aktif duruma alındı.");
            }
            await loadModels();
        } catch {
            setErrorMessage("Cihaz modeli pasife alınırken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const metricCards = [
        {
            label: "Toplam Model",
            value: stats.total,
            helper: "database kayıtları",
            icon: "box" as const,
            tone: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        },
        {
            label: "Aktif Modeller",
            value: stats.active,
            helper: "kullanıma açık",
            icon: "check" as const,
            tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        },
        {
            label: "Pasif Modeller",
            value: stats.passive,
            helper: "pasif durumdaki",
            icon: "pause" as const,
            tone: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        },
        {
            label: "Bağlı Hata Kaydı",
            value: stats.relatedFaults,
            helper: "cihaz modelleriyle ilişkili",
            icon: "calendar" as const,
            tone: "border-violet-500/30 bg-violet-500/10 text-violet-300",
        },
    ];

    return (
        <DashboardShell activePage="devices">
            <section className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#06111f] text-slate-100">
                <header className="flex h-[72px] shrink-0 flex-wrap items-center gap-4 border-b border-slate-700/45 bg-[#071422]/95 px-5 py-3">
                    <div className="min-w-[260px]">
                        <h1 className="text-2xl font-bold tracking-normal text-white">Cihaz Yönetimi</h1>
                        <p className="mt-1 text-sm text-slate-400">Cihaz modellerini yönet, ara ve durumlarını güncelle.</p>
                    </div>

                    <label className="ml-auto flex h-11 w-full max-w-[420px] items-center rounded-md border border-slate-700/70 bg-[#0a1726] px-3 text-slate-400">
                        <Icon name="search" className="mr-3 h-4 w-4" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Ara: model adı, kod veya durum..."
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        disabled={!isAdmin}
                        className="flex h-11 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <Icon name="plus" className="h-4 w-4" />
                        Yeni Cihaz Modeli
                    </button>

                    <div className="flex items-center gap-3 border-l border-slate-700/60 pl-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-white">{user?.fullName || "Kullanıcı"}</p>
                            <p className="text-xs text-slate-400">{user?.role || "-"}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/70 bg-slate-700/50 text-slate-200">
                            <Icon name="user" className="h-5 w-5" />
                        </div>
                    </div>
                </header>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="flex min-h-0 min-w-0 flex-col">
                        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
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

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    ["all", "Tümü"],
                                    ["active", "Aktif"],
                                    ["passive", "Pasif"],
                                ].map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setFilter(value as DeviceFilter)}
                                        className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                                            filter === value
                                                ? "border-sky-500 bg-sky-500/16 text-sky-100"
                                                : "border-slate-700/65 bg-[#0a1726] text-slate-300 hover:border-sky-500/60"
                                        }`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${
                                                value === "active" ? "bg-emerald-400" : value === "passive" ? "bg-amber-400" : "bg-sky-400"
                                            }`}
                                        />
                                        {label}
                                    </button>
                                ))}
                            </div>

                        </div>

                        <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 shadow-[0_18px_52px_rgba(0,0,0,0.26)]">
                            <div className="h-[640px] shrink-0 overflow-x-auto">
                                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                                    <thead className="bg-[#0b1b2c] text-xs font-semibold text-slate-300">
                                        <tr>
                                            <th className="px-4 py-4">Cihaz Modeli</th>
                                            <th className="px-4 py-4">External ID</th>
                                            <th className="px-4 py-4">Durum</th>
                                            <th className="px-4 py-4">İlk Kayıt Tarihi</th>
                                            <th className="px-4 py-4">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleModels.map((model) => {
                                            const isSelected = selectedModel?.id === model.id;

                                            return (
                                                <tr
                                                    key={model.id}
                                                    onClick={() => setSelectedId(model.id)}
                                                    className={`cursor-pointer border-t border-slate-700/50 transition ${
                                                        isSelected
                                                            ? "bg-blue-500/16 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.7)]"
                                                            : "hover:bg-sky-500/8"
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <DeviceThumbnail modelName={model.modelName} active={model.active} />
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-white">{model.modelName}</p>
                                                                <p className="text-xs text-slate-400">Model No: {model.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-200">{model.externalModelId ?? "-"}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                                                                model.active
                                                                    ? "border-emerald-400/35 bg-emerald-500/18 text-emerald-300"
                                                                                : "border-red-400/45 bg-red-500/18 text-red-300"
                                                            }`}
                                                        >
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {model.active ? "Aktif" : "Pasif"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{formatDate(model.createdAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    openEditForm(model);
                                                                }}
                                                                disabled={!isAdmin}
                                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/45 bg-sky-500/10 text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                                                                title="Düzenle"
                                                            >
                                                                <Icon name="edit" className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setSelectedId(model.id);
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/45 bg-blue-500/10 text-blue-300 transition hover:bg-blue-500/20"
                                                                title="Detay"
                                                            >
                                                                <Icon name="eye" className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setConfirmToggleModel(model);
                                                                }}
                                                                disabled={!isAdmin || loading}
                                                                className={`relative h-7 w-12 rounded-full border transition ${
                                                                    model.active
                                                                        ? "border-emerald-400/60 bg-emerald-500/45"
                                                                        : "border-red-400/60 bg-red-500/35"
                                                                } disabled:cursor-not-allowed`}
                                                                title={model.active ? "Pasife al" : "Aktife al"}
                                                            >
                                                                <span
                                                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                                                        model.active ? "left-6" : "left-1"
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {Array.from({ length: emptyRowCount }, (_, index) => (
                                            <tr key={`empty-${index}`} className="border-t border-slate-700/50">
                                                <td className="px-4 py-3" colSpan={5}>
                                                    <div className="h-12" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/45 px-4 py-3 text-sm text-slate-400">
                                <span>Toplam {filteredModels.length} kayıt</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                                        disabled={currentPage === 1}
                                        className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ‹
                                    </button>
                                    <span className="min-w-[58px] text-center text-sm font-semibold text-sky-100">
                                        {currentPage} / {pageCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                                        disabled={currentPage === pageCount}
                                        className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div className="border-t border-slate-700/45 px-4 py-4 text-sm text-slate-300">
                                    Cihaz modelleri yükleniyor...
                                </div>
                            )}

                            {errorMessage && (
                                <div className="border-t border-red-500/35 bg-red-950/25 px-4 py-4 text-sm text-red-200">
                                    {errorMessage}
                                </div>
                            )}

                            {successMessage && (
                                <div className="border-t border-emerald-500/30 bg-emerald-950/20 px-4 py-4 text-sm text-emerald-200">
                                    {successMessage}
                                </div>
                            )}

                            {!loading && !errorMessage && filteredModels.length === 0 && (
                                <div className="border-t border-slate-700/45 px-4 py-8 text-center text-sm text-slate-400">
                                    Filtrelere uygun cihaz modeli bulunamadı.
                                </div>
                            )}
                        </section>

                        
                    </section>

                    <aside className="min-h-0 overflow-hidden rounded-md border border-slate-700/55 bg-[#081827]/92 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.28)]">
                        {selectedModel ? (
                            <div className="flex h-full min-h-0 flex-col">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-slate-400">CM-{String(selectedModel.id).padStart(5, "0")}</p>
                                        <h2 className="text-xl font-bold text-white">Cihaz Modeli Detayı</h2>
                                    </div>
                                </div>

                                <div className="mb-5 flex items-center gap-3 rounded-md border border-slate-700/55 bg-[#0a1726] p-3">
                                    <DeviceThumbnail modelName={selectedModel.modelName} active={selectedModel.active} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start gap-2">
                                            <h3 className="min-w-0 flex-1 break-words text-base font-bold leading-5 text-white">
                                                {selectedModel.modelName}
                                            </h3>
                                            <span
                                                className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
                                                    selectedModel.active
                                                        ? "bg-emerald-500/18 text-emerald-300"
                                                        : "bg-red-500/18 text-red-300"
                                                }`}
                                            >
                                                {selectedModel.active ? "Aktif" : "Pasif"}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-400">Device Service modeli</p>
                                    </div>
                                </div>

                                <div className="space-y-4 border-b border-slate-700/45 pb-5 text-sm">
                                    {[
                                        ["Model ID", selectedModel.id, "hash" as const],
                                        ["External Model ID", selectedModel.externalModelId ?? "-", "hash" as const],
                                        ["İlk Kayıt Tarihi", formatDate(selectedModel.createdAt), "calendar" as const],
                                    ].map(([label, value, icon]) => (
                                        <div key={label as string} className="grid grid-cols-[22px_1fr] gap-3">
                                            <Icon name={icon as "hash" | "calendar"} className="mt-0.5 h-4 w-4 text-slate-500" />
                                            <div>
                                                <p className="text-slate-400">{label}</p>
                                                <p className="mt-1 font-semibold text-white">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Bağlı Hatalar</h3>
                                            <p className="mt-1 text-xs text-slate-400">Bu cihaza ait hata kayıtları</p>
                                        </div>
                                        <div className="rounded-md border border-sky-500/35 bg-sky-500/12 px-3 py-2 text-right">
                                            <p className="text-[11px] font-semibold text-sky-300">Bağlı Hata Kaydı</p>
                                            <p className="text-lg font-bold text-white">{attachedFaults.length}</p>
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-700/50">
                                        {visibleAttachedFaults.length > 0 ? (
                                            <div className="divide-y divide-slate-700/45">
                                                {visibleAttachedFaults.map((fault) => (
                                                    <div key={fault.id} className="min-h-[72px] px-3 py-2">
                                                        <p className="text-xs font-semibold text-slate-300">
                                                            Hata Kodu: <span className="font-bold text-blue-200">{fault.errorCode}</span>
                                                        </p>
                                                        <p className="mt-2 truncate text-sm font-semibold text-white">
                                                            Hata Başlığı: {fault.title}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                                                Bu modele bağlı hata kaydı yok.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-end gap-2 text-sm">
                                        <button
                                            type="button"
                                            onClick={() => setFaultPage((value) => Math.max(1, value - 1))}
                                            disabled={currentAttachedFaultPage === 1}
                                            className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            ‹
                                        </button>
                                        <span className="min-w-[58px] text-center text-sm font-semibold text-sky-100">
                                            {currentAttachedFaultPage} / {attachedFaultPageCount}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFaultPage((value) => Math.min(attachedFaultPageCount, value + 1))}
                                            disabled={currentAttachedFaultPage === attachedFaultPageCount}
                                            className="h-8 rounded-md border border-slate-700/60 px-3 text-slate-400 transition hover:border-sky-500/60 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                                Detay görüntülemek için bir cihaz modeli seçin.
                            </div>
                        )}
                    </aside>
                </div>

                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                        <section className="w-full max-w-lg rounded-md border border-slate-600/55 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {editingModel ? "Cihaz Modelini Düzenle" : "Yeni Cihaz Modeli"}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-400">Model bilgileri Device Service database'ine kaydedilir.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <Icon name="close" className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">Model Adı</span>
                                    <input
                                        value={form.modelName}
                                        onChange={(event) => setForm((current) => ({ ...current, modelName: event.target.value }))}
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"
                                        placeholder="Örn: GFS220"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-200">External Model ID</span>
                                    <input
                                        value={form.externalModelId}
                                        onChange={(event) => setForm((current) => ({ ...current, externalModelId: event.target.value }))}
                                        type="number"
                                        className="h-11 w-full rounded-md border border-slate-700/70 bg-[#071422] px-3 text-sm text-slate-100 outline-none transition focus:border-sky-500"

                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-3 pt-2">
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
                                        className="flex h-11 items-center justify-center rounded-md bg-blue-600 font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}

                {confirmToggleModel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6">
                        <section className="w-full max-w-md rounded-lg border border-slate-500/45 bg-[#0b1928] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Onay</h2>
                                    <p className="mt-3 text-[16px] leading-6 text-slate-200">
                                        {confirmToggleModel.active
                                            ? "Bu cihaz modelini pasifleştirmek istediğinize emin misiniz?"
                                            : "Bu cihaz modelini aktifleştirmek istediğinize emin misiniz?"}
                                    </p>
                                    <p className="mt-2 break-words text-sm font-semibold text-slate-400">
                                        {confirmToggleModel.modelName}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfirmToggleModel(null)}
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmToggleModel(null)}
                                    className="flex h-11 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                                >
                                    İptal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleActive(confirmToggleModel)}
                                    disabled={loading}
                                    className={`flex h-11 items-center justify-center rounded-md font-bold text-white shadow-[0_0_24px_rgba(0,0,0,0.22)] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        confirmToggleModel.active
                                            ? "bg-red-700 hover:bg-red-600"
                                            : "bg-emerald-700 hover:bg-emerald-600"
                                    }`}
                                >
                                    {confirmToggleModel.active ? "Pasifleştir" : "Aktifleştir"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </section>
        </DashboardShell>
    );
}

export default DeviceManagementPage;
