import type { ReactNode } from "react";
import { PrivateHeader } from "../../components/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PrivateHeader />
      {children}
    </>
  );
}
