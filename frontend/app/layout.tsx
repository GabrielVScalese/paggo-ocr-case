import "./globals.css";

import Providers from "@/components/Providers";

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
