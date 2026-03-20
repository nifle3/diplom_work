import { Bot } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

export function TypingIndicator() {
	return (
		<div className="fade-in flex animate-in gap-3 duration-300">
			<Avatar className="shrink-0">
				<AvatarFallback>
					<Bot className="size-5" />
				</AvatarFallback>
			</Avatar>
			<div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-muted-foreground text-sm">
				<Spinner className="size-4" />
				Печатает...
			</div>
		</div>
	);
}
