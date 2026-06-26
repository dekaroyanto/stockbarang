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

export default function LaporanOpnamePage() {
  const [laporan, setLaporan] = useState([]);

  useEffect(() => {
    const fetchLaporan = async () => {
      const { data } = await supabase
        .from("jurnal_opname")
        .select("*, barang(nama_barang, merk)")
        .order("created_at", { ascending: false });
      if (data) setLaporan(data);
    };
    fetchLaporan();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Laporan Hasil Stock Opname</h1>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Sistem</TableHead>
              <TableHead>Fisik</TableHead>
              <TableHead>Selisih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {laporan.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.tanggal_opname}</TableCell>
                <TableCell className="font-bold">
                  {row.barang?.nama_barang}
                </TableCell>
                <TableCell>{row.stok_sistem}</TableCell>
                <TableCell>{row.stok_fisik}</TableCell>
                <TableCell
                  className={
                    row.selisih !== 0
                      ? "text-red-600 font-bold"
                      : "text-emerald-600"
                  }
                >
                  {row.selisih}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
