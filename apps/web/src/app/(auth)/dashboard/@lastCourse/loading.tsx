import { ScriptCardSkeleton } from "@/components/scriptCard";

export default function Loading() {
	return (
		<>
			{Array.from({ length: 5 }).map((_, index) => (
				<ScriptCardSkeleton key={index} />
			))}
		</>
	);
}
