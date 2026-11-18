import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "WINDCHIC Ops", description: "Back-office WINDCHIC — demandes, chiffrage, pilotage", icons: { icon: "/mark.png" } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
