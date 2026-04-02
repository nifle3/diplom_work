import { Mic, Pause, Send, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
	value: string;
	onChange: (val: string) => void;
	onSend: () => void;
	disabled: boolean;
	sttSupported: boolean;
	ttsSupported: boolean;
	isListening: boolean;
	isSpeaking: boolean;
	ttsEnabled: boolean;
	onToggleListening: () => void;
	onToggleTts: () => void;
	onSpeakLastAiMessage: () => void;
}

export const ChatInput = ({
	value,
	onChange,
	onSend,
	disabled,
	sttSupported,
	ttsSupported,
	isListening,
	isSpeaking,
	ttsEnabled,
	onToggleListening,
	onToggleTts,
	onSpeakLastAiMessage,
}: ChatInputProps) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					variant={isListening ? "default" : "outline"}
					size="sm"
					onClick={onToggleListening}
					disabled={!sttSupported || disabled}
					className="rounded-full"
				>
					{isListening ? (
						<Pause className="size-4" />
					) : (
						<Mic className="size-4" />
					)}
					{isListening ? "Стоп" : "Диктовка"}
				</Button>
				<Button
					type="button"
					variant={ttsEnabled ? "default" : "outline"}
					size="sm"
					onClick={onToggleTts}
					disabled={!ttsSupported || disabled}
					className="rounded-full"
				>
					{ttsEnabled ? (
						<Volume2 className="size-4" />
					) : (
						<VolumeX className="size-4" />
					)}
					{ttsEnabled ? "Озвучка вкл" : "Озвучка выкл"}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={onSpeakLastAiMessage}
					disabled={!ttsSupported || disabled}
					className="rounded-full"
				>
					<Volume2 className="size-4" />
					{isSpeaking ? "Читаю ответ" : "Повторить ответ"}
				</Button>
				<span className="text-muted-foreground text-xs">
					{!sttSupported && !ttsSupported
						? "Этот браузер не поддерживает STT и TTS"
						: isListening
							? "Слушаю..."
							: isSpeaking
								? "Озвучиваю ответ..."
								: "Можно диктовать ответ или включить озвучку"}
				</span>
			</div>
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
					type="button"
					size="icon"
					onClick={onSend}
					disabled={!value.trim() || disabled}
					className="shrink-0 rounded-2xl"
				>
					<Send className="size-4" />
				</Button>
			</div>
		</div>
	);
};
