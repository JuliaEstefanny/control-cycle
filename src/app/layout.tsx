import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control Cycle",
  description: "Caderno digital do Método de Ovulação Billings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
