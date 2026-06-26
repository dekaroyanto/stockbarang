import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";

export default function BarangForm({ barangToEdit, onSuccess, onCancel }) {
  // Inisialisasi state dengan nilai default
  const [formData, setFormData] = useState({
    nama_barang: "",
    merk: "",
    kategori: "",
    kondisi: "Baru", // Default ke 'Baru'
    stok: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Efek ini akan berjalan saat modal dibuka atau barangToEdit berubah
  useEffect(() => {
    if (barangToEdit) {
      setFormData({
        nama_barang: barangToEdit.nama_barang || "",
        merk: barangToEdit.merk || "",
        kategori: barangToEdit.kategori || "",
        kondisi: barangToEdit.kondisi || "Baru",
        stok: barangToEdit.stok || 0,
      });
    } else {
      // Jika mode tambah baru, reset ke default
      setFormData({
        nama_barang: "",
        merk: "",
        kategori: "",
        kondisi: "Baru",
        stok: 0,
      });
    }
  }, [barangToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, kondisi: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (barangToEdit) {
        const { error } = await supabase
          .from("barang")
          .update(formData)
          .eq("id", barangToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("barang").insert([formData]);
        if (error) throw error;
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data barang telah disimpan.",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl" },
      });

      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan!",
        text: error.message,
        confirmButtonColor: "#18181b",
        customClass: { popup: "rounded-3xl" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nama_barang">Nama Barang</Label>
        <Input
          id="nama_barang"
          name="nama_barang"
          value={formData.nama_barang}
          onChange={handleChange}
          required
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="merk">Merk</Label>
          <Input
            id="merk"
            name="merk"
            value={formData.merk}
            onChange={handleChange}
            placeholder="Contoh: Sharp"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori</Label>
          <Input
            id="kategori"
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            placeholder="Contoh: Elektronik"
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kondisi</Label>
          {/* Pastikan value terikat dengan formData.kondisi */}
          <Select
            key={formData.kondisi} // TAMBAHKAN BARIS INI
            value={formData.kondisi}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="rounded-xl bg-white border-zinc-200">
              <SelectValue placeholder="Pilih Kondisi" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Baru">Baru</SelectItem>
              <SelectItem value="Tarikan">Tarikan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stok">Stok Fisik</Label>
          <Input
            id="stok"
            name="stok"
            type="number"
            value={formData.stok}
            onChange={handleChange}
            required
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl"
        >
          {isLoading ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>
    </form>
  );
}
