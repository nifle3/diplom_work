import type { ReactNode } from "react";

export default function Layout({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-12">
			<main className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
                {children}
            </main>
        </div>
    );
}