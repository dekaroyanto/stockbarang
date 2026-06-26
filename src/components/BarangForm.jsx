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

export default function BarangForm({ barangToEdit, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nama_barang: "",
    merk: "",
    kategori: "",
    kondisi: "Baru",
    stok: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Jika sedang mode edit, isi form dengan data yang sudah ada
  useEffect(() => {
    if (barangToEdit) {
      setFormData(barangToEdit);
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
        // Mode Edit
        const { error } = await supabase
          .from("barang")
          .update(formData)
          .eq("id", barangToEdit.id);
        if (error) throw error;
      } else {
        // Mode Tambah Baru
        const { error } = await supabase.from("barang").insert([formData]);
        if (error) throw error;
      }
      onSuccess(); // Panggil fungsi ini jika berhasil untuk merefresh tabel
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
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
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="merk">Merk</Label>
          <Input
            id="merk"
            name="merk"
            value={formData.merk || ""}
            onChange={handleChange}
            placeholder="Bisa dikosongkan"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori</Label>
          <Input
            id="kategori"
            name="kategori"
            value={formData.kategori || ""}
            onChange={handleChange}
            placeholder="Contoh: Lemari Es"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kondisi</Label>
          <Select value={formData.kondisi} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kondisi" />
            </SelectTrigger>
            <SelectContent>
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
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>
    </form>
  );
}
