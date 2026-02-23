import { PrivateHeader } from "@/components/header";

export default function UnauthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <>
            <PrivateHeader/>
            {children}
        </>
    );
}