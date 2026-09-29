import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBar } from "@/components/mobile-bar";
import { store } from "@/data/store";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://loirepeche42.fr"),
  title: { default: "Loire Pêche 42 | Magasin de pêche à Balbigny", template: "%s | Loire Pêche 42" },
  description: `Magasin de pêche à ${store.fullAddress}. Matériel, accessoires, appâts et conseils pour le carnassier, la carpe, le silure et plus encore.`,
  openGraph: { title: "Loire Pêche 42 | Magasin de pêche à Balbigny", description: `Matériel, accessoires, appâts et conseils de passionnés au ${store.fullAddress}.`, type: "website", locale: "fr_FR", images: [{ url: "/images/hero-loire.png", width: 1536, height: 1024, alt: "Pêche au lever du jour dans la Loire" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="fr" className={`${inter.variable} ${lora.variable}`}><body><Header/><main>{children}</main><Footer/><MobileBar/></body></html> }
