import { useMutation } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Message } from "../_utils/type";

export const INTERVIEW_ANSWER_MAX_LENGTH = 4000;

// Описание типов Web Speech API в соответствии со стандартами W3C
interface SpeechRecognitionEvent extends Event {
	readonly resultIndex: number;
	readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
	readonly error: string;
	readonly message: string;
}

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	maxAlternatives: number;
	onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
	onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
	onend: ((this: SpeechRecognition, ev: Event) => void) | null;
	onerror:
		| ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
		| null;
	onnomatch:
		| ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
		| null;
	onresult:
		| ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
		| null;
	onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
	onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
	onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
	onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
	onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
	start(): void;
	stop(): void;
	abort(): void;
}

interface SpeechRecognitionConstructor {
	new (): SpeechRecognition;
}

declare global {
	interface Window {
		SpeechRecognition?: SpeechRecognitionConstructor;
		webkitSpeechRecognition?: SpeechRecognitionConstructor;
	}
}

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

	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null); // Ссылка для предотвращения Garbage Collection бага в Chrome
	const lastSpokenMessageIdRef = useRef<string | null>(null);
	const speechUnlockedRef = useRef(false);
	const russianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
	const [isSpeechBlocked, setIsSpeechBlocked] = useState(false);

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		messagesEndRef.current?.scrollIntoView({ behavior });
	};

	const stopSpeaking = useCallback(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		window.speechSynthesis.cancel();
		setIsSpeaking(false);
		utteranceRef.current = null;
	}, []);

	const stopListening = useCallback((abort = false) => {
		if (recognitionRef.current) {
			try {
				if (abort) {
					recognitionRef.current.abort();
				} else {
					recognitionRef.current.stop();
				}
			} catch {}
			recognitionRef.current = null;
		}
		setIsListening(false);
	}, []);

	const unlockSpeech = useCallback(() => {
		if (speechUnlockedRef.current) return;
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		speechUnlockedRef.current = true;
		setIsSpeechBlocked(false);

		try {
			const utterance = new SpeechSynthesisUtterance("");
			window.speechSynthesis.speak(utterance);
			window.speechSynthesis.cancel();
		} catch {}
	}, []);

	const appendTranscript = useCallback((transcript: string) => {
		const normalizedTranscript = transcript.trim();

		if (!normalizedTranscript) return;

		setInputValue((currentValue) => {
			const currentText = currentValue.trimEnd();
			const currentLength = currentText.length;

			if (currentLength >= INTERVIEW_ANSWER_MAX_LENGTH) {
				return currentText;
			}

			if (!currentText) {
				return normalizedTranscript.slice(0, INTERVIEW_ANSWER_MAX_LENGTH);
			}

			const remainingLength = INTERVIEW_ANSWER_MAX_LENGTH - currentLength - 1;

			if (remainingLength <= 0) {
				return currentText;
			}

			return `${currentText} ${normalizedTranscript.slice(0, remainingLength)}`;
		});
	}, []);

	const speakText = useCallback(
		(text: string) => {
			if (
				!ttsSupported ||
				typeof window === "undefined" ||
				!window.speechSynthesis
			) {
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
			utteranceRef.current = utterance;

			utterance.lang = "ru-RU";

			if (russianVoiceRef.current) {
				utterance.voice = russianVoiceRef.current;
			}

			utterance.rate = 1.0;
			utterance.pitch = 1.0;

			utterance.onstart = () => setIsSpeaking(true);
			utterance.onend = () => {
				setIsSpeaking(false);
				utteranceRef.current = null;
			};
			utterance.onerror = (event) => {
				if (event.error !== "interrupted") {
					console.error("SpeechSynthesis error:", event);
				}
				setIsSpeaking(false);
				utteranceRef.current = null;
			};

			window.speechSynthesis.speak(utterance);
		},
		[ttsSupported, stopListening, stopSpeaking],
	);

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

	const startListening = useCallback(() => {
		if (isListening || newMessage.isPending) {
			return;
		}

		if (typeof window === "undefined") {
			return;
		}

		const SpeechRecognition =
			window.SpeechRecognition ?? window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			toast.error("Распознавание речи недоступно в этом браузере");
			return;
		}

		stopSpeaking();
		unlockSpeech();

		const recognition = new SpeechRecognition();
		recognition.lang = "ru-RU";
		recognition.interimResults = false;
		recognition.continuous = true;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			setIsListening(true);
		};

		recognition.onresult = (event) => {
			let speechToText = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					speechToText += event.results[i][0].transcript;
				}
			}
			if (speechToText) {
				appendTranscript(speechToText);
			}
		};

		recognition.onerror = (event) => {
			if (
				event.error === "not-allowed" ||
				event.error === "permission-denied"
			) {
				toast.error(
					"Пожалуйста, разрешите доступ к микрофону в настройках браузера",
				);
			} else if (event.error !== "aborted") {
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

		try {
			recognition.start();
		} catch {
			toast.error("Не удалось запустить распознавание речи");
			setIsListening(false);
			recognitionRef.current = null;
		}
	}, [
		isListening,
		newMessage.isPending,
		stopSpeaking,
		unlockSpeech,
		appendTranscript,
	]);

	const toggleListening = useCallback(() => {
		if (isListening) {
			stopListening();
			return;
		}

		startListening();
	}, [isListening, stopListening, startListening]);

	const toggleTts = useCallback(() => {
		unlockSpeech();
		setTtsEnabled((current) => !current);
	}, [unlockSpeech]);

	const speakLastAiMessage = useCallback(() => {
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
	}, [messages, unlockSpeech, speakText]);

	const handleSend = useCallback(async () => {
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
	}, [
		inputValue,
		sessionId,
		newMessage.isPending,
		finishInterview.isPending,
		cancelInterview.isPending,
		unlockSpeech,
		stopListening,
		stopSpeaking,
		newMessage.mutateAsync,
	]);

	const handleFinish = useCallback(async () => {
		if (finishInterview.isPending) return;

		stopListening();
		stopSpeaking();

		await finishInterview.mutateAsync(sessionId);
	}, [
		finishInterview.isPending,
		sessionId,
		stopListening,
		stopSpeaking,
		finishInterview.mutateAsync,
	]);

	const handleCancel = useCallback(async () => {
		if (cancelInterview.isPending) return;

		stopListening();
		stopSpeaking();

		await cancelInterview.mutateAsync(sessionId);
	}, [
		cancelInterview.isPending,
		sessionId,
		stopListening,
		stopSpeaking,
		cancelInterview.mutateAsync,
	]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		setSttSupported(
			Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
		);
		setTtsSupported(Boolean(window.speechSynthesis));
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;

		const updateVoices = () => {
			const voices = window.speechSynthesis.getVoices();

			if (voices.length === 0) return;

			// Ищем локальные улучшенные русские голоса, иначе берем первый русский
			const ruVoice =
				voices.find(
					(voice) =>
						(voice.lang.startsWith("ru") || voice.lang.startsWith("ru-RU")) &&
						voice.localService,
				) ??
				voices.find(
					(voice) =>
						voice.lang.startsWith("ru") || voice.lang.startsWith("ru-RU"),
				) ??
				null;

			russianVoiceRef.current = ruVoice;
		};

		updateVoices();

		if (window.speechSynthesis.onvoiceschanged !== undefined) {
			window.speechSynthesis.onvoiceschanged = updateVoices;
		}

		return () => {
			if (window.speechSynthesis) {
				window.speechSynthesis.onvoiceschanged = null;
			}
		};
	}, []);

	// Озвучивание новых сообщений от ИИ
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
	}, [messages, ttsEnabled, ttsSupported, speakText]);

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			stopListening(true); // Применяем abort для мгновенного освобождения микрофона
			stopSpeaking();
		};
	}, [stopListening, stopSpeaking]);

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
