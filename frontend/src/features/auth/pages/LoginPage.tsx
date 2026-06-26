import loginBg from "../../../assets/login-bg.png";

function LoginPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#01040d] text-white">
            <div className="relative min-h-screen">
                <img
                    src={loginBg}
                    alt="ArızaNet teknik servis arka planı"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[#020713]/5" />

                <div className="relative mx-auto flex min-h-screen max-w-[1680px] items-center justify-end px-10 py-10">
                    <section className="mr-[4.2%] flex w-full max-w-[565px] items-center justify-center">
                        <div className="w-full rounded-[1.65rem] border border-slate-300/30 bg-[#0b1726]/72 p-10 shadow-[0_24px_80px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                            <div className="mb-9 text-center">
                                <div className="mx-auto mb-7 flex h-[92px] w-[170px] items-center justify-center">
                                    <div className="relative flex h-[92px] w-[92px] items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-400/8 shadow-[0_0_34px_rgba(14,165,233,0.3)]">
                                        <div className="absolute h-[126px] w-[126px] rounded-full border border-cyan-400/10" />
                                        <div className="absolute h-[68px] w-[160px] border-y border-cyan-400/10" />
                                        <span className="text-[42px] leading-none text-cyan-300">▣</span>
                                    </div>
                                </div>

                                <h1 className="text-[38px] font-bold leading-none tracking-normal drop-shadow">
                                    Sisteme Giriş
                                </h1>
                                <p className="mt-4 text-[16px] text-slate-300">
                                    Lütfen kullanıcı bilgilerinizi girerek sisteme giriş yapın.
                                </p>
                            </div>

                            <form className="space-y-7">
                                <div>
                                    <label className="mb-3 block text-[17px] font-semibold text-slate-100">
                                        Kullanıcı Adı
                                    </label>
                                    <div className="flex h-[64px] items-center rounded-lg border border-slate-500/55 bg-[#0f1f31]/72 px-5 shadow-[inset_0_1px_8px_rgba(255,255,255,0.03)] transition focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/25">
                                        <span className="mr-4 text-[28px] leading-none text-slate-400">♙</span>
                                        <input
                                            type="text"
                                            placeholder="Kullanıcı adınızı giriniz"
                                            className="min-w-0 flex-1 bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-3 block text-[17px] font-semibold text-slate-100">
                                        Şifre
                                    </label>
                                    <div className="flex h-[64px] items-center rounded-lg border border-slate-500/55 bg-[#0f1f31]/72 px-5 shadow-[inset_0_1px_8px_rgba(255,255,255,0.03)] transition focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/25">
                                        <span className="mr-4 text-[25px] leading-none text-slate-400">▣</span>
                                        <input
                                            type="password"
                                            placeholder="Şifrenizi giriniz"
                                            className="min-w-0 flex-1 bg-transparent text-[18px] text-slate-100 outline-none placeholder:text-slate-500"
                                        />
                                        <span className="ml-4 text-[28px] leading-none text-slate-400">⊙</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 text-[17px]">
                                    <label className="flex items-center gap-3 text-slate-200">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="h-6 w-6 rounded border-slate-500 accent-cyan-400"
                                        />
                                        Beni hatırla
                                    </label>

                                    <button
                                        type="button"
                                        className="font-medium text-cyan-300 transition hover:text-cyan-200"
                                    >
                                        Şifremi unuttum
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="flex h-[67px] w-full items-center justify-center gap-4 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 px-5 text-[19px] font-bold text-white shadow-[0_0_32px_rgba(14,165,233,0.42)] transition hover:scale-[1.01] hover:from-cyan-300 hover:to-blue-500"
                                >
                                    <span className="text-[30px] leading-none">↪</span>
                                    Giriş Yap
                                </button>
                            </form>

                            <p className="mt-11 text-center text-[14px] text-slate-500">
                                Yetkisiz erişim denemeleri kayıt altına alınır.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;
