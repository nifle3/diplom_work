import type { ReactNode } from "react";

export default function Layout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">{children}</div>
	);
}
