import Header from "../components/header";
import UnauthenticatedWindow from "../components/unauthenticated-window";

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <UnauthenticatedWindow />
    </div>
  );
}
