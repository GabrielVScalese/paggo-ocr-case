// ARQUIVO: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// IMPORTANTE: Verifique se este caminho está correto para onde criou o arquivo
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paggo OCR Case",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* O AuthProvider TEM de estar a envolver o {children} */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
