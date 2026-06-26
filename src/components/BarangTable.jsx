import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Box, Package } from "lucide-react";

export default function BarangTable({ data, onEdit, onDelete }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Package className="w-12 h-12 text-zinc-300 mb-4" />
        <p className="text-zinc-500 font-medium">Belum ada data barang.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 1. TAMPILAN MOBILE (Berupa Kartu/Card) - Hanya muncul di layar kecil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {data.map((item) => {
          const isOut = item.stok <= 0;
          const isWarning = item.stok > 0 && item.stok <= 5;

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${isOut ? "opacity-80" : ""}`}
            >
              {/* Top Bar: Kategori & Badge Kondisi */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  {item.kategori || "UMUM"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                  ${
                    item.kondisi === "Baru"
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                  }`}
                >
                  {item.kondisi}
                </span>
              </div>

              {/* Info Barang */}
              <div className="mb-4">
                <h3 className="text-base font-bold text-zinc-900 leading-tight mb-1">
                  {item.nama_barang}
                </h3>
                <p className="text-xs font-medium text-zinc-500">
                  {item.merk || "Tanpa Merk"}
                </p>
              </div>

              {/* Bottom Bar: Indikator Stok & Tombol Aksi */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <Box
                    className={`w-4 h-4 ${isOut ? "text-zinc-400" : "text-zinc-900"}`}
                  />
                  <span
                    className={`text-sm font-black ${
                      isOut
                        ? "text-red-500"
                        : isWarning
                          ? "text-amber-500"
                          : "text-emerald-600"
                    }`}
                  >
                    {item.stok > 0
                      ? `${item.stok} Unit`
                      : item.stok < 0
                        ? `PO (${Math.abs(item.stok)})`
                        : "Habis"}
                  </span>
                </div>

                {/* Tombol Aksi Mobile */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-blue-50/50 hover:bg-blue-100"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-red-50/50 hover:bg-red-100"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. TAMPILAN DESKTOP (Berupa Tabel) - Hanya muncul di layar medium ke atas (md:block) */}
      <div className="hidden md:block rounded-xl border border-zinc-200/60 overflow-hidden">
        <Table className="min-w-full">
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="font-semibold text-zinc-600">
                Nama Barang
              </TableHead>
              <TableHead className="font-semibold text-zinc-600">
                Merk
              </TableHead>
              <TableHead className="font-semibold text-zinc-600">
                Kategori
              </TableHead>
              <TableHead className="font-semibold text-zinc-600">
                Kondisi
              </TableHead>
              <TableHead className="font-semibold text-zinc-600 text-right">
                Stok
              </TableHead>
              <TableHead className="font-semibold text-zinc-600 text-center">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} className="hover:bg-zinc-50/50">
                <TableCell className="font-bold text-zinc-900">
                  {item.nama_barang}
                </TableCell>
                <TableCell className="text-zinc-500">
                  {item.merk || "-"}
                </TableCell>
                <TableCell className="text-zinc-500 text-sm">
                  {item.kategori || "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.kondisi === "Baru"
                        ? "bg-zinc-100 text-zinc-600"
                        : "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
                    }`}
                  >
                    {item.kondisi}
                  </span>
                </TableCell>
                <TableCell
                  className={`text-right font-black ${item.stok <= 0 ? "text-red-500" : "text-emerald-600"}`}
                >
                  {item.stok > 0
                    ? item.stok
                    : item.stok < 0
                      ? `PO (${Math.abs(item.stok)})`
                      : "Habis"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
