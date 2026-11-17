import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Zone Alerte", template: "%s · Zone Alerte" },
  description: "Console de sécurité urbaine : alertes citoyennes, interventions, avis de recherche et IA prédictive.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#e30613" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
