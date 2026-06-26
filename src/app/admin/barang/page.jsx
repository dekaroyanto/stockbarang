"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BarangTable from "@/components/BarangTable";
import BarangForm from "@/components/BarangForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, PackageSearch, Filter } from "lucide-react";
import Swal from "sweetalert2";

export default function MasterBarangPage() {
  const [dataBarang, setDataBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("Semua"); // 'Semua', 'Baru', atau 'Tarikan'

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

  // Logika Filter Ganda (Pencarian Teks + Dropdown Kondisi)
  const filteredBarang = dataBarang.filter((item) => {
    // 1. Cek kecocokan teks pencarian
    const keyword = searchQuery.toLowerCase();
    const matchSearch =
      item.nama_barang.toLowerCase().includes(keyword) ||
      (item.merk && item.merk.toLowerCase().includes(keyword)) ||
      (item.kategori && item.kategori.toLowerCase().includes(keyword));

    // 2. Cek kecocokan filter dropdown (Baru/Tarikan/Semua)
    const matchKondisi =
      filterKondisi === "Semua" || item.kondisi === filterKondisi;

    // Tampilkan barang jika lolos kedua filter di atas
    return matchSearch && matchKondisi;
  });

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
    // Dialog Konfirmasi SweetAlert
    const result = await Swal.fire({
      title: "Hapus Barang Ini?",
      text: "Perhatian: Jika barang ini sudah ada di riwayat mutasi, bisa menyebabkan error.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // red-500
      cancelButtonColor: "#e4e4e7", // zinc-200
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: '<span style="color: #3f3f46">Batal</span>', // text-zinc-700
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from("barang").delete().eq("id", id);
      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Data barang berhasil dihapus dari sistem.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });

      fetchBarang();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text:
          "Pastikan barang ini tidak memiliki riwayat mutasi. Error: " +
          error.message,
        confirmButtonColor: "#18181b",
        customClass: { popup: "rounded-3xl" },
      });
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Master Data Barang
          </h1>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl flex items-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" /> Tambah Barang
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden">
        {/* TOOLBAR: Search Bar & Filter Dropdown */}
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
          {/* Sisi Kiri: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Input Pencarian */}
            <div className="relative w-full sm:w-80 border-zinc-200">
              <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cari nama, merk..."
                className="pl-10 rounded-xl bg-white border-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown Filter Kondisi */}
            <div className="relative w-full sm:w-44">
              <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                <SelectTrigger className="w-full rounded-xl bg-white border-zinc-200 h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <SelectValue placeholder="Pilih Kondisi" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Semua">Semua Kondisi</SelectItem>
                  <SelectItem value="Baru">Barang Baru</SelectItem>
                  <SelectItem value="Tarikan">Barang Tarikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sisi Kanan: Total Item */}
          <div className="text-sm font-semibold text-zinc-500 w-full sm:w-auto text-left sm:text-right bg-white px-4 py-2 rounded-xl border border-zinc-200/60 shadow-sm">
            Total:{" "}
            <span className="text-zinc-900">{filteredBarang.length}</span> Item
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-zinc-400 animate-pulse">
              Memuat database gudang...
            </div>
          ) : (
            <BarangTable
              data={filteredBarang}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {barangToEdit ? "Edit Data Barang" : "Tambah Barang Baru"}
            </DialogTitle>
            <DialogDescription>
              {barangToEdit
                ? "Ubah informasi detail barang. Hindari mengubah nama secara drastis jika sudah terlanjur beredar."
                : "Daftarkan barang baru ke dalam katalog sistem."}
            </DialogDescription>
          </DialogHeader>

          <div className="pt-2">
            <BarangForm
              barangToEdit={barangToEdit}
              onSuccess={handleSuccessForm}
              onCancel={handleCloseDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
