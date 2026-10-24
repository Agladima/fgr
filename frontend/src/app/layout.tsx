import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";
import { AdminNotificationProvider } from "@/lib/admin/notification-context";

// Load user-supplied fonts locally with next/font/local
const inter = localFont({
  src: "../assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "100 900",
});

const plusJakartaSans = localFont({
  src: "../assets/fonts/Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf",
  variable: "--font-heading",
  display: "swap",
  weight: "200 800",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fgrcdc.org.ng"),
  title: {
    template: "%s | FGR Career Development Center",
    default: "FGR Career Development Center | LEARN • CONNECT • EARN",
  },
  description:
    "Empowering youth, professionals, and institutions through employability, vocational training, digital innovation, and career leadership. LEARN • CONNECT • EARN.",
  keywords: [
    "FGR Career Development Center",
    "Employability",
    "Technical and Vocational Training",
    "Digital Skills",
    "Entrepreneurship",
    "Career Development",
    "Leadership",
    "Nigeria",
  ],
  authors: [{ name: "FGR Career Development Center" }],
  openGraph: {
    title: "FGR Career Development Center | LEARN • CONNECT • EARN",
    description:
      "Empowering youth, professionals, and institutions through employability, vocational training, digital innovation, and career leadership.",
    url: "https://www.fgrcdc.org.ng",
    siteName: "FGR Career Development Center",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const instant = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body>
        <Suspense fallback={null}>
          <AdminNotificationProvider>
            <Header />
            <main id="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {children}
            </main>
            <Footer />
          </AdminNotificationProvider>
        </Suspense>
      </body>
    </html>
  );
}
