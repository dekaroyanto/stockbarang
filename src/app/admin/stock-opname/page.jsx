"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ClipboardCheck, RotateCcw, FileText } from "lucide-react";
import Link from "next/link"; // Import Link untuk navigasi
import Swal from "sweetalert2";

export default function StockOpnamePage() {
  const [dataBarang, setDataBarang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputFisik, setInputFisik] = useState({});
  const [verifiedItems, setVerifiedItems] = useState({});

  const fetchData = async () => {
    setIsLoading(true);
    const { data: barang } = await supabase
      .from("barang")
      .select("id, nama_barang, merk, kondisi, stok")
      .order("nama_barang");
    const { data: progress } = await supabase
      .from("opname_progress")
      .select("*");

    if (barang) {
      setDataBarang(barang);
      if (progress) {
        const progMap = {};
        const verifyMap = {};
        progress.forEach((p) => {
          progMap[p.barang_id] = p.jumlah_fisik.toString();
          verifyMap[p.barang_id] = true;
        });
        setInputFisik(progMap);
        setVerifiedItems(verifyMap);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProgress = async (id, value) => {
    setInputFisik((prev) => ({ ...prev, [id]: value }));
    setVerifiedItems((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });

    if (value === "") {
      await supabase.from("opname_progress").delete().eq("barang_id", id);
    } else {
      await supabase
        .from("opname_progress")
        .upsert({
          barang_id: id,
          jumlah_fisik: parseInt(value),
          updated_at: new Date(),
        });
    }
  };

  const handleToggleCheck = async (item) => {
    const isChecked = !verifiedItems[item.id];
    if (isChecked) {
      await handleSaveProgress(item.id, item.stok.toString());
      setVerifiedItems((prev) => ({ ...prev, [item.id]: true }));
    } else {
      await handleSaveProgress(item.id, "");
      setVerifiedItems((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  const handleSesuaikan = async (item) => {
    const fisikValue = inputFisik[item.id];
    if (fisikValue === undefined || fisikValue === "") {
      return Swal.fire({
        icon: "warning",
        title: "Input Kosong",
        text: "Masukkan jumlah fisik!",
        customClass: { popup: "rounded-3xl" },
      });
    }

    const stokFisik = parseInt(fisikValue);
    const selisih = stokFisik - item.stok;

    if (selisih === 0) {
      Swal.fire({
        icon: "success",
        title: "Sesuai!",
        timer: 800,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });
      setVerifiedItems((prev) => ({ ...prev, [item.id]: true }));
      return;
    }

    const konfirmasi = await Swal.fire({
      title: "Catat Temuan?",
      html: `Selisih: <b>${Math.abs(selisih)} Unit</b>. Data dicatat ke Jurnal Opname.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      confirmButtonText: "Ya, Simpan Temuan",
      customClass: { popup: "rounded-3xl" },
    });

    if (konfirmasi.isConfirmed) {
      await supabase.from("jurnal_opname").insert([
        {
          barang_id: item.id,
          tanggal_opname: new Date().toISOString().split("T")[0],
          stok_sistem: item.stok,
          stok_fisik: stokFisik,
          selisih: selisih,
          keterangan: `Opname: Sistem ${item.stok}, Fisik ${stokFisik}`,
        },
      ]);
      setVerifiedItems((prev) => ({ ...prev, [item.id]: true }));
      Swal.fire({
        icon: "success",
        title: "Temuan Tersimpan",
        timer: 1500,
        customClass: { popup: "rounded-3xl" },
      });
    }
  };

  const clearAllOpname = async () => {
    const result = await Swal.fire({
      title: "Hapus Semua Data?",
      text: "Tindakan ini akan menghapus progres opname DAN seluruh laporan temuan (Jurnal Opname). Tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus Semua",
      customClass: { popup: "rounded-3xl" },
    });

    if (result.isConfirmed) {
      await supabase
        .from("opname_progress")
        .delete()
        .neq("barang_id", "00000000-0000-0000-0000-000000000000");
      await supabase
        .from("jurnal_opname")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      window.location.reload();
    }
  };

  const filteredBarang = dataBarang.filter((i) =>
    i.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-10 space-y-6 animate-in fade-in duration-500">
      {/* Header dengan Button Group */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Opname</h1>
          <p className="text-zinc-500 text-sm">
            Progres: {Object.keys(verifiedItems).length} / {dataBarang.length}{" "}
            selesai.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/admin/laporan-opname" className="flex-1">
            <Button variant="outline" className="w-full rounded-xl">
              <FileText className="w-4 h-4 mr-2" /> Laporan
            </Button>
          </Link>
          <Button
            onClick={clearAllOpname}
            variant="destructive"
            className="flex-1 rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-zinc-50/50">
          <Input
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl h-11"
          />
        </div>

        <div className="p-6 overflow-x-auto">
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredBarang.map((item) => (
              <div
                key={item.id}
                className={`border rounded-2xl p-5 ${verifiedItems[item.id] ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    checked={!!verifiedItems[item.id]}
                    onCheckedChange={() => handleToggleCheck(item)}
                  />
                  <div>
                    <h3 className="font-bold text-sm">{item.nama_barang}</h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${item.kondisi === "Baru" ? "bg-zinc-100 text-zinc-600" : "bg-orange-50 text-orange-600"}`}
                    >
                      {item.kondisi}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    className="h-10"
                    placeholder="Fisik"
                    value={inputFisik[item.id] || ""}
                    onChange={(e) =>
                      handleSaveProgress(item.id, e.target.value)
                    }
                  />
                  <Button onClick={() => handleSesuaikan(item)} size="sm">
                    Simpan
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Sistem</TableHead>
                  <TableHead>Fisik</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBarang.map((item) => (
                  <TableRow
                    key={item.id}
                    className={verifiedItems[item.id] ? "bg-emerald-50" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={!!verifiedItems[item.id]}
                        onCheckedChange={() => handleToggleCheck(item)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{item.nama_barang}</div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${item.kondisi === "Baru" ? "bg-zinc-100 text-zinc-600" : "bg-orange-50 text-orange-600"}`}
                      >
                        {item.kondisi}
                      </span>
                    </TableCell>
                    <TableCell>{item.stok}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-24"
                        value={inputFisik[item.id] || ""}
                        onChange={(e) =>
                          handleSaveProgress(item.id, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleSesuaikan(item)}
                        size="sm"
                        variant="secondary"
                      >
                        <ClipboardCheck className="w-4 h-4 mr-2" /> Simpan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
