"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SANDBOX_ANSWER_MAX_LENGTH } from "../_hooks/useSandbox";
import { useSandboxContext } from "./sandboxProvider";

export function SandboxChatFooter() {
	const { inputValue, setInputValue, handleSend, isSending } =
		useSandboxContext();

	const isBusy = isSending;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<div className="min-w-0 flex-1 space-y-1">
					<Textarea
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Напишите ваш ответ..."
						className="max-h-[200px] min-h-[44px] resize-none rounded-2xl py-3"
						disabled={isBusy}
						maxLength={SANDBOX_ANSWER_MAX_LENGTH}
					/>
					<div className="text-right text-muted-foreground text-xs">
						{inputValue.length}/{SANDBOX_ANSWER_MAX_LENGTH}
					</div>
				</div>
				<Button
					type="button"
					size="icon"
					onClick={handleSend}
					disabled={!inputValue.trim() || isBusy}
					className="shrink-0 rounded-2xl"
				>
					<Send className="size-4" />
				</Button>
			</div>
		</div>
	);
}
