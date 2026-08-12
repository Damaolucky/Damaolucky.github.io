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
            __html: `(function(){var theme='light';var motion='on';try{var savedTheme=localStorage.getItem('homepage-theme');theme=savedTheme==='dark'?'dark':'light';var savedMotion=localStorage.getItem('homepage-motion');motion=savedMotion||(matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on');}catch(e){}document.documentElement.dataset.theme=theme;document.documentElement.dataset.motion=motion;document.documentElement.style.colorScheme=theme;})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
