import type { Metadata, Viewport } from "next";
import "./globals.css";
import { profile } from "./content/profile";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.GITHUB_PAGES === "1" ? "https://damaolucky.github.io" : "https://mint-storyboard-home.damaoluckyy.chatgpt.site"),
  title: `${profile.name} · Research Portfolio`,
  description: profile.statement,
  alternates: { canonical: "/" },
  authors: [{ name: profile.name }],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: `${profile.name} · Research Portfolio`,
    description: profile.statement,
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: `${profile.name} · Research Portfolio`,
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
            // Resolve safe defaults before reading optional saved preferences.
            __html: `(function(){var theme='light';var motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on';var pet='off';try{var savedTheme=localStorage.getItem('homepage-theme');theme=savedTheme==='dark'?'dark':'light';var savedMotion=localStorage.getItem('homepage-motion');if(savedMotion==='on'||savedMotion==='off'){motion=savedMotion;document.documentElement.dataset.motionPreference=savedMotion;}var savedPet=localStorage.getItem('homepage-pet');if(savedPet==='on'||savedPet==='off'){pet=savedPet;document.documentElement.dataset.petPreference=savedPet;}}catch(e){}document.documentElement.dataset.theme=theme;document.documentElement.dataset.motion=motion;document.documentElement.dataset.pet=pet;document.documentElement.style.colorScheme=theme;})();`,
          }}
        />
      </head>
      <body className="notranslate" translate="no">{children}</body>
    </html>
  );
}
