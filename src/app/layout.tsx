import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://capmax.ai"),
  title: "Capmax AI - Make it Viral",
  description: "Where viral posts are written.",
  icons: {
    icon: "/images/instruct/capmax-removebg-preview.png",
    apple: "/images/instruct/capmax-removebg-preview.png",
  },
  openGraph: {
    title: "Capmax AI - Make it Viral",
    description: "Where viral posts are written.",
    images: ["/seo/meta-instruct.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
