import type { ReactNode } from "react";

export default function Layout({
    children, myHistory
}: Readonly<{
    children: ReactNode;
    myHistory: ReactNode;
}>) {
    return (
        <>
            {children}
            {myHistory}
        </>
    )
}