"use client";

import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { SandboxChatFooter } from "./sandboxChatFooter";
import { SandboxMessageItem } from "./sandboxMessageItem";
import { useSandboxContext } from "./sandboxProvider";

export function SandboxChat() {
	const {
		messages,
		isCreating,
		isSending,
		isRewinding,
		sessionId,
		handleRewind,
	} = useSandboxContext();

	if (isCreating) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="flex flex-col items-center gap-4 text-muted-foreground">
					<Loader2 className="size-8 animate-spin text-primary" />
					<p>Создаем sandbox-сессию...</p>
				</div>
			</div>
		);
	}

	if (!sessionId) {
		return (
			<div className="flex h-full items-center justify-center text-muted-foreground">
				<p>Не удалось создать сессию. Попробуйте обновить страницу.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Session info badge */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Sparkles className="size-4" />
					<span>Sandbox режим — можно откатываться к любым ответам</span>
				</div>
				{sessionId && (
					<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
						{sessionId.slice(0, 8)}...
					</code>
				)}
			</div>

			{/* Messages */}
			<div className="space-y-6">
				{messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
						<MessageSquare className="mb-2 size-12 opacity-50" />
						<p className="text-center">Начните диалог, отправив первый ответ</p>
					</div>
				) : (
					messages.map((message) => (
						<SandboxMessageItem
							key={message.id}
							message={message}
							onRewind={handleRewind}
							isRewinding={isRewinding}
						/>
					))
				)}
			</div>

			{/* Typing indicator */}
			{(isSending || isRewinding) && (
				<div className="flex gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
						<Loader2 className="size-5 animate-spin text-primary" />
					</div>
					<div className="flex flex-col gap-1">
						<div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
					</div>
				</div>
			)}

			{/* Input footer */}
			<SandboxChatFooter />
		</div>
	);
}
