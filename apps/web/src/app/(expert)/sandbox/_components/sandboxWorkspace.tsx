"use client";

import { useMutation } from "@tanstack/react-query";
import { Bot, ChevronLeft, RotateCcw, Sparkles, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatInput } from "@/app/(auth)/interview/[id]/(page)/_components/chatInput";
import { TypingIndicator } from "@/app/(auth)/interview/[id]/(page)/_components/typingIndicator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type {
	SandboxScript,
	SandboxSelectedScript,
	SandboxSession,
} from "../_types";
import { SandboxFinalCard } from "./sandboxFinalCard";

type SandboxWorkspaceProps = {
	draftScripts: SandboxScript[];
	initialSession: SandboxSession | null;
	publishedScripts: SandboxScript[];
	selectedScript: SandboxSelectedScript | null;
	selectedSessionId: string | null;
};

export function SandboxWorkspace({
	draftScripts,
	initialSession,
	publishedScripts,
	selectedScript,
	selectedSessionId,
}: SandboxWorkspaceProps) {
	const router = useRouter();
	const [activeSession, setActiveSession] = useState<SandboxSession | null>(
		initialSession,
	);
	const [messages, setMessages] = useState<SandboxSession["messages"]>(
		initialSession?.messages ?? [],
	);
	const [inputValue, setInputValue] = useState("");
	const [finalEvaluation, setFinalEvaluation] = useState<
		SandboxSession["finalEvaluation"]
	>(initialSession?.finalEvaluation ?? null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveSession(initialSession);
		setMessages(initialSession?.messages ?? []);
		setInputValue("");
		setFinalEvaluation(initialSession?.finalEvaluation ?? null);
	}, [initialSession?.id]);

	const allScripts = useMemo(() => {
		return [...publishedScripts, ...draftScripts].sort((left, right) => {
			return (
				(right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0)
			);
		});
	}, [draftScripts, publishedScripts]);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	const createSession = useMutation(
		trpc.expertSandbox.createSession.mutationOptions({
			onSuccess: (sessionId) => {
				toast.success("Sandbox-сессия создана");
				if (selectedScript) {
					router.replace(
						`/expert/sandbox?scriptId=${selectedScript.id}&sessionId=${sessionId}` as Route,
					);
				} else {
					router.replace(`/expert/sandbox?sessionId=${sessionId}` as Route);
				}
				router.refresh();
			},
		}),
	);

	const sendAnswer = useMutation(
		trpc.expertSandbox.sendAnswer.mutationOptions(),
	);

	const rewindSession = useMutation(
		trpc.expertSandbox.rewindSession.mutationOptions(),
	);

	const isSending =
		sendAnswer.isPending || createSession.isPending || rewindSession.isPending;
	const hasActiveSession = activeSession !== null;
	const currentQuestionIndex = activeSession?.currentQuestionIndex ?? 0;
	const totalQuestions = activeSession?.script.questions.length ?? 0;
	const currentQuestionLabel =
		hasActiveSession && totalQuestions > 0
			? `${Math.min(currentQuestionIndex + 1, totalQuestions)} / ${totalQuestions}`
			: "0 / 0";

	const handleCreateSession = async (scriptId: string) => {
		if (createSession.isPending) return;

		await createSession.mutateAsync(scriptId);
	};

	const handleSend = async () => {
		if (!activeSession || !inputValue.trim() || isSending || finalEvaluation) {
			return;
		}

		const content = inputValue.trim();
		const optimisticMessage = {
			id: crypto.randomUUID(),
			isAi: false,
			messageText: content,
			analysisNote: null,
			createdAt: new Date(),
		};

		setInputValue("");
		setMessages((currentMessages) => [...currentMessages, optimisticMessage]);

		try {
			const result = await sendAnswer.mutateAsync({
				sessionId: activeSession.id,
				content,
			});

			if (result.type === "finished") {
				setActiveSession((currentSession) =>
					currentSession
						? {
								...currentSession,
								currentQuestionIndex: result.currentQuestionIndex,
							}
						: currentSession,
				);
				setFinalEvaluation(result.finalEvaluation);
				setMessages((currentMessages) => {
					const nextMessages = [...currentMessages];
					const lastIndex = nextMessages.length - 1;
					if (lastIndex >= 0) {
						nextMessages[lastIndex] = {
							...nextMessages[lastIndex],
							analysisNote:
								nextMessages[lastIndex].analysisNote ??
								result.analysisNote ??
								null,
						};
					}
					return nextMessages;
				});
				scrollToBottom("smooth");
				return;
			}

			setMessages((currentMessages) => {
				const nextMessages = [...currentMessages];
				const lastIndex = nextMessages.length - 1;
				if (lastIndex >= 0) {
					nextMessages[lastIndex] = {
						...nextMessages[lastIndex],
						analysisNote: result.analysisNote,
					};
				}
				nextMessages.push(result.message);
				return nextMessages;
			});
			setActiveSession((currentSession) =>
				currentSession
					? {
							...currentSession,
							currentQuestionIndex: result.currentQuestionIndex,
						}
					: currentSession,
			);
			scrollToBottom("auto");
		} catch {
			setMessages((currentMessages) => currentMessages.slice(0, -1));
			setInputValue(content);
		}
	};

	const handleRewind = async (messageId: string, messageText: string) => {
		if (!activeSession || rewindSession.isPending) {
			return;
		}

		const result = await rewindSession.mutateAsync({
			sessionId: activeSession.id,
			messageId,
		});

		setActiveSession((currentSession) =>
			currentSession
				? {
						...currentSession,
						currentQuestionIndex: result.currentQuestionIndex,
					}
				: currentSession,
		);
		setMessages(result.messages);
		setFinalEvaluation(null);
		setInputValue(messageText);
		scrollToBottom("auto");
	};

	const handleOpenScript = async (scriptId: string) => {
		await handleCreateSession(scriptId);
	};

	const hasSelectedScript = selectedScript !== null;
	const initialChosenScript = selectedScript ?? activeSession?.script ?? null;

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.04),_transparent_35%)] px-4 py-6">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
				<header className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-5 shadow-black/5 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Sparkles className="size-4" />
							Sandbox эксперта
						</div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Проверьте свой курс так, как это сделает кандидат
						</h1>
						<p className="max-w-3xl text-muted-foreground text-sm leading-6">
							Запустите сценарий, посмотрите мгновенную обратную связь под
							каждым ответом и при необходимости вернитесь к любому своему
							сообщению, чтобы переписать его с этого места.
						</p>
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-2">
						<Button asChild variant="outline">
							<Link href="/expert">
								<ChevronLeft className="size-4" />В кабинет
							</Link>
						</Button>
						{hasActiveSession && (
							<Badge variant="outline" className="rounded-full px-3 py-1">
								{currentQuestionLabel}
							</Badge>
						)}
					</div>
				</header>

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
					<section className="space-y-4">
						{hasActiveSession ? (
							<Card className="border-0 bg-card/95 shadow-black/5 shadow-xl">
								<CardHeader className="space-y-2">
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div className="space-y-1">
											<CardDescription>Активная сессия</CardDescription>
											<CardTitle className="text-2xl">
												{activeSession.script.title ?? "Без названия"}
											</CardTitle>
										</div>
										<Badge variant="secondary" className="rounded-full">
											{currentQuestionLabel}
										</Badge>
									</div>
									<p className="text-muted-foreground text-sm leading-6">
										{activeSession.script.description?.trim() ||
											"Описание сценария пока не заполнено."}
									</p>
								</CardHeader>

								<CardContent className="space-y-4">
									<div className="space-y-4 rounded-3xl border bg-background/80 p-4">
										{messages.map((message) => (
											<SandboxMessageItem
												key={message.id}
												message={message}
												onRewind={message.isAi ? undefined : handleRewind}
												rewindDisabled={rewindSession.isPending}
											/>
										))}

										{sendAnswer.isPending && <TypingIndicator />}
										<div ref={messagesEndRef} className="h-4" />
									</div>

									{finalEvaluation ? (
										<SandboxFinalCard finalEvaluation={finalEvaluation} />
									) : null}

									<div className="space-y-2">
										<div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-[0.18em]">
											<span>Текущий ответ</span>
											<span>Нажмите Enter для отправки</span>
										</div>
										<ChatInput
											value={inputValue}
											onChange={setInputValue}
											onSend={handleSend}
											disabled={isSending || !!finalEvaluation}
										/>
									</div>
								</CardContent>
							</Card>
						) : hasSelectedScript ? (
							<Card className="border-0 bg-card/95 shadow-black/5 shadow-xl">
								<CardHeader className="space-y-2">
									<CardDescription>Выбранный курс</CardDescription>
									<CardTitle className="text-2xl">
										{initialChosenScript?.title ?? "Без названия"}
									</CardTitle>
									<p className="text-muted-foreground text-sm leading-6">
										{initialChosenScript?.description?.trim() ||
											"Описание сценария пока не заполнено."}
									</p>
								</CardHeader>

								<CardContent className="space-y-4">
									<div className="rounded-3xl border bg-background/80 p-5">
										<p className="text-muted-foreground text-sm leading-7">
											Этот sandbox привязан к конкретному курсу. Нажмите старт,
											чтобы начать прохождение именно этого сценария.
										</p>
									</div>

									<Button
										className="w-full"
										onClick={() => handleOpenScript(initialChosenScript!.id)}
										disabled={createSession.isPending || !initialChosenScript}
									>
										Запустить sandbox для этого курса
									</Button>
								</CardContent>
							</Card>
						) : (
							<Card className="border-0 bg-card/95 shadow-black/5 shadow-xl">
								<CardHeader className="space-y-2">
									<CardDescription>Запуск sandbox</CardDescription>
									<CardTitle className="text-2xl">
										Выберите курс для проверки
									</CardTitle>
								</CardHeader>

								<CardContent className="space-y-4">
									{selectedSessionId ? (
										<div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-muted-foreground text-sm">
											Сессия не найдена. Возможно, она была удалена или ссылка
											устарела.
										</div>
									) : null}

									<div className="grid gap-4 md:grid-cols-2">
										{allScripts.length === 0 ? (
											<div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-muted-foreground text-sm">
												У вас пока нет курсов для sandbox.
											</div>
										) : (
											allScripts.map((script) => (
												<Card
													key={script.id}
													className="border border-border/70 bg-background/80 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
												>
													<CardHeader className="space-y-3">
														<div className="flex items-start justify-between gap-3">
															<div className="space-y-1">
																<CardTitle className="text-base leading-6">
																	{script.title ?? "Без названия"}
																</CardTitle>
																<CardDescription>
																	{script.categoryName ?? "Без категории"}
																</CardDescription>
															</div>
															{script.isDraft ? (
																<Badge variant="outline">Черновик</Badge>
															) : (
																<Badge variant="secondary">Опубликован</Badge>
															)}
														</div>
														<p className="line-clamp-3 text-muted-foreground text-sm leading-6">
															{script.context?.trim() ||
																"Контекст еще не заполнен. Sandbox всё равно можно запустить, если сценарий готов."}
														</p>
													</CardHeader>
													<CardContent>
														<Button
															className="w-full"
															onClick={() => handleOpenScript(script.id)}
															disabled={createSession.isPending}
														>
															Запустить sandbox
														</Button>
													</CardContent>
												</Card>
											))
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</section>

					<aside className="space-y-4">
						<Card className="border-0 bg-card/95 shadow-black/5 shadow-xl">
							<CardHeader>
								<CardTitle className="text-lg">Как пользоваться</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-muted-foreground text-sm leading-6">
								<p>1. Выберите свой курс и начните сценарий.</p>
								<p>
									2. После каждого ответа вы увидите короткий фидбек прямо под
									сообщением.
								</p>
								<p>
									3. Чтобы переписать ответ, нажмите кнопку редактирования на
									своем сообщении. Все последующие реплики будут удалены, а
									диалог продолжится с выбранного места.
								</p>
							</CardContent>
						</Card>
					</aside>
				</div>
			</div>
		</div>
	);
}

type SandboxMessageItemProps = {
	message: SandboxSession["messages"][number];
	onRewind?: (messageId: string, messageText: string) => void;
	rewindDisabled?: boolean;
};

function SandboxMessageItem({
	message,
	onRewind,
	rewindDisabled,
}: SandboxMessageItemProps) {
	const { analysisNote, createdAt, isAi, messageText, id } = message;
	return (
		<div className={cn("flex gap-3", !isAi && "flex-row-reverse")}>
			<Avatar className="shrink-0">
				<AvatarFallback>
					{isAi ? <Bot className="size-5" /> : <User className="size-5" />}
				</AvatarFallback>
			</Avatar>

			<div
				className={cn(
					"flex max-w-[82%] flex-col",
					isAi ? "items-start" : "items-end",
				)}
			>
				<div
					className={cn(
						"rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
						isAi ? "bg-muted" : "bg-primary text-primary-foreground",
					)}
				>
					{messageText}
				</div>

				<div className="mt-1 flex items-center gap-2 text-muted-foreground text-xs">
					<span>
						{createdAt.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					{!isAi && onRewind ? (
						<Button
							type="button"
							variant="ghost"
							size="xs"
							className="h-6 rounded-full px-2 text-xs"
							disabled={rewindDisabled}
							onClick={() => onRewind(id, messageText)}
						>
							<RotateCcw className="size-3" />
							Переписать
						</Button>
					) : null}
				</div>

				{!isAi && analysisNote?.trim() ? (
					<div className="mt-2 w-full rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-emerald-950 text-xs leading-6 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
						<div className="mb-1 font-medium text-[10px] uppercase tracking-[0.16em]">
							Быстрый фидбек
						</div>
						{analysisNote}
					</div>
				) : null}
			</div>
		</div>
	);
}
