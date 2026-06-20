"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RewindDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
};

export function RewindDialog({
	open,
	onOpenChange,
	onConfirm,
	isPending,
}: RewindDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-warning" />
						Подтверждение отката
					</AlertDialogTitle>
					<AlertDialogDescription>
						Вы собираетесь откатить интервью к этому ответу. Все последующие
						сообщения (вопросы и ответы) будут безвозвратно удалены. Это
						действие нельзя отменить.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)}>
						Отмена
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? (
							<>
								<RotateCcw className="mr-2 h-4 w-4 animate-spin" />
								Откат...
							</>
						) : (
							<>
								<RotateCcw className="mr-2 h-4 w-4" />
								Подтвердить откат
							</>
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
