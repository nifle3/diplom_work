"use client";

import { useMutation } from "@tanstack/react-query";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Pencil, Play, Trash2, Undo2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GeneralTable } from "@/components/generalTable";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { trpc } from "@/lib/trpc";

export interface ScriptRow {
	id: string;
	title: string | null;
	context: string | null;
	categoryName: string | null;
	createdAt: Date | null;
}

interface SharedTableProps {
	data: ScriptRow[];
	isDraftTable?: boolean;
}

const defaultColumns = (
	onDelete: (id: string) => void,
	onPublish: (id: string) => void,
	onRevertToDraft: (id: string) => void,
	isDraftTable?: boolean,
): ColumnDef<ScriptRow>[] => [
	{
		accessorKey: "title",
		header: "Название",
		cell: ({ row }) => {
			if (isDraftTable) {
				return (
					<span
						className="max-w-[200px] truncate font-medium"
						title={row.original.title ?? undefined}
					>
						{row.original.title ?? "Без названия"}
					</span>
				);
			}

			return (
				<Link
					className="max-w-[200px] truncate font-medium"
					href={{ pathname: `/script/${row.original.id}` }}
					title={row.original.title ?? undefined}
				>
					{row.original.title ?? "Без названия"}
				</Link>
			);
		},
	},
	{
		accessorKey: "categoryName",
		header: "Категория",
		cell: ({ row }) => row.original.categoryName ?? "—",
	},
	{
		accessorKey: "createdAt",
		header: "Дата создания",
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
	{
		id: "actions",
		header: "Действия",
		cell: ({ row }) => {
			const scriptTitle = row.original.title ?? "Без названия";
			return (
				<div className="flex gap-2">
					{isDraftTable && (
						<Modal
							header={"Опубликовать сценарий"}
							description={`Вы хотите сделать сценарий ${row.original.title} публичным?`}
							actionName={"Опубликовать"}
							action={() => onPublish(row.original.id)}
							asChild={true}
						>
							<Button variant="ghost" size="icon">
								<Upload className="h-4 w-4" />
							</Button>
						</Modal>
					)}
					{!isDraftTable && (
						<Modal
							header={"Вернуть сценарий в черновик"}
							description={`Вы хотите вернуть сценарий ${scriptTitle} в черновик?`}
							actionName={"Вернуть"}
							action={() => onRevertToDraft(row.original.id)}
							asChild={true}
						>
							<Button variant="ghost" size="icon" title="Вернуть в черновик">
								<Undo2 className="h-4 w-4" />
							</Button>
						</Modal>
					)}
					<Link
						href={{
							pathname: `/sandbox/${row.original.id}`,
						}}
						className="inline-flex size-8 items-center justify-center rounded-none hover:bg-muted"
						title="Открыть sandbox курса"
					>
						<Play className="h-4 w-4" />
					</Link>
					<Link
						href={{ pathname: `/createScript/${row.original.id}/firstStep` }}
						className="inline-flex size-8 items-center justify-center rounded-none hover:bg-muted"
					>
						<Pencil className="h-4 w-4" />
					</Link>
					<Modal
						header={"Удалить сценарий"}
						description={`Вы уверены, что хотите удалить сценарий ${scriptTitle}? Это
							действие нельзя отменить.`}
						actionName={"Удалить"}
						action={() => onDelete(row.original.id)}
						asChild={true}
					>
						<Button variant="ghost" size="icon">
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					</Modal>
				</div>
			);
		},
	},
];

export function SharedScriptsTable({ data, isDraftTable }: SharedTableProps) {
	const router = useRouter();

	const deleteScript = useMutation(
		trpc.createScript.deleteScript.mutationOptions({
			onSuccess: () => {
				toast("Удаление успешно");
				router.refresh();
			},
		}),
	);

	const publishScript = useMutation(
		trpc.createScript.postDraft.mutationOptions({
			onSuccess: () => {
				toast("Опубликовано");
				router.refresh();
			},
		}),
	);

	const revertToDraftScript = useMutation(
		trpc.createScript.revertToDraft.mutationOptions({
			onSuccess: () => {
				toast("Переведено в черновик");
				router.refresh();
			},
		}),
	);

	const onDelete = async (scriptId: string) => {
		await deleteScript.mutateAsync(scriptId);
	};

	const onPublish = async (scriptId: string) => {
		await publishScript.mutateAsync(scriptId);
	};

	const onRevertToDraft = async (scriptId: string) => {
		await revertToDraftScript.mutateAsync(scriptId);
	};

	const table = useReactTable({
		data,
		columns: defaultColumns(onDelete, onPublish, onRevertToDraft, isDraftTable),
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<GeneralTable
			headerGroups={table.getHeaderGroups()}
			rows={table.getRowModel().rows}
		/>
	);
}
