"use client";
import { AnimatePresence, motion } from "framer-motion";

export function DumbbellLoader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="flex flex-col items-center gap-5">
            {/* Dumbbell SVG */}
            <div style={{ animation: "dumbbellBounce 0.9s ease-in-out infinite" }}>
              <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left weight stack */}
                <rect x="0" y="6" width="10" height="20" rx="3" fill="#000" style={{ animation: "weightPulse 0.9s ease-in-out infinite" }} />
                <rect x="10" y="9" width="7" height="14" rx="2" fill="#222" style={{ animation: "weightPulse 0.9s ease-in-out infinite 0.05s" }} />
                {/* Bar */}
                <rect x="17" y="14" width="46" height="4" rx="2" fill="#000" />
                {/* Right weight stack */}
                <rect x="63" y="9" width="7" height="14" rx="2" fill="#222" style={{ animation: "weightPulse 0.9s ease-in-out infinite 0.05s" }} />
                <rect x="70" y="6" width="10" height="20" rx="3" fill="#000" style={{ animation: "weightPulse 0.9s ease-in-out infinite" }} />
              </svg>
            </div>

            {/* Shadow */}
            <div
              style={{
                width: 60,
                height: 6,
                borderRadius: "50%",
                background: "#000",
                animation: "shadowPulse 0.9s ease-in-out infinite",
                marginTop: -8,
              }}
            />

            {/* Brand */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">CF</span>
              </div>
              <span className="font-black text-sm tracking-tight text-black">City&apos;s Fitness</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
