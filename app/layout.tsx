import type { Metadata } from "next";
import "./globals.css";
import { profile } from "./content/profile";

export const metadata: Metadata = {
  title: `${profile.name} · Research Portfolio`,
  description: profile.statement,
  openGraph: {
    title: `${profile.name} · Research Portfolio`,
    description: profile.statement,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${profile.name} · Research Portfolio`,
    description: profile.statement,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('homepage-theme');var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var savedMotion=localStorage.getItem('homepage-motion');var motion=savedMotion||(matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on');var savedBackground=localStorage.getItem('homepage-background');var background=savedBackground==='lavender'?'lavender':'white';document.documentElement.dataset.theme=theme;document.documentElement.dataset.motion=motion;document.documentElement.dataset.background=background;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.background='white';}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
