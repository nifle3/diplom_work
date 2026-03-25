"use client";

import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function CreateScriptButton() {
	const router = useRouter();

	const createDraft = useMutation(
		trpc.expert.createNewDraft.mutationOptions({
			onSuccess: (data) => {
				router.push(`/createScript/${data}/firstStep` as Route);
			},
		}),
	);

	const onClick = () => {
		createDraft.mutate();
	};

	return (
		<Button onClick={onClick} disabled={createDraft.isPending}>
			Добавить новый
		</Button>
	);
}
