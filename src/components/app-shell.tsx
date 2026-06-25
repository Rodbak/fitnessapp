"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DumbbellLoader } from "./dumbbell-loader";
import { AnimatePresence, motion } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1800);
    };
    window.addEventListener("cf:login", handler);
    return () => window.removeEventListener("cf:login", handler);
  }, []);

  return (
    <>
      <DumbbellLoader show={showLoader} />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
