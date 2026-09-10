import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    ShieldCheck, 
    LayoutDashboard, 
    Building2, 
    ClipboardCheck, 
    AlertTriangle, 
    FileText, 
    Users, 
    Bell, 
    LogOut, 
    User, 
    Menu, 
    X,
    CheckCircle2,
    XCircle,
    Info,
    ChevronRight,
    Search
} from 'lucide-react';

export default function AuthenticatedLayout({ children, title = '' }) {
    const { auth, flash, unreadNotifications } = usePage().props;
    const currentUser = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [dismissFlash, setDismissFlash] = useState(false);

    const currentPath = window.location.pathname;

    const navigation = [
        { 
            name: 'Dashboard', 
            href: '/dashboard', 
            icon: LayoutDashboard, 
            active: currentPath === '/dashboard' 
        },
        { 
            name: 'Empresas', 
            href: '/companies', 
            icon: Building2, 
            active: currentPath.startsWith('/companies') 
        },
        { 
            name: 'Inspecciones', 
            href: '/inspections', 
            icon: ClipboardCheck, 
            active: currentPath.startsWith('/inspections') 
        },
        { 
            name: 'Medidas Correctivas', 
            href: '/corrective-measures', 
            icon: AlertTriangle, 
            active: currentPath.startsWith('/corrective-measures') 
        },
    ];

    if (currentUser?.role === 'admin') {
        navigation.push({ 
            name: 'Usuarios & Técnicos', 
            href: '/users', 
            icon: Users, 
            active: currentPath.startsWith('/users') 
        });
    }

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/40">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-base tracking-tight block">
                                HyS Control
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                                Seguridad Laboral
                            </span>
                        </div>
                    </Link>
                    <button 
                        type="button" 
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Role badge */}
                <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${currentUser?.role === 'admin' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            {currentUser?.role === 'admin' ? 'Administrador' : 'Inspector Técnico'}
                        </span>
                    </div>
                    {currentUser?.license_number && (
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                            Mat. {currentUser.license_number}
                        </span>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Módulos Principales
                    </div>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    item.active
                                        ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Exportación
                    </div>
                    <a
                        href="/reports/export-csv"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                    >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Exportar a Excel (CSV)</span>
                    </a>
                </nav>

                {/* Footer institution card */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/20">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-[11px] font-semibold text-slate-300">
                            IES Nuevo Horizonte
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Prácticas Profesionalizantes I & II
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        {title && (
                            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                                {title}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Notifications */}
                        <Link 
                            href="/notifications"
                            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="Notificaciones"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </Link>

                        <div className="h-6 w-px bg-slate-200" />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
                                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <span className="text-xs font-semibold text-slate-800 block truncate max-w-[120px]">
                                        {currentUser?.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 capitalize block">
                                        {currentUser?.role}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {userDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setUserDropdownOpen(false)} 
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs font-semibold text-slate-900">{currentUser?.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            Mi Perfil
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut className="w-3.5 h-3.5 text-rose-400" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {!dismissFlash && (flash?.success || flash?.error || flash?.warning || flash?.info) && (
                    <div className="px-4 sm:px-6 pt-4">
                        {flash?.success && (
                            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-in fade-in duration-200">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span>{flash.success}</span>
                                </div>
                                <button type="button" onClick={() => setDismissFlash(true)} className="text-emerald-500 hover:text-emerald-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium animate-in fade-in duration-200">
                                <div className="flex items-center gap-2.5">
                                    <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                    <span>{flash.error}</span>
                                </div>
                                <button type="button" onClick={() => setDismissFlash(true)} className="text-rose-500 hover:text-rose-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {flash?.warning && (
                            <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium animate-in fade-in duration-200">
                                <div className="flex items-center gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                    <span>{flash.warning}</span>
                                </div>
                                <button type="button" onClick={() => setDismissFlash(true)} className="text-amber-500 hover:text-amber-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
