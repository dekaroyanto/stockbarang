"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Settings,
  ClipboardCheck,
  Store,
  Boxes,
} from "lucide-react";

// import PinGuard from "@/components/PinGuard";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Daftar menu navigasi
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Barang", href: "/admin/barang", icon: Package },
    { name: "Mutasi", href: "/admin/transaksi", icon: ArrowRightLeft },
    { name: "Opname", href: "/admin/stock-opname", icon: ClipboardCheck },
    { name: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
  ];

  // Helper untuk menentukan status rute aktif
  const isRouteActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    if (href === "/admin/stock-opname") {
      return (
        pathname.startsWith("/admin/stock-opname") ||
        pathname.startsWith("/admin/laporan-opname")
      );
    }
    return pathname.startsWith(href);
  };

  return (
    // <PinGuard>
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* 1. TOP HEADER (Hanya Tampil di Layar HP/Mobile) */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-lg font-black text-zinc-900 tracking-tight">
            Admin<span className="text-blue-600">Panel</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all active:scale-95 border border-zinc-200/60"
        >
          <Store className="w-3.5 h-3.5 text-zinc-500" />
          <span>Katalog</span>
        </Link>
      </header>

      {/* 2. SIDEBAR (Hanya Tampil di Layar Laptop/Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 fixed h-screen z-20">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm">
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">
              Admin<span className="text-blue-600">Panel</span>
            </h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm translate-x-1"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Link kembali ke Katalog Publik di bagian bawah sidebar */}
        <div className="p-4 border-t border-zinc-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all border border-zinc-200/60"
          >
            <Store className="w-5 h-5 text-zinc-400" />
            <span>Lihat Katalog</span>
          </Link>
        </div>
      </aside>

      {/* 3. AREA KONTEN UTAMA */}
      {/* Margin kiri untuk desktop agar tidak tertutup sidebar, padding bawah untuk HP agar tidak tertutup bottom nav */}
      <main className="flex-1 md:ml-64 pb-28 md:pb-8 w-full min-h-screen">
        {children}
      </main>

      {/* 4. BOTTOM NAVIGATION BAR (Hanya Tampil di Layar HP/Mobile) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom, 0.6rem))" }}
      >
        <div className="grid grid-cols-5 items-center px-2 pt-2">
          {navItems.map((item) => {
            const isActive = isRouteActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center py-1 px-0.5 text-center group touch-manipulation select-none active:scale-95 transition-transform"
              >
                <div
                  className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-xs scale-105"
                      : "text-zinc-400 group-hover:text-zinc-700"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "stroke-[2.2]" : "stroke-[1.8]"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight transition-colors truncate max-w-full ${
                    isActive
                      ? "text-zinc-900 font-bold"
                      : "text-zinc-400 font-medium"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    // </PinGuard>
  );
}
