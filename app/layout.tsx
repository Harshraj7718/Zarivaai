import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono, Caveat } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/Cursor";
import InkDefs from "@/components/sketch/InkDefs";
import SiteDots from "@/components/SiteDots";
import Loader from "@/components/Loader";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"] }); // handwriting, for the sticky notes

export const metadata: Metadata = {
  title: "Zariva.AI · Technology & Growth Partner",
  description:
    "Zariva.AI builds the SaaS platforms, CRM & ERP systems and AI agents that run your business, then markets and grows it across every channel that matters.",
  icons: { icon: "/assets/zariva-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${geistMono.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        {/* apply a saved light/dark choice before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('zariva-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        {/* the loading screen shows once per session; skip it before paint on repeat visits or with reduced motion */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('zariva-loaded')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('zl-skip')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Loader />
        <InkDefs />
        <SiteDots />
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
