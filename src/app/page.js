"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen, Sparkles, Box } from "lucide-react";

export default function SalesKatalogPage() {
  const [dataBarang, setDataBarang] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchBarang = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("barang")
      .select("*")
      .order("nama_barang", { ascending: true });

    if (!error) {
      setDataBarang(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const filteredBarang = dataBarang.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    return (
      item.nama_barang.toLowerCase().includes(keyword) ||
      (item.merk && item.merk.toLowerCase().includes(keyword)) ||
      (item.kategori && item.kategori.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-200">
      {/* Header dengan efek Glassmorphism */}
      <header className="sticky top-0 z-30 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-200/50 pb-6 pt-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
                Katalog
              </h1>
              <p className="text-zinc-500 font-medium mt-1">
                Cek ketersediaan stok terkini
              </p>
            </div>
          </div>

          {/* Search Bar Minimalis */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
            </div>
            <Input
              type="text"
              placeholder="Ketik nama, merek, atau kategori..."
              className="pl-12 h-14 bg-white border-0 ring-1 ring-zinc-200 shadow-sm rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-zinc-900 transition-all placeholder:text-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-zinc-200/50 rounded-3xl h-48 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredBarang.length === 0 ? (
          // Empty State Modern
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm ring-1 ring-zinc-100 mb-6">
              <PackageOpen className="w-12 h-12 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              Barang tidak ditemukan
            </h3>
            <p className="text-zinc-500 max-w-sm">
              Coba gunakan kata kunci lain atau periksa kembali ejaan Anda.
            </p>
          </div>
        ) : (
          // Grid Kartu Barang
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBarang.map((item) => {
              // Menentukan gaya status stok
              const isOut = item.stok <= 0;
              const isWarning = item.stok > 0 && item.stok <= 5;

              return (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-3xl p-6 transition-all duration-300 
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 ring-1 ring-zinc-100
                    ${isOut ? "opacity-80" : ""}`}
                >
                  {/* Top Bar: Kategori & Badge Kondisi */}
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                      {item.kategori || "UMUM"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider
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
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 leading-tight mb-1 line-clamp-2">
                      {item.nama_barang}
                    </h2>
                    <p className="text-sm font-medium text-zinc-500">
                      {item.merk || "Tanpa Merek"}
                    </p>
                  </div>

                  {/* Bottom Bar: Indikator Stok */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100/80">
                      <div className="flex items-center gap-2">
                        <Box
                          className={`w-4 h-4 ${isOut ? "text-zinc-400" : "text-zinc-900"}`}
                        />
                        <span className="text-sm font-semibold text-zinc-600">
                          Stok
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm
                        ${
                          isOut
                            ? "bg-red-50 text-red-600"
                            : isWarning
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {item.stok > 0 ? (
                          <>
                            <span className="relative flex h-2 w-2 mr-1">
                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isWarning ? "bg-amber-400" : "bg-emerald-400"}`}
                              ></span>
                              <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${isWarning ? "bg-amber-500" : "bg-emerald-500"}`}
                              ></span>
                            </span>
                            {item.stok} Unit
                          </>
                        ) : item.stok < 0 ? (
                          `PO (${Math.abs(item.stok)})`
                        ) : (
                          "Habis"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
