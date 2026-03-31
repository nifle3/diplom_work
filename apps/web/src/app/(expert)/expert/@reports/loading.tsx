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
					<TableHead>Курс</TableHead>
					<TableHead>Кто пожаловался</TableHead>
					<TableHead>Статус</TableHead>
					<TableHead>Причина</TableHead>
					<TableHead>Создано</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 3 }).map((_, i) => (
					<TableRow key={`expert-reports-skeleton-${i}`}>
						<TableCell>
							<Skeleton className="h-4 w-40" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-32" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-6 w-24" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-64" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-4 w-28" />
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
