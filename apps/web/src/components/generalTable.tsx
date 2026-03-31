"use client";

import { flexRender, type Table as TableType } from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";

type Props<T> = {
	headerGroups: ReturnType<TableType<T>["getHeaderGroups"]>;
	rows: ReturnType<TableType<T>["getRowModel"]>["rows"];
	emptyMessage?: string;
};

export function GeneralTable<T>({
	headerGroups,
	rows,
	emptyMessage = "Нет данных",
}: Readonly<Props<T>>) {
	const emptyColSpan = headerGroups[0]?.headers.length ?? 1;

	return (
		<Table>
			<TableHeader>
				{headerGroups.map((headerGroup) => (
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
			<TableBody>
				{rows.length ? (
					rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={emptyColSpan} className="h-24 text-center">
							{emptyMessage}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
