import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type Payment = {
	startedAt: Date;
	finishedAt: Date | null;
	status: string;
	finalScore: number | null;
};

const columns: ColumnDef<Payment>[] = [
	{
		accessorKey: "startedAt",
		header: "Начало",
	},
	{
		accessorKey: "finishedAt",
		header: "Конец",
	},
	{
		accessorKey: "status",
		header: "Статус",
	},
	{
		accessorKey: "finalScore",
		header: "Оценка",
	},
];

type Props = {
	data: Payment[];
};

export function Tables({ data }: Readonly<Props>) {
	const table = useReactTable({
		data: data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Table className="overflow-hidden rounded-md border">
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody />
		</Table>
	);
}
