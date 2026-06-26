"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Check,
  ChevronsUpDown,
  Edit,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function TransaksiPage() {
  const [listTransaksi, setListTransaksi] = useState([]);
  const [listBarang, setListBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  const [txToEdit, setTxToEdit] = useState(null);
  const [formType, setFormType] = useState("Masuk");
  const [formData, setFormData] = useState({
    barang_id: "",
    tanggal_transaksi: new Date().toISOString().split("T")[0],
    jumlah: "",
    keterangan: "",
  });

  const fetchTransaksi = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("transaksi")
      .select(
        `id, tanggal_transaksi, jumlah, keterangan, barang_id, barang (nama_barang, merk, kondisi)`,
      )
      .order("tanggal_transaksi", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) setListTransaksi(data);
    setIsLoading(false);
  };

  const fetchBarang = async () => {
    const { data } = await supabase
      .from("barang")
      .select("id, nama_barang, merk, kondisi, stok")
      .order("nama_barang", { ascending: true });
    if (data) setListBarang(data);
  };

  useEffect(() => {
    fetchTransaksi();
    fetchBarang();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (tx) => {
    setTxToEdit(tx);
    setFormType(tx.jumlah > 0 ? "Masuk" : "Keluar");
    setFormData({
      barang_id: tx.barang_id,
      tanggal_transaksi: tx.tanggal_transaksi,
      jumlah: Math.abs(tx.jumlah).toString(),
      keterangan: tx.keterangan || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setTxToEdit(null);
    setFormType("Masuk");
    setFormData({
      barang_id: "",
      tanggal_transaksi: new Date().toISOString().split("T")[0],
      jumlah: "",
      keterangan: "",
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.barang_id) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Silakan cari dan pilih barang terlebih dahulu!",
        confirmButtonColor: "#18181b",
        customClass: { popup: "rounded-3xl" },
      });
    }

    const hitungJumlahBaru =
      formType === "Keluar"
        ? -Math.abs(parseInt(formData.jumlah))
        : Math.abs(parseInt(formData.jumlah));

    try {
      if (txToEdit) {
        const { data: oldBarang } = await supabase
          .from("barang")
          .select("stok")
          .eq("id", txToEdit.barang_id)
          .single();
        await supabase
          .from("barang")
          .update({ stok: oldBarang.stok - txToEdit.jumlah })
          .eq("id", txToEdit.barang_id);

        const { data: newBarang } = await supabase
          .from("barang")
          .select("stok")
          .eq("id", formData.barang_id)
          .single();
        await supabase
          .from("barang")
          .update({ stok: newBarang.stok + hitungJumlahBaru })
          .eq("id", formData.barang_id);

        await supabase
          .from("transaksi")
          .update({
            barang_id: formData.barang_id,
            tanggal_transaksi: formData.tanggal_transaksi,
            jumlah: hitungJumlahBaru,
            keterangan: formData.keterangan,
          })
          .eq("id", txToEdit.id);
      } else {
        await supabase.from("transaksi").insert([
          {
            barang_id: formData.barang_id,
            tanggal_transaksi: formData.tanggal_transaksi,
            jumlah: hitungJumlahBaru,
            keterangan: formData.keterangan,
          },
        ]);

        const barangDipilih = listBarang.find(
          (b) => b.id === formData.barang_id,
        );
        await supabase
          .from("barang")
          .update({ stok: barangDipilih.stok + hitungJumlahBaru })
          .eq("id", formData.barang_id);
      }

      Swal.fire({
        icon: "success",
        title: "Tercatat!",
        text: "Mutasi barang berhasil disimpan dan stok otomatis diperbarui.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });

      resetForm();
      fetchTransaksi();
      fetchBarang();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: error.message,
        confirmButtonColor: "#18181b",
        customClass: { popup: "rounded-3xl" },
      });
    }
  };

  const handleDelete = async (tx) => {
    const result = await Swal.fire({
      title: "Hapus Jurnal Mutasi?",
      text: "Menghapus mutasi ini akan OTOMATIS MENGEMBALIKAN stok barang ke kondisi semula.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#e4e4e7",
      confirmButtonText: "Ya, Kembalikan Stok!",
      cancelButtonText: '<span style="color: #3f3f46">Batal</span>',
      customClass: { popup: "rounded-3xl" },
    });

    if (!result.isConfirmed) return;

    try {
      const { data: barang } = await supabase
        .from("barang")
        .select("stok")
        .eq("id", tx.barang_id)
        .single();
      const stokBaru = barang.stok - tx.jumlah;
      await supabase
        .from("barang")
        .update({ stok: stokBaru })
        .eq("id", tx.barang_id);
      await supabase.from("transaksi").delete().eq("id", tx.id);

      Swal.fire({
        icon: "success",
        title: "Stok Dikembalikan!",
        text: "Jurnal dihapus dan stok barang telah direvisi otomatis.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });

      fetchTransaksi();
      fetchBarang();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message,
        confirmButtonColor: "#18181b",
        customClass: { popup: "rounded-3xl" },
      });
    }
  };
  const getSelectedBarangName = () => {
    const selected = listBarang.find((b) => b.id === formData.barang_id);
    return selected
      ? `${selected.nama_barang} (${selected.kondisi})`
      : "Ketik untuk mencari barang...";
  };

  return (
    <div className="p-6 md:p-10 space-y-6 animate-in fade-in duration-500">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Mutasi Stok Harian
          </h1>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl flex items-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" /> Catat Mutasi
        </Button>
      </div>

      {/* Bagian Riwayat Data */}
      <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-lg font-bold text-zinc-900">
            Jurnal Riwayat Barang
          </h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10 text-zinc-400 animate-pulse">
              Memuat riwayat transaksi...
            </div>
          ) : listTransaksi.length === 0 ? (
            <div className="text-center py-10 text-zinc-400">
              Belum ada mutasi barang.
            </div>
          ) : (
            <div>
              {/* 1. TAMPILAN MOBILE (Card) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {listTransaksi.map((tx) => {
                  const isMasuk = tx.jumlah > 0;
                  return (
                    <div
                      key={tx.id}
                      className="bg-white border rounded-2xl p-5 shadow-sm relative"
                    >
                      {/* Top Bar: Tanggal & Kondisi */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-zinc-500">
                          {new Date(tx.tanggal_transaksi).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            tx.barang?.kondisi === "Baru"
                              ? "bg-zinc-100 text-zinc-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {tx.barang?.kondisi || "Dihapus"}
                        </span>
                      </div>

                      {/* Info Barang */}
                      <div className="mb-3">
                        <h3 className="text-base font-bold text-zinc-900 leading-tight mb-1">
                          {tx.barang?.nama_barang || "Barang Terhapus"}
                        </h3>
                        <p className="text-xs font-medium text-zinc-500">
                          {tx.barang?.merk || "-"}
                        </p>
                      </div>

                      {/* Keterangan Box */}
                      {tx.keterangan && (
                        <div className="flex items-start gap-1.5 text-xs text-zinc-500 mb-4 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                          <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{tx.keterangan}</span>
                        </div>
                      )}

                      {/* Bottom Bar: Nominal Jumlah & Tombol Aksi */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
                            isMasuk
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isMasuk ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                          {Math.abs(tx.jumlah)} Unit
                        </span>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-blue-50/50 hover:bg-blue-100 rounded-xl"
                            onClick={() => handleEditClick(tx)}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 bg-red-50/50 hover:bg-red-100 rounded-xl"
                            onClick={() => handleDelete(tx)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. TAMPILAN DESKTOP (Tabel) */}
              <div className="hidden md:block rounded-xl border border-zinc-200/60 overflow-hidden">
                <Table className="min-w-full">
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead className="font-semibold text-zinc-600">
                        Tanggal
                      </TableHead>
                      <TableHead className="font-semibold text-zinc-600">
                        Nama Barang
                      </TableHead>
                      <TableHead className="font-semibold text-zinc-600">
                        Keterangan Faktur
                      </TableHead>
                      <TableHead className="font-semibold text-zinc-600 text-right">
                        Jumlah
                      </TableHead>
                      <TableHead className="font-semibold text-zinc-600 text-center">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listTransaksi.map((tx) => {
                      const isMasuk = tx.jumlah > 0;
                      return (
                        <TableRow key={tx.id} className="hover:bg-zinc-50/50">
                          <TableCell className="font-medium text-zinc-600">
                            {new Date(tx.tanggal_transaksi).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-zinc-900">
                              {tx.barang?.nama_barang || "Barang Terhapus"}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-zinc-500">
                                {tx.barang?.merk || "-"}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                  tx.barang?.kondisi === "Baru"
                                    ? "bg-zinc-100 text-zinc-600"
                                    : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                {tx.barang?.kondisi}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-500 max-w-xs truncate">
                            {tx.keterangan ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                {tx.keterangan}
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${isMasuk ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                            >
                              {isMasuk ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownLeft className="w-3 h-3" />
                              )}
                              {Math.abs(tx.jumlah)} Unit
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(tx)}
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(tx)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl overflow-visible">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {txToEdit ? "Edit Mutasi Stok" : "Catat Mutasi Stok"}
            </DialogTitle>
            <DialogDescription>
              {txToEdit
                ? "Perubahan pada data ini akan otomatis menyesuaikan ulang stok fisik barang."
                : "Input pergerakan barang masuk gudang atau terjual."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Jenis Pergerakan</Label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormType("Masuk")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${formType === "Masuk" ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500"}`}
                >
                  Barang Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("Keluar")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${formType === "Keluar" ? "bg-white text-red-600 shadow-sm" : "text-zinc-500"}`}
                >
                  Barang Keluar
                </button>
              </div>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Pilih Barang</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between rounded-xl font-normal border-zinc-200 hover:bg-zinc-50"
                  >
                    <span className="truncate">{getSelectedBarangName()}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 rounded-xl"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Cari nama atau merk barang..."
                      className="h-11"
                    />
                    <CommandList>
                      <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                      <CommandGroup className="max-h-60 overflow-auto">
                        {listBarang.map((b) => (
                          <CommandItem
                            key={b.id}
                            value={`${b.nama_barang} ${b.merk || ""} ${b.kondisi}`}
                            onSelect={() => {
                              setFormData((p) => ({ ...p, barang_id: b.id }));
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 flex-shrink-0 ${formData.barang_id === b.id ? "opacity-100" : "opacity-0"}`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {b.nama_barang}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {b.kondisi} • Sisa stok:{" "}
                                <strong
                                  className={
                                    b.stok <= 0
                                      ? "text-red-500"
                                      : "text-emerald-600"
                                  }
                                >
                                  {b.stok}
                                </strong>
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal_transaksi">Tanggal Faktur</Label>
                <Input
                  type="date"
                  id="tanggal_transaksi"
                  name="tanggal_transaksi"
                  value={formData.tanggal_transaksi}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  type="number"
                  id="jumlah"
                  name="jumlah"
                  min="1"
                  value={formData.jumlah}
                  onChange={handleInputChange}
                  placeholder="Contoh: 5"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan / Faktur</Label>
              <Input
                type="text"
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                placeholder="Contoh: SFA26725"
                className="rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl"
              >
                {txToEdit ? "Simpan Perubahan" : "Simpan Mutasi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
