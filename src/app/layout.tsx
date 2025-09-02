import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhatsAppFab from "@/components/WhatsAppFab";

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
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
				<WhatsAppFab />
			</body>
		</html>
	);
}
