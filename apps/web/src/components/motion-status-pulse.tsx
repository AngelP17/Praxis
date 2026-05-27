"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

type PulsePoint = {
  id: string;
  label: string;
  intensity: number; // 0-1
};

export function MotionStatusPulse({ points }: { points: PulsePoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="flex items-center gap-1">
      {points.map((point, index) => (
        <PulseDot key={point.id} point={point} index={index} />
      ))}
    </div>
  );
}

function PulseDot({ point, index }: { point: PulsePoint; index: number }) {
  const intensity = useMotionValue(point.intensity);
  const scale = useTransform(intensity, [0, 1], [0.6, 1.2]);
  const opacity = useTransform(intensity, [0, 1], [0.3, 1]);

  useEffect(() => {
    const controls = animate(intensity, [point.intensity, 1, point.intensity], {
      duration: 2 + index * 0.3,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return controls.stop;
  }, [intensity, point.intensity, index]);

  const color = point.intensity > 0.7 ? "#f43f5e" : point.intensity > 0.4 ? "#715BFF" : "#22c55e";

  return (
    <motion.div
      className="group relative"
      style={{ scale, opacity }}
    >
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/95 px-2.5 py-1.5 text-[10px] text-zinc-300 whitespace-nowrap shadow-xl">
          {point.label}
        </div>
      </div>
    </motion.div>
  );
}
