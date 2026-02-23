import Header from "../../../components/header";
import ScenarioConstructor from "../../../components/scenario-constructor";

export const metadata = {
  title: "Конструктор сценария",
};

export default function ConstructorPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Header />
      <ScenarioConstructor />
    </div>
  );
}
