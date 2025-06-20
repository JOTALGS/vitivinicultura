// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import LayoutBody from './LayoutBody';

export const metadata: Metadata = {
  title: "INAVI - Instituto Nacional de Vitivinicultura - Vinos del Uruguay",
  description: "INAVI - Instituto Nacional de Vitivinicultura - Vinos del Uruguay",
  icons: {
    icon: [
      { url: "/images/logo_INAVI_copa.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <LayoutBody>{children}</LayoutBody>
    </html>
  );
}