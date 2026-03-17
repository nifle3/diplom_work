import type { ReactNode } from "react";

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
				{children}
			</div>
		</div>
	);
}
