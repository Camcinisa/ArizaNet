import { useEffect, useMemo, useState } from "react";
import type { FaultSolution } from "../types/fault.types";
import { getFaultSolutions } from "../services/faultService";

type FaultForm = {
    deviceModel: string;
    errorCode: string;
    title: string;
    shortDescription: string;
    possibleCauses: string;
    solutionSteps: string;
    requiredTools: string;
    warnings: string;
};

const emptyForm: FaultForm = {
    deviceModel: "",
    errorCode: "",
    title: "",
    shortDescription: "",
    possibleCauses: "",
    solutionSteps: "",
    requiredTools: "",
    warnings: "",
};

const sampleFaults: FaultSolution[] = [
    {
        id: 1,
        deviceModel: "GFS220",
        errorCode: "2201",
        title: "Besleme Sensörü Hatası",
        shortDescription: "Cihaz para besleme bölümünde sensör algılaması kesildi.",
        possibleCauses: "Sensör kirlenmesi, kablo gevşemesi veya besleme motoru sıkışması.",
        solutionSteps: "Sensör yüzeyini temizleyin, soketleri kontrol edin ve test modunda besleme motorunu çalıştırın.",
        requiredTools: "Antistatik fırça, multimetre, servis tornavidası",
        warnings: "Cihaz enerjisini kesmeden sensör soketlerini çıkarmayın.",
        createdAt: "02.05.2024 14:23",
    },
    {
        id: 2,
        deviceModel: "GFS220",
        errorCode: "2202",
        title: "Motor Sıkışma Hatası",
        shortDescription: "Motor dönmüyor veya zorlanıyor.",
        possibleCauses: "Yabancı cisim, kayış aşınması veya motor sürücü kartı arızası.",
        solutionSteps: "Mekanik yolu temizleyin, kayış gerginliğini kontrol edin ve motor testini çalıştırın.",
        requiredTools: "Servis anahtarı, temizlik aparatı",
        warnings: "Sıkışan parçayı zorlayarak çevirmeyin.",
        createdAt: "02.05.2024 15:10",
    },
    {
        id: 3,
        deviceModel: "ATM100",
        errorCode: "ATM1",
        title: "Kart Okuyucu Hatası",
        shortDescription: "Kart okuyucu kartı tanımlayamıyor.",
        possibleCauses: "Okuyucu lens kirli, bağlantı kablosu gevşek veya firmware uyumsuz.",
        solutionSteps: "Okuyucuyu temizleyin, kablo bağlantılarını sabitleyin ve firmware sürümünü doğrulayın.",
        requiredTools: "Temizlik kartı, servis yazılımı",
        createdAt: "01.05.2024 11:05",
    },
    {
        id: 4,
        deviceModel: "ATM100",
        errorCode: "ATM2",
        title: "Para Sıkışması",
        shortDescription: "Para çıkış ünitesinde sıkışma tespit edildi.",
        possibleCauses: "Katlanmış banknot, kirli silindir veya hatalı hizalama.",
        solutionSteps: "Çıkış kanalını açın, sıkışan banknotu alın ve silindirleri temizleyin.",
        requiredTools: "Lateks eldiven, temizlik bezi",
        warnings: "Banknotu yırtmadan düz kanaldan çıkarın.",
        createdAt: "01.05.2024 11:20",
    },
    {
        id: 5,
        deviceModel: "GFS100",
        errorCode: "1003",
        title: "İletişim Hatası",
        shortDescription: "Ana kart ile alt kart arasında iletişim kesildi.",
        possibleCauses: "RS485 hattı kopuk, kart adresi çakışıyor veya güç düşümü var.",
        solutionSteps: "Haberleşme kablosunu ölçün, kart adreslerini kontrol edin ve güç beslemesini doğrulayın.",
        requiredTools: "Multimetre, yedek haberleşme kablosu",
        createdAt: "30.04.2024 09:45",
    },
    {
        id: 6,
        deviceModel: "GFS220",
        errorCode: "2205",
        title: "Kapak Açık Hatası",
        shortDescription: "Cihaz kapağı açık durumda.",
        possibleCauses: "Kapak switch'i basmıyor veya kapak tam kapanmıyor.",
        solutionSteps: "Kapağı yeniden kapatın, switch hizasını kontrol edin ve gerekirse switch'i değiştirin.",
        warnings: "Kapak güvenlik switch'ini devre dışı bırakmayın.",
        createdAt: "29.04.2024 16:30",
    },
    {
        id: 7,
        deviceModel: "GFS100",
        errorCode: "1001",
        title: "Sensör Kirli Hatası",
        shortDescription: "Sensör yüzeyinde kirlenme algılandı.",
        possibleCauses: "Toz, toner kalıntısı veya nem.",
        solutionSteps: "Sensör penceresini izopropil alkol ile temizleyin ve kalibrasyon yapın.",
        requiredTools: "Mikrofiber bez, izopropil alkol",
        createdAt: "28.04.2024 10:15",
    },
    {
        id: 8,
        deviceModel: "ATM200",
        errorCode: "ATM3",
        title: "Yazıcı Hatası",
        shortDescription: "Yazıcı kağıdı bitmiş veya yazıcı arızalı.",
        possibleCauses: "Kağıt yok, termal kafa kirli veya yazıcı modülü bağlantısı gevşek.",
        solutionSteps: "Kağıdı yenileyin, termal kafayı temizleyin ve test fişi alın.",
        requiredTools: "Termal kağıt, temizlik kalemi",
        createdAt: "27.04.2024 13:40",
    },
    {
        id: 9,
        deviceModel: "GFS220",
        errorCode: "2206",
        title: "Güç Kaynağı Hatası",
        shortDescription: "Güç kaynağı voltajı düşük.",
        possibleCauses: "Adaptör zayıf, regülatör arızalı veya şebeke dalgalanması var.",
        solutionSteps: "Çıkış voltajını ölçün, adaptörü test edin ve regülatör bağlantılarını kontrol edin.",
        requiredTools: "Multimetre, yedek adaptör",
        warnings: "Yanlış voltajlı adaptör kullanmayın.",
        createdAt: "26.04.2024 08:55",
    },
    {
        id: 10,
        deviceModel: "ATM100",
        errorCode: "ATM4",
        title: "PIN Pad Hatası",
        shortDescription: "PIN Pad ile iletişim sağlanamıyor.",
        possibleCauses: "USB hattı kopuk, güvenlik kilidi aktif veya PIN Pad arızalı.",
        solutionSteps: "Bağlantıyı kontrol edin, güvenlik loglarını inceleyin ve PIN Pad testini çalıştırın.",
        requiredTools: "Servis yazılımı, yedek USB kablo",
        createdAt: "25.04.2024 17:05",
    },
];

