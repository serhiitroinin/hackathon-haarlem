import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Raleway, Roboto, Space_Grotesk } from "next/font/google";

import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Hackathon Haarlem — Starter",
  description: "Next.js + tRPC + Prisma + shadcn + AI SDK ship-fast scaffold",
  icons: [{ rel: "icon", url: "/maverx-mark.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Maverx brand fonts (style guide): Space Grotesk for headings, Raleway for body.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});
const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
});
// Roboto — for the (fake) Google Drive picker, to nail the Google look.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${spaceGrotesk.variable} ${raleway.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </TRPCReactProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
