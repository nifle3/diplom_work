import ScenarioConstructor from "@/components/scenario-constructor";
import { serverTrpc } from "@/lib/trpcServer";

export const metadata = {
  title: "Конструктор сценария",
};

export default async function ConstructorPage() {
  const trpc = await serverTrpc();

  const [categories, criteriaTypes] = await Promise.all([
    trpc.script.categories(),
    trpc.script.criteriaTypes(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <ScenarioConstructor
        initialCategories={categories}
        initialCriteriaTypes={criteriaTypes}
      />
    </div>
  );
}
