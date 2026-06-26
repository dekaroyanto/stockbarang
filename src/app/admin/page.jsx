"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, AlertCircle, TrendingDown, Box } from "lucide-react";
// Import komponen CRUD yang sudah kita buat sebelumnya
import BarangTable from "@/components/BarangTable";
import BarangForm from "@/components/BarangForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardAdmin() {
  const [dataBarang, setDataBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form CRUD
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [barangToEdit, setBarangToEdit] = useState(null);

  const fetchBarang = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("barang")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setDataBarang(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  // Menghitung Statistik Ringkasan (Summary)
  const totalBarang = dataBarang.length;
  const barangHabis = dataBarang.filter((b) => b.stok === 0).length;
  const barangPO = dataBarang.filter((b) => b.stok < 0).length;
  const stokMenipis = dataBarang.filter(
    (b) => b.stok > 0 && b.stok <= 3,
  ).length;

  // Fungsi Helper untuk Tabel CRUD
  const handleOpenDialog = (barang = null) => {
    setBarangToEdit(barang);
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setBarangToEdit(null);
    setIsDialogOpen(false);
  };
  const handleSuccessForm = () => {
    handleCloseDialog();
    fetchBarang();
  };
  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus?")) {
      await supabase.from("barang").delete().eq("id", id);
      fetchBarang();
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Overview Gudang
        </h1>
        <p className="text-zinc-500 mt-1">
          Ringkasan kondisi inventaris fisik Anda hari ini.
        </p>
      </div>

      {/* Kartu Statistik (Metrics Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kartu 1: Total Jenis Barang */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-zinc-900">{totalBarang}</h3>
            <p className="text-sm font-medium text-zinc-500">
              Total Jenis Item
            </p>
          </div>
        </div>

        {/* Kartu 2: Stok Menipis */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-amber-600">
              {stokMenipis}
            </h3>
            <p className="text-sm font-medium text-zinc-500">
              Stok Kritis (≤ 3)
            </p>
          </div>
        </div>

        {/* Kartu 3: Barang Habis */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-2.5 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-red-600">{barangHabis}</h3>
            <p className="text-sm font-medium text-zinc-500">Stok Kosong</p>
          </div>
        </div>

        {/* Kartu 4: Status Pre-Order (Backorder) */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <Box className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-purple-600">{barangPO}</h3>
            <p className="text-sm font-medium text-zinc-500">
              Status PO (Stok Minus)
            </p>
          </div>
        </div>
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {barangToEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </DialogTitle>
          </DialogHeader>
          <BarangForm
            barangToEdit={barangToEdit}
            onSuccess={handleSuccessForm}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
