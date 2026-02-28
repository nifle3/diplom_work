"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default async function CreateScriptButton() {
	const router = useRouter();
	const createDraft = useMutation(
		trpc.expert.createNewDraft.mutationOptions({
			onSuccess: (data) => {
				// biome-ignore lint/suspicious/noExplicitAny: Needed for Next.js router.push type compatibility
				router.push(`/constructor/${data}/firstStep` as any);
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
