"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MagneticActionButtonProps = {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export function MagneticActionButton({
  children,
  className = "",
  type = "button",
  disabled,
  onClick,
}: MagneticActionButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.018, y: -1.5 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_14px_35px_rgba(245,158,11,0.18)] transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}
