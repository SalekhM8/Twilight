import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppFab from "@/components/WhatsAppFab";
import ClientScrollTop from "@/components/scroll/ClientScrollTop";
import ChatbotWidget from "@/components/ChatbotWidget";
import SiteHeader from "@/components/SiteHeader";
import { Analytics } from "@vercel/analytics/next";

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
                  "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WVCJ79KS');",
              }}
            />
          </>
        ) : null}
				<link rel="apple-touch-icon" href="/twilightnew.png" />
				<link rel="icon" href="/twilightnew.png" />
			</head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {isProd ? (
          // Meta Pixel — main site (booking/marketing pages only; no health data here).
          // Builds the retargeting audience for the clinic.
          <>
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2000246710639670');fbq('track','PageView');",
              }}
            />
            <noscript>
              <img height="1" width="1" style={{ display: "none" }} alt="" src="https://www.facebook.com/tr?id=2000246710639670&ev=PageView&noscript=1" />
            </noscript>
          </>
        ) : null}
        {isProd ? (
          // Google Tag Manager (noscript)
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WVCJ79KS"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
				<SiteHeader />
				<ClientScrollTop />
				{children}
        <ChatbotWidget />
				<WhatsAppFab />
				<Analytics />
			</body>
		</html>
	);
}
