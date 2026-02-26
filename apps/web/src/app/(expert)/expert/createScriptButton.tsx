"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default async function CreateScriptButton() {
    const router = useRouter();
    const onClick = async () => {
        await trpc.expert.createNewDraft;
    };

    return (
        <Button onClick={onClick}>
            Добавить новый
        </Button>
    )
} 