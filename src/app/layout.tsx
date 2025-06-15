import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { InitializeStores } from "@/components/InitializeStores";
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
  title: "Moi Sushi & Poké Bowl - Autentisk Japansk Kök",
  description: "Upplev autentisk japansk kök med moderna influenser. Färska sushi, poké bowls och traditionella japanska rätter. Besök oss i Malmö, Trelleborg eller Ystad.",
  keywords: "sushi, poké bowl, japansk mat, restaurang, malmö, trelleborg, ystad, online beställning",
  openGraph: {
    title: "Moi Sushi & Poké Bowl",
    description: "Autentisk japansk kök med moderna influenser",
    type: "website",
    locale: "sv_SE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <InitializeStores />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
        {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
