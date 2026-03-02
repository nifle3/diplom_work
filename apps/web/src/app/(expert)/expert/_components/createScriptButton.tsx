"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function CreateScriptButton() {
	const router = useRouter();

	const createDraft = useMutation(
		trpc.expert.createNewDraft.mutationOptions({
			onSuccess: (data) => {
				router.push(`/createScript/${data}/firstStep`);
			},
			onError: (error) => {
				toast(error.message);
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
