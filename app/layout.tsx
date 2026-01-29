import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/lib/store/provider";
import AuthProvider from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Logi Track",
  description: "Logistics tracking and shipment management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div suppressHydrationWarning>
          <StoreProvider>
            <AuthProvider>{children}</AuthProvider>
          </StoreProvider>
        </div>
      </body>
    </html>
  );
}
