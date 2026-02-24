import PrivateHeader from "@/components/privateHeader";

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