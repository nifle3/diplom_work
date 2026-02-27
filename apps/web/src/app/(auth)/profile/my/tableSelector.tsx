"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import MyHistoryTable from "./myHistoryTable";
import MyAchivementsTable from "./myAchivementsTable";

enum TableEnum {
    MyAchivements, MyHistory,
}

export default function TableSelector() {
    const [selectedTable, setSelectedTable] = useState<TableEnum>(TableEnum.MyHistory);

    const selectAchivements = () => {
        setSelectedTable(TableEnum.MyAchivements);
    }

    const selectHistory = () => {
        setSelectedTable(TableEnum.MyHistory);
    }

    return (
        <>
            <Button onClick={selectHistory}>Моя история</Button>
            <Button onClick={selectAchivements}>Мои достижения</Button>

            {
                selectedTable == TableEnum.MyHistory && <MyHistoryTable/> 
                || selectedTable == TableEnum.MyAchivements && <MyAchivementsTable/>
            }
        </>
    )
}