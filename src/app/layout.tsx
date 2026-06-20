import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "问春风 · 一卦一春风",
  description: "梅花易数三数起卦，诗意大白话解读你的当前状态。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
