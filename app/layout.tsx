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
    <html
      lang="en"
      className="notranslate"
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var theme='light';var motion='on';var pet='on';try{var savedTheme=localStorage.getItem('homepage-theme');theme=savedTheme==='dark'?'dark':'light';var savedMotion=localStorage.getItem('homepage-motion');motion=savedMotion||(matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on');var savedPet=localStorage.getItem('homepage-pet');pet=savedPet==='off'?'off':'on';}catch(e){}document.documentElement.dataset.theme=theme;document.documentElement.dataset.motion=motion;document.documentElement.dataset.pet=pet;document.documentElement.style.colorScheme=theme;})();`,
          }}
        />
      </head>
      <body className="notranslate" translate="no">{children}</body>
    </html>
  );
}
