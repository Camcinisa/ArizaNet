import { Outlet } from "react-router-dom";

function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
                <h1 className="text-xl font-semibold text-cyan-400">ArızaNet</h1>
            </header>

            <main className="p-6">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;