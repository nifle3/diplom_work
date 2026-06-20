"use client";

import { Bot, MessageSquare, RotateCcw, User } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/app/(auth)/interview/[id]/(page)/_utils/type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RewindDialog } from "./rewindDialog";
import { FeedbackDialog } from "./feedbackDialog";

interface SandboxMessageItemProps {
	message: Message;
	onRewind: (messageId: string) => void;
	isRewinding: boolean;
}

export function SandboxMessageItem({
	message,
	onRewind,
	isRewinding,
}: SandboxMessageItemProps) {
	const { isAi, messageText, createdAt, id, analysisNote } = message;
	const [showRewindDialog, setShowRewindDialog] = useState(false);

	const handleRewindClick = () => {
		if (isAi) {
			setShowRewindDialog(true);
		}
	};

	const handleConfirmRewind = () => {
		onRewind(id);
		setShowRewindDialog(false);
	};

	return (
		<div className={`flex gap-3 ${!isAi ? "flex-row-reverse" : ""}`}>
			<Avatar className="shrink-0">
				<AvatarFallback>
					{isAi ? <Bot className="size-5" /> : <User className="size-5" />}
				</AvatarFallback>
			</Avatar>
			<div
				className={`flex max-w-[80%] flex-col ${isAi ? "items-start" : "items-end"}`}
			>
				<div
					className={`rounded-2xl px-4 py-2.5 text-sm ${
						isAi ? "bg-muted" : "bg-primary text-primary-foreground"
					}`}
				>
					{messageText}
				</div>
				<div className="mt-1 flex items-center gap-2">
					<span className="text-muted-foreground text-xs">
						{createdAt.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					{isAi && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleRewindClick}
							disabled={isRewinding}
							className="h-7 w-7 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
							title="Откатиться к этому вопросу"
						>
							<RotateCcw className="size-4" />
						</Button>
					)}
					{!isAi && analysisNote && (
						<FeedbackDialog analysisNote={analysisNote} messageText={messageText} />
					)}
				</div>
				<RewindDialog
					open={showRewindDialog}
					onOpenChange={setShowRewindDialog}
					onConfirm={handleConfirmRewind}
					isPending={isRewinding}
				/>
			</div>
		</div>
	);
}
