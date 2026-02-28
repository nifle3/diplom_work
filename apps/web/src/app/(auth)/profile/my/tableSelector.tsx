"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import MyAchivementsTable from "./myAchivementsTable";
import MyHistoryTable from "./myHistoryTable";

enum TableEnum {
	MyAchivements = 0,
	MyHistory = 1,
}

export default function TableSelector() {
	const [selectedTable, setSelectedTable] = useState<TableEnum>(
		TableEnum.MyHistory,
	);

	const selectAchivements = () => {
		setSelectedTable(TableEnum.MyAchivements);
	};

	const selectHistory = () => {
		setSelectedTable(TableEnum.MyHistory);
	};

	return (
		<>
			<Button onClick={selectHistory}>Моя история</Button>
			<Button onClick={selectAchivements}>Мои достижения</Button>

			{(selectedTable == TableEnum.MyHistory && <MyHistoryTable />) ||
				(selectedTable == TableEnum.MyAchivements && <MyAchivementsTable />)}
		</>
	);
}
