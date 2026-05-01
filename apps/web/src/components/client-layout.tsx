"use client";

import { AuthGate } from "@/components/auth-gate";
import { NotificationProvider, ToastContainer, useNotifications } from "@/components/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

function ToastViewport() {
  const { notifications, clearNotification } = useNotifications();
  return (
    <>
      <ToastContainer toasts={notifications.slice(0, 5)} onRemove={clearNotification} />
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <NotificationProvider>
      <AuthGate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </AuthGate>
      <ToastViewport />
    </NotificationProvider>
  );
}
