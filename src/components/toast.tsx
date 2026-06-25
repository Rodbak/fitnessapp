"use client";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDone?: () => void;
}

export function Toast({ message, type = "success", onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[9997] toast-in flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold ${type === "success" ? "bg-black text-white" : "bg-red-500 text-white"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={() => { setVisible(false); onDone?.(); }} className="ml-1 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
