"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Message } from "@/app/(auth)/interview/[id]/(page)/_utils/type";
import { trpc } from "@/lib/trpc";

export const SANDBOX_ANSWER_MAX_LENGTH = 4000;

export function useSandbox(scriptId: string) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [isCreating, setIsCreating] = useState(false);
	const [sessionId, setSessionId] = useState<string | null>(null);

	const createSession = useMutation(
		trpc.expertSandbox.createSession.mutationOptions({
			onSuccess: (newSessionId) => {
				setSessionId(newSessionId);
				setIsCreating(false);
				queryClient.invalidateQueries({
					queryKey: ["expertSandbox", "getSession", newSessionId],
				});
			},
			onError: () => {
				toast.error("Не удалось создать sandbox-сессию");
				router.back();
			},
		}),
	);

	// Use useQuery to fetch session data when sessionId is available
	const { data: sessionData, isLoading: isLoadingSession } = useQuery(
		trpc.expertSandbox.getSession.queryOptions(sessionId ?? "", {
			enabled: !!sessionId && !isCreating,
		}),
	);

	// Handle session data when it arrives
	useEffect(() => {
		if (sessionData) {
			setMessages(
				sessionData.messages.map((m) => ({
					id: m.id,
					isAi: m.isAi,
					messageText: m.messageText,
					analysisNote: m.analysisNote,
					createdAt: new Date(m.createdAt),
				})),
			);
			setCurrentQuestionIndex(sessionData.currentQuestionIndex);
			setIsCreating(false);
		}
	}, [sessionData]);

	const sendAnswer = useMutation(
		trpc.expertSandbox.sendAnswer.mutationOptions({
			onMutate: async (variables) => {
				await queryClient.cancelQueries({
					queryKey: ["expertSandbox", "getSession", sessionId],
				});

				const previousMessages = messages;

const optimisticMessage: Message = {
				id: crypto.randomUUID(),
				isAi: false,
				messageText: variables.content,
				analysisNote: null,
				createdAt: new Date(),
			};

				setMessages((current) => [...current, optimisticMessage]);

				return { previousMessages };
			},
			onSuccess: (result, _variables, _context) => {
				setInputValue("");

				if (result.type === "finished") {
					toast.success("Интервью завершено (sandbox)");
					setMessages((current) => [
						...current,
						{
							id: crypto.randomUUID(),
							isAi: true,
							messageText:
								"Интервью завершено. Оценка: " +
								(result.finalEvaluation?.score ?? "N/A"),
							createdAt: new Date(),
						},
					]);
					return;
				}

				if (result.type === "next-question") {
					setMessages((current) => [
						...current,
						{
							id: result.message.id,
							isAi: result.message.isAi,
							messageText: result.message.messageText,
							createdAt: new Date(result.message.createdAt),
						},
					]);
					setCurrentQuestionIndex(result.currentQuestionIndex);
				}
			},
			onError: (_error, _variables, context) => {
				if (context?.previousMessages) {
					setMessages(context.previousMessages);
				}
				toast.error("Ошибка при отправке ответа");
			},
			onSettled: () => {
				if (sessionId) {
					queryClient.invalidateQueries({
						queryKey: ["expertSandbox", "getSession", sessionId],
					});
				}
			},
		}),
	);

	const rewindSession = useMutation(
		trpc.expertSandbox.rewindSession.mutationOptions({
			onMutate: async (_variables) => {
				await queryClient.cancelQueries({
					queryKey: ["expertSandbox", "getSession", sessionId],
				});

				const previousMessages = messages;

				return { previousMessages };
			},
			onSuccess: (result) => {
				setMessages(
					result.messages.map((m) => ({
						id: m.id,
						isAi: m.isAi,
						messageText: m.messageText,
						createdAt: new Date(m.createdAt),
					})),
				);
				setCurrentQuestionIndex(result.currentQuestionIndex);
				toast.success("Откат выполнен");
			},
			onError: (_error, _variables, context) => {
				if (context?.previousMessages) {
					setMessages(context.previousMessages);
				}
				toast.error("Ошибка при откате");
			},
			onSettled: () => {
				if (sessionId) {
					queryClient.invalidateQueries({
						queryKey: ["expertSandbox", "getSession", sessionId],
					});
				}
			},
		}),
	);

	useEffect(() => {
		if (scriptId && !isCreating && !sessionId) {
			createSession.mutate(scriptId);
		}
	}, [scriptId, isCreating, sessionId, createSession.mutate]);

	const handleSend = async () => {
		const content = inputValue.trim().slice(0, SANDBOX_ANSWER_MAX_LENGTH);

		if (!content || sendAnswer.isPending || !sessionId) {
			return;
		}

		await sendAnswer.mutateAsync({ sessionId, content });
	};

	const handleRewind = async (messageId: string) => {
		if (!sessionId || rewindSession.isPending) return;
		await rewindSession.mutateAsync({ sessionId, messageId });
	};

	return {
		messages,
		inputValue,
		setInputValue,
		isSending: sendAnswer.isPending,
		isRewinding: rewindSession.isPending,
		isCreating: createSession.isPending || isLoadingSession,
		currentQuestionIndex,
		sessionId,
		handleSend,
		handleRewind,
	};
}
