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
import {
  PlusCircle,
  PackageSearch,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
} from "lucide-react";
import Swal from "sweetalert2";

export default function MasterBarangPage() {
  const [dataBarang, setDataBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("Semua");

  // State untuk Sorting
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [barangToEdit, setBarangToEdit] = useState(null);

  // Opsi sorting yang tersedia
  const sortOptions = [
    { value: "nama_barang", label: "Nama" },
    { value: "merk", label: "Merk" },
    { value: "kategori", label: "Kategori" },
    { value: "kondisi", label: "Kondisi" },
    { value: "harga_jual", label: "Harga" },
    { value: "created_at", label: "Terbaru" },
  ];

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

  // Handle perubahan field sorting
  const handleSortFieldChange = (field) => {
    setSortField(field);
  };

  // Toggle order (asc/desc)
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Filter data
  const filteredBarang = dataBarang.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    const matchSearch =
      item.nama_barang.toLowerCase().includes(keyword) ||
      (item.merk && item.merk.toLowerCase().includes(keyword)) ||
      (item.kategori && item.kategori.toLowerCase().includes(keyword));

    const matchKondisi =
      filterKondisi === "Semua" || item.kondisi === filterKondisi;

    return matchSearch && matchKondisi;
  });

  // Sort data
  const sortedData = [...filteredBarang].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    // Handle null/undefined
    if (valA == null) return 1;
    if (valB == null) return -1;

    // Konversi ke string untuk perbandingan
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Hitung total stok dari semua barang yang tampil
  const totalStok = sortedData.reduce((total, item) => {
    return total + (item.stok || 0);
  }, 0);

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
    const result = await Swal.fire({
      title: "Hapus Barang Ini?",
      text: "Perhatian: Jika barang ini sudah ada di riwayat mutasi, bisa menyebabkan error.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#e4e4e7",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: '<span style="color: #3f3f46">Batal</span>',
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
        showConfirmButton: true,
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

  // Mendapatkan label sorting saat ini
  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortField);
    return option ? option.label : "Urutkan";
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
        {/* TOOLBAR: Search, Filter, & Sort */}
        <div className="p-4 md:p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3">
          {/* Baris 1: Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input Pencarian */}
            <div className="relative flex-1 min-w-[200px]">
              <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cari nama, merk..."
                className="pl-10 rounded-xl bg-white border-zinc-200 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dropdown Filter Kondisi */}
            <div className="relative w-full sm:w-40">
              <Select value={filterKondisi} onValueChange={setFilterKondisi}>
                <SelectTrigger className="w-full rounded-xl bg-white border-zinc-200 h-10">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <SelectValue placeholder="Kondisi" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Semua">Semua Kondisi</SelectItem>
                  <SelectItem value="Baru">Barang Baru</SelectItem>
                  <SelectItem value="Tarikan">Barang Tarikan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group Sort: Dropdown + Toggle Order */}
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Dropdown Sort Field */}
              <div className="relative flex-1 sm:w-36">
                <Select value={sortField} onValueChange={handleSortFieldChange}>
                  <SelectTrigger className="w-full rounded-xl bg-white border-zinc-200 h-10">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                      <SelectValue placeholder="Urutkan" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tombol Toggle Asc/Desc */}
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-zinc-200 bg-white hover:bg-zinc-100 flex-shrink-0"
                onClick={toggleSortOrder}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4 text-zinc-700" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-zinc-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Baris 2: Info Total Stok & Status Sort */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500">
              <Package className="w-4 h-4 text-zinc-400" />
              Total Stok: <span className="text-zinc-900">{totalStok}</span>
              <span className="text-xs text-zinc-400 font-normal">
                ({sortedData.length} item)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white px-3 py-1 rounded-lg border border-zinc-200/60">
              <span>
                Sort by:{" "}
                <span className="text-zinc-700 font-medium">
                  {getCurrentSortLabel()}
                </span>
              </span>
              <span className="text-zinc-300">|</span>
              <span className="font-medium text-zinc-700">
                {sortOrder === "asc" ? "A→Z ↑" : "Z→A ↓"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-10 text-zinc-400 animate-pulse">
              Memuat database gudang...
            </div>
          ) : (
            <BarangTable
              data={sortedData}
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
