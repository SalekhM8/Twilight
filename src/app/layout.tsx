import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppFab from "@/components/WhatsAppFab";
import ClientScrollTop from "@/components/scroll/ClientScrollTop";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Twilight Pharmacy",
	description: "More than just a Pharmacy",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isDev = process.env.NODE_ENV !== "production";
  const isProd = !isDev;
	return (
		<html lang="en">
			<head>
        {isDev ? (
					<script
						dangerouslySetInnerHTML={{
							__html:
								"if(!document.querySelector('[data-tailwind]')){var s=document.createElement('script');s.src='https://cdn.tailwindcss.com';s.setAttribute('data-tailwind','');document.head.appendChild(s);}",
						}}
					/>
				) : null}
        {isProd ? (
          <>
            {/* Google Tag Manager */}
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KQRWCCC9');",
              }}
            />
            {/* Google tag (gtag.js) */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-WT85V9E262" />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-WT85V9E262');",
              }}
            />
          </>
        ) : null}
				<link rel="apple-touch-icon" href="/twilightnew.png" />
				<link rel="icon" href="/twilightnew.png" />
			</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isProd ? (
          // Google Tag Manager (noscript)
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-KQRWCCC9"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
				<ClientScrollTop />
				{children}
				<WhatsAppFab />
			</body>
		</html>
	);
}
