import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LibraryProvider } from "@/contexts/LibraryContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyTV — Your Personal TV",
  description: "A dark, cinematic personal TV experience for your curated YouTube content. No account required — your library lives on your device.",
  metadataBase: new URL("https://mytv-black-mu.vercel.app"),
  openGraph: {
    title: "MyTV — Your Personal TV",
    description: "A dark, cinematic personal TV experience for your curated YouTube content. No account required — your library lives on your device.",
    url: "https://mytv-black-mu.vercel.app",
    siteName: "MyTV",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MyTV — Your Personal TV",
    description: "A dark, cinematic personal TV experience for your curated YouTube content. No account required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Inline script: reads theme from localStorage and applies data-theme before
// first paint to prevent a flash of the wrong theme.
const themeInitScript = `
(function() {
  try {
    var data = JSON.parse(localStorage.getItem('mytv_library') || '{}');
    var theme = data.settings && data.settings.theme ? data.settings.theme : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} h-full`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LibraryProvider>{children}</LibraryProvider>
      </body>
    </html>
  );
}
