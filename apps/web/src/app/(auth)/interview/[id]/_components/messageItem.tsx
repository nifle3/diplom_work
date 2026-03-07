import { Bot, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "../_utils/type";

export const MessageItem = ({ message }: { message: Message }) => {
	const { isAi, messageText, createdAt } = message;
	return (
		<div className={`flex gap-3 ${!isAi ? "flex-row-reverse" : ""}`}>
			<Avatar className="shrink-0">
				<AvatarFallback>
					{isAi ? <Bot className="size-5" /> : <User className="size-5" />}
				</AvatarFallback>
			</Avatar>
			<div className={`flex max-w-[80%] flex-col ${isAi ? "items-start" : "items-end"}`}>
				<div className={`rounded-2xl px-4 py-2.5 text-sm ${
					isAi ? "bg-muted" : "bg-primary text-primary-foreground"
				}`}>
					{messageText}
				</div>
				<span className="mt-1 text-muted-foreground text-xs">
					{createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
				</span>
			</div>
		</div>
	);
};