import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import loginBg from "../../../assets/login-bg.png";
import { useAuthStore } from "../../../store/authStore";
import { login } from "../services/authService";

const REMEMBERED_PASSWORDS_KEY = "arizanet:remembered-passwords";

function getRememberedPasswords(): Record<string, string> {
    const rememberedPasswords = localStorage.getItem(REMEMBERED_PASSWORDS_KEY);

    if (!rememberedPasswords) {
        return {};
    }

    try {
        return JSON.parse(rememberedPasswords) as Record<string, string>;
    } catch {
        localStorage.removeItem(REMEMBERED_PASSWORDS_KEY);
        return {};
    }
}

function getRememberedPassword(username: string) {
    return getRememberedPasswords()[username.trim()] ?? "";
}

function hasRememberedPassword(username: string) {
    return Boolean(getRememberedPasswords()[username.trim()]);
}

function setRememberedPassword(username: string, password: string) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
        return;
    }

    localStorage.setItem(
        REMEMBERED_PASSWORDS_KEY,
        JSON.stringify({
            ...getRememberedPasswords(),
            [normalizedUsername]: password,
        }),
    );
}

function removeRememberedPassword(username: string) {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
        return;
    }

    const rememberedPasswords = getRememberedPasswords();
    delete rememberedPasswords[normalizedUsername];
    localStorage.setItem(REMEMBERED_PASSWORDS_KEY, JSON.stringify(rememberedPasswords));
}

function LoginPage() {
    const navigate = useNavigate();
    const setLogin = useAuthStore((state) => state.setLogin);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleUsernameChange = (value: string) => {
        setUsername(value);

        const rememberedPassword = getRememberedPassword(value);
        if (rememberedPassword) {
            setPassword(rememberedPassword);
            setRememberMe(true);
            return;
        }

        setPassword("");
        setRememberMe(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            setErrorMessage("");

            const response = await login({
                username: username.trim(),
                password,
            });

            console.log("Login response:", response);

            if (rememberMe && !hasRememberedPassword(username)) {
                const shouldRememberPassword = window.confirm("Bu kullanıcı için şifre kaydedilsin mi?");

                if (shouldRememberPassword) {
                    setRememberedPassword(username, password);
                } else {
                    removeRememberedPassword(username);
                    setRememberMe(false);
                }
            } else if (rememberMe) {
                setRememberedPassword(username, password);
            } else {
                removeRememberedPassword(username);
            }

            setLogin(response, username.trim());
            navigate(response.role === "Admin" ? "/users" : "/profile", { replace: true });
        } catch (error) {
            console.error("Login hatası:", error);
            setErrorMessage("Giriş sırasında hata oluştu. Lütfen kullanıcı adı ya da parolanızı kontrol ediniz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[#01040d] text-white">
            <div className="relative min-h-screen">
                <img
                    src={loginBg}
                    alt="ArızaNet teknik servis arka planı"
                    className="absolute inset-0 h-full w-full object-contain"
                />
                <div className="absolute inset-0 bg-[#020713]/5" />

                <div className="relative mx-auto flex min-h-screen max-w-[1680px] items-center justify-end px-10 py-10">
                    <section className="mr-[4.2%] flex w-full max-w-[565px] items-center justify-center">
                        <div className="w-full rounded-[1.65rem] border border-slate-300/30 bg-[#0b1726]/72 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                            <div className="mb-9 text-center">
                                <div className="mx-auto mb-7 flex h-[92px] w-[170px] items-center justify-center">
                                    <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-sky-300/30 bg-[#102238]/75 shadow-[0_0_28px_rgba(59,130,246,0.22)]">
                                        <div className="absolute h-[126px] w-[126px] rounded-full border border-sky-300/10" />
                                        <div className="absolute h-[68px] w-[160px] border-y border-sky-300/10" />
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="h-10 w-10 text-sky-200"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        >
                                            <rect x="5" y="11" width="14" height="10" rx="2" />
                                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                        </svg>
                                    </div>
                                </div>

                                <h1 className="text-[38px] font-bold leading-none tracking-normal drop-shadow">
                                    Sisteme Giriş
                                </h1>
                                <p className="mt-4 text-[16px] text-slate-300">
                                    Lütfen kullanıcı bilgilerinizi girerek sisteme giriş yapın.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-7">
                                <div>
                                    <label className="mb-3 block text-[17px] font-semibold text-slate-100">
                                        Kullanıcı Adı
                                    </label>
                                    <div className="flex h-[64px] items-center rounded-lg border border-slate-500/55 bg-[#0f1f31]/72 px-5 shadow-[inset_0_1px_8px_rgba(255,255,255,0.03)] transition focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/25">
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="mr-4 h-6 w-6 shrink-0 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        >
                                            <path d="M20 21a8 8 0 0 0-16 0" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(event) => handleUsernameChange(event.target.value)}
                                            placeholder="Kullanıcı adınızı giriniz"
                                            autoComplete="username"
                                            name="username"
                                            className="min-w-0 flex-1 bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 block text-[17px] font-semibold text-slate-100">
                                        Şifre
                                    </label>
                                    <div className="flex h-[64px] items-center rounded-lg border border-slate-500/55 bg-[#0f1f31]/72 px-5 shadow-[inset_0_1px_8px_rgba(255,255,255,0.03)] transition focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/25">
                                        <svg
                                            aria-hidden="true"
                                            viewBox="0 0 24 24"
                                            className="mr-4 h-6 w-6 shrink-0 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        >
                                            <rect x="5" y="11" width="14" height="10" rx="2" />
                                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                                        </svg>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            placeholder="Şifrenizi giriniz"
                                            autoComplete={rememberMe ? "current-password" : "off"}
                                            name="password"
                                            className="min-w-0 flex-1 bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-700/45 hover:text-sky-200"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    aria-hidden="true"
                                                    viewBox="0 0 24 24"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                                    <path d="M6.61 6.61C3.99 8.38 2 12 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                                    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                                                    <path d="M2 2l20 20" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    aria-hidden="true"
                                                    viewBox="0 0 24 24"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                >
                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 text-[17px]">
                                    <label className="flex items-center gap-3 text-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(event) => setRememberMe(event.target.checked)}
                                            className="h-6 w-6 rounded border-slate-500 accent-cyan-400"
                                        />
                                        Beni Hatırla
                                    </label>


                                </div>

                                {errorMessage && (
                                    <p className="rounded-lg border border-red-400/30 bg-red-950/35 px-4 py-3 text-[15px] font-medium text-red-200">
                                        {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex h-[67px] w-full items-center justify-center gap-4 rounded-lg bg-gradient-to-r from-[#0e7490] to-[#1d4ed8] px-5 text-[19px] font-bold text-white shadow-[0_0_28px_rgba(37,99,235,0.34)] transition hover:scale-[1.01] hover:from-[#0891b2] hover:to-[#2563eb] disabled:cursor-not-allowed disabled:opacity-65"
                                >
                                    <span className="text-[30px] leading-none">↪</span>
                                    {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
                                </button>
                            </form>

                            
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;