function Icon({
    name,
    className = "h-5 w-5",
}: {
    name: "alert" | "menu" | "home" | "search" | "users" | "device" | "logout" | "plus" | "refresh" | "edit" | "trash" | "save" | "close" | "chevron" | "user";
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
        alert: (
            <>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
            </>
        ),
        menu: (
            <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
            </>
        ),
        home: (
            <>
                <path d="M3 11 12 4l9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
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
        device: (
            <>
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
                <path d="M10 17h4" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17 15 12l-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
            </>
        ),
        refresh: (
            <>
                <path d="M21 12a9 9 0 0 1-15.2 6.5" />
                <path d="M3 12A9 9 0 0 1 18.2 5.5" />
                <path d="M18 2v4h-4" />
                <path d="M6 22v-4h4" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
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
        chevron: <path d="m6 9 6 6 6-6" />,
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="7" r="4" />
            </>
        ),
    };

    return <svg {...common}>{paths[name]}</svg>;
}

function FaultSearchPage() {
    const [faults, setFaults] = useState<FaultSolution[]>(sampleFaults);
    const [query, setQuery] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [form, setForm] = useState<FaultForm>(emptyForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        getFaultSolutions()
            .then((data) => {
                if (isMounted && data.length > 0) {
                    setFaults(data);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setStatusMessage("Servis bağlantısı kurulamadı, örnek kayıtlar gösteriliyor.");
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const deviceModels = useMemo(
        () => Array.from(new Set(faults.map((fault) => fault.deviceModel))).sort(),
        [faults]
    );

    const filteredFaults = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

        return faults.filter((fault) => {
            const matchesModel = modelFilter === "" || fault.deviceModel === modelFilter;
            const searchableText = [
                fault.deviceModel,
                fault.errorCode,
                fault.title,
                fault.shortDescription,
                fault.description,
                fault.possibleCauses,
                fault.solutionSteps,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("tr-TR");

            return matchesModel && (normalizedQuery === "" || searchableText.includes(normalizedQuery));
        });
    }, [faults, modelFilter, query]);

    const totalPages = Math.max(1, Math.ceil(filteredFaults.length / pageSize));
    const visibleFaults = filteredFaults.slice((page - 1) * pageSize, page * pageSize);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleClearFilters = () => {
        setQuery("");
        setModelFilter("");
        setPage(1);
    };

    const handleEdit = (fault: FaultSolution) => {
        setEditingId(fault.id);
        setForm({
            deviceModel: fault.deviceModel,
            errorCode: fault.errorCode,
            title: fault.title,
            shortDescription: fault.shortDescription || fault.description || "",
            possibleCauses: fault.possibleCauses || "",
            solutionSteps: fault.solutionSteps || "",
            requiredTools: fault.requiredTools || "",
            warnings: fault.warnings || "",
        });
    };

    const handleDelete = (id: number) => {
        setFaults((current) => current.filter((fault) => fault.id !== id));
        if (editingId === id) {
            resetForm();
        }
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextFault: FaultSolution = {
            id: editingId ?? Date.now(),
            deviceModel: form.deviceModel.trim(),
            errorCode: form.errorCode.trim(),
            title: form.title.trim(),
            shortDescription: form.shortDescription.trim(),
            possibleCauses: form.possibleCauses.trim(),
            solutionSteps: form.solutionSteps.trim(),
            requiredTools: form.requiredTools.trim(),
            warnings: form.warnings.trim(),
            createdAt:
                editingId === null
                    ? new Intl.DateTimeFormat("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      }).format(new Date())
                    : faults.find((fault) => fault.id === editingId)?.createdAt,
        };

        setFaults((current) =>
            editingId === null
                ? [nextFault, ...current]
                : current.map((fault) => (fault.id === editingId ? { ...fault, ...nextFault } : fault))
        );
        setStatusMessage(editingId === null ? "Yeni hata kaydı eklendi." : "Hata kaydı güncellendi.");
        resetForm();
    };

    useEffect(() => {
        setPage(1);
    }, [modelFilter, pageSize, query]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    return (
        <main className="min-h-screen bg-[#07111e] text-slate-100">
            <div className="flex min-h-screen bg-[radial-gradient(circle_at_18%_12%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_78%_4%,rgba(59,130,246,0.12),transparent_26%),linear-gradient(135deg,#07111e_0%,#0a1726_48%,#07101c_100%)]">
                <aside className="hidden w-[252px] shrink-0 border-r border-slate-600/30 bg-[#06111d]/90 lg:flex lg:flex-col">
                    <div className="flex h-[76px] items-center gap-3 border-b border-slate-600/30 px-6">
                        <Icon name="alert" className="h-10 w-10 text-cyan-300" />
                        <span className="text-3xl font-bold tracking-normal">ArızaNet</span>
                    </div>

                    <nav className="flex-1 space-y-2 px-4 py-8 text-[15px]">
                        <button className="flex h-12 w-full items-center gap-3 rounded-md px-4 text-slate-300 transition hover:bg-slate-800/80 hover:text-white">
                            <Icon name="home" />
                            Dashboard
                        </button>
                        <button className="flex h-12 w-full items-center gap-3 rounded-md px-4 text-slate-300 transition hover:bg-slate-800/80 hover:text-white">
                            <Icon name="search" />
                            Hata Arama
                        </button>
                        <button className="flex h-12 w-full items-center gap-3 rounded-md bg-cyan-500/18 px-4 text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.9)]">
                            <Icon name="users" />
                            Hata Yönetimi
                        </button>
                        <button className="flex h-12 w-full items-center gap-3 rounded-md px-4 text-slate-300 transition hover:bg-slate-800/80 hover:text-white">
                            <Icon name="users" />
                            Kullanıcılar
                        </button>
                        <button className="flex h-12 w-full items-center gap-3 rounded-md px-4 text-slate-300 transition hover:bg-slate-800/80 hover:text-white">
                            <Icon name="device" />
                            Cihaz Modelleri
                        </button>
                    </nav>

                    <div className="p-4">
                        <button className="flex h-12 w-full items-center gap-3 rounded-md border border-slate-600/40 px-4 text-slate-300 transition hover:border-red-400/50 hover:text-red-200">
                            <Icon name="logout" />
                            Çıkış
                        </button>
                    </div>
                </aside>

                <section className="min-w-0 flex-1">
                    <header className="flex h-[76px] items-center justify-between border-b border-slate-600/30 bg-[#071422]/80 px-5 sm:px-7">
                        <button className="flex h-10 w-10 items-center justify-center rounded-md text-slate-200 transition hover:bg-slate-800">
                            <Icon name="menu" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-white">Admin User</p>
                                <p className="text-xs text-slate-400">Admin</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-500/30 text-slate-200">
                                <Icon name="user" className="h-6 w-6" />
                            </div>
                        </div>
                    </header>

                    <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_398px]">
                        <div className="min-w-0 space-y-5">
                            <section>
                                <h1 className="text-3xl font-bold tracking-normal text-white">Hata Kayıt Yönetimi</h1>
                                <p className="mt-2 text-sm text-slate-300">
                                    Sistemde kayıtlı arıza çözümlerini izleyebilir, düzenleyebilir veya silebilirsiniz.
                                </p>
                            </section>

                            <section className="rounded-lg border border-slate-600/40 bg-[#0b1928]/78 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                                <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_260px_124px_190px]">
                                    <label className="flex h-12 items-center rounded-md border border-slate-600/60 bg-[#0a1724] px-4 text-slate-400 transition-within">
                                        <Icon name="search" className="mr-3 h-5 w-5 shrink-0" />
                                        <input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Hata kodu, başlık veya açıklama ara..."
                                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                                        />
                                    </label>

                                    <label className="relative flex h-12 items-center rounded-md border border-slate-600/60 bg-[#0a1724] px-4">
                                        <select
                                            value={modelFilter}
                                            onChange={(event) => setModelFilter(event.target.value)}
                                            className="h-full w-full appearance-none bg-transparent pr-8 text-sm text-slate-300 outline-none"
                                        >
                                            <option value="">Cihaz modeli seç</option>
                                            {deviceModels.map((model) => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))}
                                        </select>
                                        <Icon name="chevron" className="pointer-events-none absolute right-4 h-4 w-4 text-slate-400" />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="flex h-12 items-center justify-center gap-2 rounded-md border border-slate-600/60 bg-[#0a1724] px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-400/70 hover:bg-slate-800/80"
                                    >
                                        <Icon name="refresh" className="h-4 w-4" />
                                        Temizle
                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-700 px-4 text-sm font-bold text-white shadow-[0_0_24px_rgba(14,165,233,0.28)] transition hover:from-cyan-500 hover:to-blue-600"
                                    >
                                        <Icon name="plus" className="h-5 w-5" />
                                        Yeni Hata Kaydı
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-lg border border-slate-600/40 bg-[#0b1928]/78 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Hata Kayıtları</h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Toplam <span className="font-semibold text-cyan-300">{filteredFaults.length}</span> kayıt bulundu.
                                        </p>
                                    </div>

                                    <label className="flex items-center gap-3 text-sm text-slate-300">
                                        Sayfa başına
                                        <select
                                            value={pageSize}
                                            onChange={(event) => setPageSize(Number(event.target.value))}
                                            className="h-11 rounded-md border border-slate-600/60 bg-[#0a1724] px-3 text-slate-100 outline-none"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                        </select>
                                    </label>
                                </div>

                                {statusMessage && (
                                    <div className="mb-4 rounded-md border border-cyan-500/25 bg-cyan-500/8 px-4 py-3 text-sm text-cyan-100">
                                        {statusMessage}
                                    </div>
                                )}

                                <div className="overflow-hidden rounded-md border border-slate-600/45">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[930px] border-collapse text-left text-sm">
                                            <thead className="bg-[#0c1a2a] text-xs font-semibold text-slate-300">
                                                <tr>
                                                    <th className="px-4 py-4">Cihaz Modeli</th>
                                                    <th className="px-4 py-4">Hata Kodu</th>
                                                    <th className="px-4 py-4">Başlık</th>
                                                    <th className="px-4 py-4">Kısa Açıklama</th>
                                                    <th className="px-4 py-4">Oluşturma Tarihi</th>
                                                    <th className="px-4 py-4">İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleFaults.map((fault) => (
                                                    <tr key={fault.id} className="border-t border-slate-600/35 transition hover:bg-cyan-500/6">
                                                        <td className="px-4 py-4 font-medium text-slate-200">{fault.deviceModel}</td>
                                                        <td className="px-4 py-4 text-slate-200">{fault.errorCode}</td>
                                                        <td className="px-4 py-4 text-slate-100">{fault.title}</td>
                                                        <td className="max-w-[300px] px-4 py-4 leading-5 text-slate-300">
                                                            {fault.shortDescription || fault.description || "Açıklama bulunamadı."}
                                                        </td>
                                                        <td className="px-4 py-4 text-slate-300">{fault.createdAt || "-"}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEdit(fault)}
                                                                    className="flex h-9 items-center gap-2 rounded-md border border-cyan-500/55 px-3 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/12"
                                                                >
                                                                    <Icon name="edit" className="h-4 w-4" />
                                                                    Düzenle
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(fault.id)}
                                                                    className="flex h-9 items-center gap-2 rounded-md border border-red-500/60 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/12"
                                                                >
                                                                    <Icon name="trash" className="h-4 w-4" />
                                                                    Sil
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={page === 1}
                                        className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-600/50 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, index) => {
                                        const pageNumber = index + 1;

                                        return (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setPage(pageNumber)}
                                                className={`h-11 w-11 rounded-md border text-sm font-semibold transition ${
                                                    page === pageNumber
                                                        ? "border-cyan-500 bg-cyan-600 text-white shadow-[0_0_18px_rgba(14,165,233,0.3)]"
                                                        : "border-slate-600/50 text-slate-300 hover:bg-slate-800"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        disabled={page === totalPages}
                                        className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-600/50 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ›
                                    </button>
                                </div>
                            </section>
                        </div>

                        <aside className="rounded-lg border border-slate-600/45 bg-[#0b1928]/88 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.38)]">
                            <div className="mb-7 flex items-center justify-between gap-4">
                                <h2 className="text-2xl font-bold text-white">{editingId === null ? "Yeni Hata Kaydı" : "Hata Kaydını Düzenle"}</h2>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                    <Icon name="close" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-100">Cihaz Modeli *</span>
                                        <input
                                            required
                                            value={form.deviceModel}
                                            onChange={(event) => setForm((current) => ({ ...current, deviceModel: event.target.value }))}
                                            placeholder="Örn: GFS220"
                                            className="h-12 w-full rounded-md border border-slate-600/60 bg-[#0a1724] px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-100">Hata Kodu *</span>
                                        <input
                                            required
                                            value={form.errorCode}
                                            onChange={(event) => setForm((current) => ({ ...current, errorCode: event.target.value }))}
                                            placeholder="Örn: 2201"
                                            className="h-12 w-full rounded-md border border-slate-600/60 bg-[#0a1724] px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                                        />
                                    </label>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-100">Hata Başlığı *</span>
                                    <input
                                        required
                                        value={form.title}
                                        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                        placeholder="Örn: Besleme Sensörü Hatası"
                                        className="h-12 w-full rounded-md border border-slate-600/60 bg-[#0a1724] px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                                    />
                                </label>

                                {[
                                    ["shortDescription", "Hata Açıklaması *", "Hatanın detaylı açıklamasını giriniz...", true],
                                    ["possibleCauses", "Olası Nedenler *", "Olası nedenleri giriniz...", true],
                                    ["solutionSteps", "Çözüm Adımları *", "Çözüm adımlarını madde madde giriniz...", true],
                                    ["requiredTools", "Gerekli Ekipmanlar", "Gerekli ekipmanları giriniz...", false],
                                    ["warnings", "Uyarılar", "Uyarıları giriniz...", false],
                                ].map(([field, label, placeholder, required]) => (
                                    <label key={field as string} className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-100">{label as string}</span>
                                        <textarea
                                            required={required as boolean}
                                            value={form[field as keyof FaultForm]}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    [field as keyof FaultForm]: event.target.value,
                                                }))
                                            }
                                            placeholder={placeholder as string}
                                            className="min-h-[74px] w-full resize-y rounded-md border border-slate-600/60 bg-[#0a1724] px-4 py-3 text-sm leading-5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                                        />
                                    </label>
                                ))}

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex h-12 items-center justify-center rounded-md border border-slate-600/60 bg-[#0a1724] font-semibold text-slate-200 transition hover:bg-slate-800"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-700 font-bold text-white shadow-[0_0_24px_rgba(14,165,233,0.28)] transition hover:from-cyan-500 hover:to-blue-600"
                                    >
                                        <Icon name="save" className="h-5 w-5" />
                                        Kaydet
                                    </button>
                                </div>

                                <p className="text-sm text-slate-400">
                                    <span className="font-bold text-red-400">*</span> zorunlu alanlardır.
                                </p>
                            </form>
                        </aside>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default FaultSearchPage;
