import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyAchievementsTable from "./myAchivementsTable";
import MyHistoryTable from "./myHistoryTable";

export default function TableSelector() {
	return (
		<Tabs defaultValue="history" className="w-full">
			<TabsList className="mb-6 grid w-full grid-cols-2 bg-muted/50 p-1">
				<TabsTrigger
					value="history"
					className="data-[active]:bg-gradient-to-r data-[active]:from-violet-600 data-[active]:to-indigo-600 data-[active]:text-white"
				>
					Моя история
				</TabsTrigger>
				<TabsTrigger
					value="achievements"
					className="data-[active]:bg-gradient-to-r data-[active]:from-violet-600 data-[active]:to-indigo-600 data-[active]:text-white"
				>
					Мои достижения
				</TabsTrigger>
			</TabsList>
			<TabsContent value="history">
				<MyHistoryTable data={historyData} />
			</TabsContent>
			<TabsContent value="achievements">
				<MyAchievementsTable data={transformedAchievements} />
			</TabsContent>
		</Tabs>
	);
}
