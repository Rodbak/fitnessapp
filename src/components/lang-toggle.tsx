"use client";
import { useLang } from "@/lib/lang-context";

interface LangToggleProps {
  dark?: boolean;
}

export function LangToggle({ dark = false }: LangToggleProps) {
  const { lang, setLang } = useLang();

  const base = dark
    ? "bg-white/10 text-white"
    : "bg-gray-100 text-gray-800";
  const activeClass = dark
    ? "bg-white text-black"
    : "bg-black text-white";
  const inactiveClass = dark
    ? "text-white/40 hover:text-white/70"
    : "text-gray-400 hover:text-gray-700";

  return (
    <div className={`flex items-center ${base} rounded-lg p-0.5 text-xs font-black`}>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded-md transition-all ${lang === "en" ? activeClass : inactiveClass}`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("fr")}
        className={`px-2 py-1 rounded-md transition-all ${lang === "fr" ? activeClass : inactiveClass}`}
      >
        FR
      </button>
    </div>
  );
}
