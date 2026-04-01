"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type ReportScriptButtonProps = {
	scriptId: string;
};

export function ReportScriptButton({ scriptId }: ReportScriptButtonProps) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");

	const createReport = useMutation(
		trpc.report.create.mutationOptions({
			onSuccess: () => {
				toast.success("Жалоба отправлена");
				setReason("");
				setOpen(false);
			},
		}),
	);

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (createReport.isPending || reason.trim().length < 10) {
			return;
		}

		await createReport.mutateAsync({
			scriptId,
			reason,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full flex-1">
					Пожаловаться
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Пожаловаться на курс</DialogTitle>
					<DialogDescription>
						Опиши, что именно не так. Это поможет админам и эксперту быстро
						разобраться.
					</DialogDescription>
				</DialogHeader>
				<form className="space-y-4" onSubmit={onSubmit}>
					<Textarea
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						minLength={10}
						maxLength={2000}
						placeholder="Например: в курсе есть неактуальная информация, дублирующиеся вопросы или оскорбительный контент."
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={createReport.isPending || reason.trim().length < 10}
					>
						Отправить жалобу
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
