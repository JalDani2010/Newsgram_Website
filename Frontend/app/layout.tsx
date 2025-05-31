import type React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import ClientBodyFix from "@/components/ClientBodyFix";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NewsApp",
  description: "A modern news web application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} dark`}
      suppressHydrationWarning
    >
      {/* Also suppress mismatch warnings on <body> */}
      <body suppressHydrationWarning>
        <ClientBodyFix>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <CookieConsent />
          </ThemeProvider>
        </ClientBodyFix>
      </body>
    </html>
  );
}
