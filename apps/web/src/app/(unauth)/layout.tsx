import PublicHeader from "@/components/publicHeader";

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