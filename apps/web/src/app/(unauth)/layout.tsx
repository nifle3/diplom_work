import PublicHeader from "@/components/header";

export default function UnauthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <>
            <PublicHeader/>
            {children}
        </>
    );
}