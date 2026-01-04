import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  icons: {
    icon: '/icon.svg',
  },
  title: "CubeX",
  description: "The ultimate platform for cube solvers. Algorithmic thinking meets premium design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}
      >
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: '#0ea5e9', // Blue-500
              borderColor: '#0284c7', // Blue-600
              color: 'white',
            },
            classNames: {
              error: 'bg-red-500 border-red-600 text-white',
              success: 'bg-green-500 border-green-600 text-white',
              warning: 'bg-yellow-500 border-yellow-600 text-white',
              info: 'bg-blue-500 border-blue-600 text-white',
            },
          }}
        />
      </body>
    </html>
  );
}
