import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function Loading() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Название</TableHead>
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
							<Skeleton className="h-4 w-48" />
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
