import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar, SidebarProvider } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Frota Leste - Monitoramento</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
