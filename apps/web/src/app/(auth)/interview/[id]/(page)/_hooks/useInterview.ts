import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export const INTERVIEW_ANSWER_MAX_LENGTH = 4000;

type SpeechRecognitionCtor = new () => any;

type WindowWithSpeech = Window & {
	SpeechRecognition?: SpeechRecognitionCtor;
	webkitSpeechRecognition?: SpeechRecognitionCtor;
};

export function useInterview(
	sessionId: string,
	initialMessages: Message[] = [],
) {
	const router = useRouter();
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [inputValue, setInputValue] = useState("");
	const [sttSupported, setSttSupported] = useState(false);
	const [ttsSupported, setTtsSupported] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [ttsEnabled, setTtsEnabled] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const recognitionRef = useRef<any>(null);
	const lastSpokenMessageIdRef = useRef<string | null>(null);
	const speechUnlockedRef = useRef(false);
	const russianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
	const [isSpeechBlocked, setIsSpeechBlocked] = useState(false);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	const stopSpeaking = () => {
		if (typeof window === "undefined") return;

		window.speechSynthesis.cancel();
		setIsSpeaking(false);
	};

	const stopListening = () => {
		recognitionRef.current?.stop?.();
		recognitionRef.current = null;
		setIsListening(false);
	};

	const unlockSpeech = () => {
		if (speechUnlockedRef.current) return;
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		speechUnlockedRef.current = true;
		setIsSpeechBlocked(false);

		try {
			const utterance = new SpeechSynthesisUtterance("");
			window.speechSynthesis.speak(utterance);
			window.speechSynthesis.cancel();
		} catch {
			// Игнорируем — API может быть недоступен
		}
	};

	const appendTranscript = (transcript: string) => {
		const normalizedTranscript = transcript.trim();

		if (!normalizedTranscript) return;

		setInputValue((currentValue) => {
			const currentText = currentValue.trimEnd();
			const currentLength = currentText.trim().length;

			if (currentLength >= INTERVIEW_ANSWER_MAX_LENGTH) {
				return currentText;
			}

			if (!currentText.trim()) {
				return normalizedTranscript.slice(0, INTERVIEW_ANSWER_MAX_LENGTH);
			}

			const remainingLength = INTERVIEW_ANSWER_MAX_LENGTH - currentLength - 1;

			if (remainingLength <= 0) {
				return currentText;
			}

			return `${currentText} ${normalizedTranscript.slice(0, remainingLength)}`;
		});
	};

	const speakText = (text: string) => {
		if (!ttsSupported || typeof window === "undefined") {
			return;
		}

		const normalizedText = text.trim();

		if (!normalizedText) return;

		if (!speechUnlockedRef.current) {
			setIsSpeechBlocked(true);
			return;
		}

		stopListening();
		stopSpeaking();

		const utterance = new SpeechSynthesisUtterance(normalizedText);
		utterance.lang = "ru-RU";

		if (russianVoiceRef.current) {
			utterance.voice = russianVoiceRef.current;
		}

		utterance.rate = 1;
		utterance.pitch = 1;
		utterance.onstart = () => setIsSpeaking(true);
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);

		window.speechSynthesis.speak(utterance);
	};

	const newMessage = useMutation(
		trpc.session.addNewMessage.mutationOptions({
			onSuccess: (result) => {
				setInputValue("");

				if (result.type === "finished") {
					if (result.result.streakUpdated) {
						toast.success("Интервью завершено");
					} else {
						toast.success("Интервью уже завершено");
					}

					router.push(`/interview/${sessionId}/results` as Route);
					router.refresh();
					return;
				}

				setMessages((currentMessages) => [
					...currentMessages,
					{
						...result.message,
						analysisNote: null,
					},
				]);
				scrollToBottom("auto");
			},
		}),
	);

	const finishInterview = useMutation(
		trpc.session.finishSession.mutationOptions({
			onSuccess: (result) => {
				if (result.complete) {
					toast.success("Интервью завершено");
				} else {
					toast.success("Интервью уже завершено");
				}

				router.push(`/interview/${sessionId}/results` as Route);
				router.refresh();
			},
		}),
	);

	const cancelInterview = useMutation(
		trpc.session.cancelSession.mutationOptions({
			onSuccess: (result) => {
				if (result.canceled) {
					toast.success("Интервью отменено");
				} else {
					toast.success("Интервью уже было завершено");
				}

				router.push(`/interview/${sessionId}/results` as Route);
				router.refresh();
			},
		}),
	);

	const startListening = () => {
		if (!sttSupported || isListening || newMessage.isPending) {
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		const speechWindow = window as WindowWithSpeech;
		const SpeechRecognition =
			speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			toast.error("Распознавание речи недоступно в этом браузере");
			return;
		}

		stopSpeaking();
		unlockSpeech();

		const recognition = new SpeechRecognition();
		recognition.lang = "ru-RU";
		recognition.interimResults = false;
		recognition.continuous = false;
		recognition.maxAlternatives = 1;
		recognition.onresult = (event: any) => {
			const transcript = event.results?.[0]?.[0]?.transcript ?? "";
			appendTranscript(transcript);
		};
		recognition.onerror = (event: any) => {
			if (event?.error === "not-allowed" || event?.error === "permission-denied") {
				toast.error(
					"Пожалуйста, разрешите доступ к микрофону в настройках браузера",
				);
			} else if (event?.error !== "aborted") {
				toast.error("Не удалось распознать речь");
			}

			setIsListening(false);
			recognitionRef.current = null;
		};
		recognition.onend = () => {
			setIsListening(false);
			recognitionRef.current = null;
		};

		recognitionRef.current = recognition;
		setIsListening(true);

		try {
			recognition.start();
		} catch {
			toast.error("Не удалось запустить распознавание речи");
			setIsListening(false);
			recognitionRef.current = null;
		}
	};

	const toggleListening = () => {
		if (isListening) {
			stopListening();
			return;
		}

		startListening();
	};

	const toggleTts = () => {
		unlockSpeech();
		setTtsEnabled((current) => !current);
	};

	const speakLastAiMessage = () => {
		unlockSpeech();

		const lastAiMessage = [...messages]
			.reverse()
			.find((message) => message.isAi);

		if (!lastAiMessage) {
			toast.error("Пока нечего озвучивать");
			return;
		}

		lastSpokenMessageIdRef.current = lastAiMessage.id;
		speakText(lastAiMessage.messageText);
	};

	const handleSend = async () => {
		unlockSpeech();

		const content = inputValue.trim().slice(0, INTERVIEW_ANSWER_MAX_LENGTH);

		if (
			!content ||
			newMessage.isPending ||
			finishInterview.isPending ||
			cancelInterview.isPending
		) {
			return;
		}

		stopListening();
		stopSpeaking();

		setMessages((currentMessages) => [
			...currentMessages,
			{
				id: crypto.randomUUID(),
				isAi: false,
				messageText: content,
				analysisNote: null,
				createdAt: new Date(),
			},
		]);

		await newMessage.mutateAsync({ sessionId, content });
	};

	const handleFinish = async () => {
		if (finishInterview.isPending) return;

		stopListening();
		stopSpeaking();

		await finishInterview.mutateAsync(sessionId);
	};

	const handleCancel = async () => {
		if (cancelInterview.isPending) return;

		stopListening();
		stopSpeaking();

		await cancelInterview.mutateAsync(sessionId);
	};

	useEffect(() => {
		if (typeof window === "undefined") return;

		const speechWindow = window as WindowWithSpeech;
		setSttSupported(
			Boolean(
				speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition,
			),
		);
		setTtsSupported(Boolean(window.speechSynthesis));
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		const updateVoices = () => {
			const voices = window.speechSynthesis.getVoices();

			if (voices.length === 0) return;

			russianVoiceRef.current =
				voices.find((voice) => voice.lang.startsWith("ru")) ?? null;
		};

		updateVoices();
		window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
		return () =>
			window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
	}, []);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];

		if (!lastMessage?.isAi || !ttsEnabled || !ttsSupported) {
			return;
		}

		if (!speechUnlockedRef.current) {
			setIsSpeechBlocked(true);
			return;
		}

		if (lastSpokenMessageIdRef.current === lastMessage.id) {
			return;
		}

		lastSpokenMessageIdRef.current = lastMessage.id;
		speakText(lastMessage.messageText);
	}, [messages, ttsEnabled, ttsSupported]);

	useEffect(() => {
		return () => {
			stopListening();
			stopSpeaking();
		};
	}, []);

	return {
		messages,
		inputValue,
		setInputValue,
		isSending: newMessage.isPending,
		isFinishing: finishInterview.isPending,
		isCanceling: cancelInterview.isPending,
		messagesEndRef,
		sttSupported,
		ttsSupported,
		isListening,
		isSpeaking,
		isSpeechBlocked,
		ttsEnabled,
		toggleTts,
		toggleListening,
		speakLastAiMessage,
		handleSend,
		handleFinish,
		handleCancel,
	};
}
