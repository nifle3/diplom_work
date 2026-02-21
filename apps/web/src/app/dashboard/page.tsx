import Header from "../../components/header";
import AuthenticatedWindow from "../../components/authenticated-window";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <AuthenticatedWindow />
    </div>
  );
}
