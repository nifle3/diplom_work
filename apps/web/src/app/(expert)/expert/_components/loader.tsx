import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function Loader() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Название</TableHead>
					<TableHead>Категория</TableHead>
					<TableHead>Дата создания</TableHead>
					<TableHead>Действия</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 3 }).map((_, i) => (
					<TableRow key={`skeleton-row-${i}`}>
						<TableCell>
							<Skeleton className="h-4 w-32" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-24" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-28" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-8 w-16" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
