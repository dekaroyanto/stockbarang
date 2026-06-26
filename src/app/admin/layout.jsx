"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Settings,
  ClipboardCheck,
} from "lucide-react";

import PinGuard from "@/components/PinGuard";

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

  return (
    <PinGuard>
      <div className="min-h-screen bg-zinc-50 flex">
        {/* 1. SIDEBAR (Hanya Tampil di Layar Laptop/Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200 fixed h-screen z-20">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">
              Admin<span className="text-blue-600">Panel</span>
            </h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white shadow-md"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 2. AREA KONTEN UTAMA */}
        {/* Margin kiri 64 (256px) untuk desktop agar tidak tertutup sidebar, margin bawah 20 untuk HP agar tidak tertutup bottom nav */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-8 w-full">{children}</main>

        {/* 3. BOTTOM NAVIGATION BAR (Hanya Tampil di Layar HP/Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`p-2 rounded-xl transition-all ${isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"}`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${isActive ? "fill-zinc-900/20" : ""}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${isActive ? "text-zinc-900" : "text-zinc-400"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </PinGuard>
  );
}
