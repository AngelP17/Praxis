import ClientLayout from "@/components/client-layout";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aether Sentinel",
  description: "Operational Intelligence and Decision Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
