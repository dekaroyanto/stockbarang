"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Settings,
  FileSpreadsheet,
  Download,
  HardDriveDownload,
} from "lucide-react";
import Swal from "sweetalert2";

export default function PengaturanPage() {
  const [isExportingStok, setIsExportingStok] = useState(false);
  const [isExportingMutasi, setIsExportingMutasi] = useState(false);

  // Fungsi Export Data Stok Barang ke CSV
  const handleExportStok = async () => {
    setIsExportingStok(true);
    try {
      const { data, error } = await supabase
        .from("barang")
        .select("nama_barang, merk, kategori, kondisi, stok")
        .order("nama_barang", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("Tidak ada data barang untuk diekspor.");

      // Membuat Header CSV
      let csvContent = "Nama Barang,Merk,Kategori,Kondisi,Sisa Stok\n";

      // Mengisi Data CSV
      data.forEach((row) => {
        // Membersihkan koma di dalam teks agar format CSV tidak rusak
        const nama = `"${row.nama_barang || ""}"`;
        const merk = `"${row.merk || ""}"`;
        const kategori = `"${row.kategori || ""}"`;
        const kondisi = `"${row.kondisi || ""}"`;
        const stok = row.stok;

        csvContent += `${nama},${merk},${kategori},${kondisi},${stok}\n`;
      });

      downloadCSV(csvContent, `Laporan_Stok_Gudang_${getTodayDate()}.csv`);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Laporan stok barang berhasil diunduh.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        customClass: { popup: "rounded-3xl" },
      });
    } finally {
      setIsExportingStok(false);
    }
  };

  // Fungsi Export Data Mutasi ke CSV
  const handleExportMutasi = async () => {
    setIsExportingMutasi(true);
    try {
      const { data, error } = await supabase
        .from("transaksi")
        .select(
          "tanggal_transaksi, jumlah, keterangan, barang(nama_barang, kondisi)",
        )
        .order("tanggal_transaksi", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("Tidak ada data mutasi untuk diekspor.");

      let csvContent =
        "Tanggal,Nama Barang,Kondisi,Keterangan Faktur,Barang Masuk,Barang Keluar\n";

      data.forEach((row) => {
        const tanggal = row.tanggal_transaksi;
        const nama = `"${row.barang?.nama_barang || "Barang Terhapus"}"`;
        const kondisi = `"${row.barang?.kondisi || "-"}"`;
        const keterangan = `"${row.keterangan || "-"}"`;

        // Memisahkan Debet (Masuk) dan Kredit (Keluar)
        const masuk = row.jumlah > 0 ? row.jumlah : 0;
        const keluar = row.jumlah < 0 ? Math.abs(row.jumlah) : 0;

        csvContent += `${tanggal},${nama},${kondisi},${keterangan},${masuk},${keluar}\n`;
      });

      downloadCSV(csvContent, `Jurnal_Mutasi_${getTodayDate()}.csv`);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Jurnal mutasi berhasil diunduh.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        customClass: { popup: "rounded-3xl" },
      });
    } finally {
      setIsExportingMutasi(false);
    }
  };

  // Fungsi Bantuan untuk men-trigger download di browser
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mendapatkan tanggal hari ini untuk nama file
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-zinc-400" /> Pengaturan Sistem
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Kelola data aplikasi dan unduh laporan untuk keperluan akuntansi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu Export Stok */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">
              Laporan Stok Terkini
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Unduh rekapitulasi sisa stok fisik seluruh barang (Baru & Tarikan)
              ke dalam format CSV yang bisa dibuka di Excel.
            </p>
          </div>
          <Button
            onClick={handleExportStok}
            disabled={isExportingStok}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
          >
            {isExportingStok ? (
              "Menyiapkan Data..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Unduh Data Stok
              </>
            )}
          </Button>
        </div>

        {/* Kartu Export Mutasi */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
              <HardDriveDownload className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">
              Jurnal Mutasi Harian
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Unduh riwayat pergerakan barang (keluar/masuk) lengkap dengan
              keterangan faktur dan rincian debet/kredit.
            </p>
          </div>
          <Button
            onClick={handleExportMutasi}
            disabled={isExportingMutasi}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
          >
            {isExportingMutasi ? (
              "Menyiapkan Data..."
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Unduh Jurnal Mutasi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
