/**
 * PageTransition — wrapper animasi untuk konten halaman
 * Memicu re-mount (dan re-animasi) setiap kali route berubah
 */
import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  // Pathname sebagai key — saat berubah, React unmount & remount div ini
  // sehingga animasi CSS @keyframes page-enter terpicu kembali dari awal
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div key={pathname} className="page-transition h-full">
      {children}
    </div>
  );
}
