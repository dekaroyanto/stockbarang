"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Delete, Lock, Shield, Circle, X } from "lucide-react";
import Swal from "sweetalert2";

export default function PinGuard({ children }) {
  const [pin, setPin] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const CORRECT_PIN = "6969";

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_auth");
    if (authStatus === "true") setIsAuthorized(true);
  }, []);

  const handlePress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === CORRECT_PIN) {
        setIsAuthorized(true);
        sessionStorage.setItem("admin_auth", "true");
      } else if (newPin.length === 4) {
        setIsShaking(true);
        Swal.fire({
          icon: "error",
          title: "PIN Salah",
          text: "PIN yang Anda masukkan tidak tepat. Silakan coba lagi.",
          timer: 2500,
          showConfirmButton: true,
          confirmButtonColor: "#2563EB",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-3xl",
            title: "text-blue-600",
          },
        });
        setTimeout(() => {
          setPin("");
          setIsShaking(false);
        }, 300);
      }
    }
  };

  const handleBackspace = () => setPin(pin.slice(0, -1));
  const handleClear = () => setPin("");

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-yellow-50 z-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100">
            {/* Logo Area */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <span className="text-xs font-bold text-white">🔒</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mt-4">
                Dashboard Admin
              </h2>
              <p className="text-blue-600/70 text-sm mt-1">
                Masukkan PIN untuk mengakses
              </p>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`relative transition-all duration-300 ${
                    isShaking ? "animate-shake" : ""
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      pin.length >= i
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 scale-110 shadow-md shadow-blue-200"
                        : "bg-gray-200 border-2 border-gray-300"
                    }`}
                  />
                  {pin.length >= i && (
                    <div className="absolute inset-0 animate-ping-slow rounded-full bg-blue-400 opacity-30" />
                  )}
                </div>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePress(num.toString())}
                  className="h-16 text-xl font-bold text-blue-900 bg-gradient-to-b from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 border border-blue-100"
                >
                  {num}
                </button>
              ))}

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="h-16 flex items-center justify-center bg-gradient-to-b from-red-50 to-white hover:from-red-100 hover:to-red-50 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 border border-red-200"
              >
                <X className="w-6 h-6 text-red-500" />
                <span className="text-xs font-medium text-red-500 ml-1">
                  Clear
                </span>
              </button>

              {/* Zero Button */}
              <button
                onClick={() => handlePress("0")}
                className="h-16 text-xl font-bold text-blue-900 bg-gradient-to-b from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 border border-blue-100"
              >
                0
              </button>

              {/* Backspace Button */}
              <button
                onClick={handleBackspace}
                className="h-16 flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white hover:from-yellow-100 hover:to-yellow-50 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 border border-yellow-200"
              >
                <Delete className="w-6 h-6 text-yellow-600" />
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-10px);
            }
            75% {
              transform: translateX(10px);
            }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
          @keyframes ping-slow {
            0% {
              transform: scale(1);
              opacity: 0.3;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          .animate-ping-slow {
            animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
