import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
	value: string;
	onChange: (val: string) => void;
	onSend: () => void;
	disabled: boolean;
}

export const ChatInput = ({
	value,
	onChange,
	onSend,
	disabled,
}: ChatInputProps) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="flex gap-2">
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Напишите ваш ответ..."
				className="max-h-[200px] min-h-[44px] resize-none rounded-2xl py-3"
				disabled={disabled}
			/>
			<Button
				size="icon"
				onClick={onSend}
				disabled={!value.trim() || disabled}
				className="shrink-0 rounded-2xl"
			>
				<Send className="size-4" />
			</Button>
		</div>
	);
};
