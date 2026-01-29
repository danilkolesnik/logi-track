import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/lib/store/provider";

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
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
