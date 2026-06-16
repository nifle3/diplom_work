"use client";

import { useMutation } from "@tanstack/react-query";
import { Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

type AdminScriptActionsProps = {
	scriptId: string;
	isDraft: boolean;
};

export function AdminScriptActions({
	scriptId,
	isDraft,
}: AdminScriptActionsProps) {
	const router = useRouter();

	const deleteScript = useMutation(
		trpc.createScript.adminDeleteScript.mutationOptions({
			onSuccess: () => {
				toast.success("Сценарий удалён");
				router.refresh();
			},
		}),
	);

	const revertToDraft = useMutation(
		trpc.createScript.adminRevertToDraft.mutationOptions({
			onSuccess: () => {
				toast.success("Сценарий возвращён в черновик");
				router.refresh();
			},
		}),
	);

	return (
		<>
			{!isDraft && (
				<Modal
					header="Вернуть сценарий в черновик"
					description="Вы уверены, что хотите вернуть этот сценарий в черновик?"
					actionName="Вернуть"
					action={() => revertToDraft.mutateAsync(scriptId)}
					asChild
				>
					<Button
						variant="outline"
						className="w-full flex-1"
						disabled={revertToDraft.isPending}
					>
						<Undo2 className="mr-2 h-4 w-4" />В черновик
					</Button>
				</Modal>
			)}
			<Modal
				header="Удалить сценарий"
				description="Вы уверены, что хотите удалить этот сценарий? Это действие нельзя отменить."
				actionName="Удалить"
				action={() => deleteScript.mutateAsync(scriptId)}
				asChild
			>
				<Button
					variant="destructive"
					className="w-full flex-1"
					disabled={deleteScript.isPending}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Удалить
				</Button>
			</Modal>
		</>
	);
}
