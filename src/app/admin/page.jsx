"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, AlertTriangle, XCircle, FileText } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStok: 0,
    stokKritis: 0,
    stokKosong: 0,
    temuanOpname: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);

    // 1. Total Seluruh Stok (Sum of 'stok')
    const { data: dataStok } = await supabase.from("barang").select("stok");

    // Menghitung jumlah total stok
    const totalStok = dataStok
      ? dataStok.reduce((sum, item) => sum + (item.stok || 0), 0)
      : 0;

    // 2. Stok Kritis (Stok 1 s/d 3) - Menghitung jumlah BARANG (SKU)
    const { count: countKritis } = await supabase
      .from("barang")
      .select("*", { count: "exact", head: true })
      .lte("stok", 3)
      .gt("stok", 0);

    // 3. Stok Kosong (Stok 0) - Menghitung jumlah BARANG (SKU)
    const { count: countKosong } = await supabase
      .from("barang")
      .select("*", { count: "exact", head: true })
      .eq("stok", 0);

    // 4. Jumlah Laporan Hasil Stok Opname
    const { count: countOpname } = await supabase
      .from("jurnal_opname")
      .select("*", { count: "exact", head: true });

    setStats({
      totalStok: totalStok,
      stokKritis: countKritis || 0,
      stokKosong: countKosong || 0,
      temuanOpname: countOpname || 0,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Dashboard Inventory
        </h1>
      </div>

      {/* Grid Cards 4 Kolom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Total Inventaris */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">
                Total Inventaris
              </p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {stats.totalStok.toLocaleString()}
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">Total unit barang di gudang</p>
        </div>

        {/* Card Stok Kritis */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Stok Kritis</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {stats.stokKritis}
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">Barang dengan stok 1 - 3 unit</p>
        </div>

        {/* Card Stok Kosong */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Stok Kosong</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {stats.stokKosong}
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">SKU dengan stok 0</p>
        </div>

        {/* Card Temuan Opname */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">Temuan Opname</p>
              <h3 className="text-2xl font-bold text-zinc-900">
                {stats.temuanOpname}
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400">Total laporan selisih fisik</p>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-zinc-400 animate-pulse">
          Memuat data dashboard...
        </div>
      )}
    </div>
  );
}
