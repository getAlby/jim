import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "Uncle Jim",
  description:
    "An Uncle Jim service that gives out instant wallets that can be used in any NWC-powered app such as Damus, Amethyst, Alby Browser Extension and Alby Account",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="jim">
      <body className="flex flex-col justify-center items-center w-full h-full p-4">
        {children}
      </body>
    </html>
  );
}
