import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
