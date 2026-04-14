type SignUpValues = {
	name: string;
	email: string;
	password: string;
};

function getErrorSource(error: unknown): { code?: string; message?: string } {
	if (typeof error === "string") {
		return { message: error };
	}

	if (!error || typeof error !== "object") {
		return {};
	}

	const record = error as {
		code?: unknown;
		message?: unknown;
		error?: unknown;
	};

	if (
		record.error &&
		typeof record.error === "object" &&
		!Array.isArray(record.error)
	) {
		const nested = getErrorSource(record.error);
		if (nested.code || nested.message) {
			return nested;
		}
	}

	return {
		code: typeof record.code === "string" ? record.code : undefined,
		message: typeof record.message === "string" ? record.message : undefined,
	};
}

function normalizeErrorMessage(error: unknown) {
	return getErrorSource(error).message?.toLowerCase() ?? "";
}

export function getAuthErrorMessage(
	error: unknown,
	fallback = "Не удалось выполнить действие. Попробуйте еще раз.",
) {
	const { code } = getErrorSource(error);
	const normalizedCode = code?.toUpperCase() ?? "";
	const message = normalizeErrorMessage(error);

	if (
		normalizedCode === "USER_ALREADY_EXISTS" ||
		normalizedCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
	) {
		return "Пользователь с таким email уже существует.";
	}

	if (normalizedCode === "INVALID_EMAIL") {
		return "Введите корректный email.";
	}

	if (normalizedCode === "INVALID_PASSWORD") {
		return "Неверный пароль.";
	}

	if (normalizedCode === "INVALID_EMAIL_OR_PASSWORD") {
		return "Неверный email или пароль.";
	}

	if (normalizedCode === "PASSWORD_TOO_SHORT") {
		return "Пароль должен содержать минимум 8 символов.";
	}

	if (normalizedCode === "PASSWORD_TOO_LONG") {
		return "Пароль слишком длинный.";
	}

	if (normalizedCode === "MISSING_FIELD" || normalizedCode === "VALIDATION_ERROR") {
		return "Заполните все обязательные поля.";
	}

	if (normalizedCode === "FAILED_TO_CREATE_USER") {
		return "Не удалось создать аккаунт.";
	}

	if (message.includes("already exists")) {
		return "Пользователь с таким email уже существует.";
	}

	if (message.includes("invalid email or password")) {
		return "Неверный email или пароль.";
	}

	if (message.includes("invalid email")) {
		return "Введите корректный email.";
	}

	if (message.includes("invalid password")) {
		return "Неверный пароль.";
	}

	if (message.includes("password too short")) {
		return "Пароль должен содержать минимум 8 символов.";
	}

	if (message.includes("password too long")) {
		return "Пароль слишком длинный.";
	}

	if (message.includes("field is required")) {
		return "Заполните все обязательные поля.";
	}

	if (message.includes("failed to create user")) {
		return "Не удалось создать аккаунт.";
	}

	return fallback;
}

export function validateSignUpValues(values: SignUpValues) {
	const name = values.name.trim();
	const email = values.email.trim();
	const password = values.password;

	if (!name) {
		return "Введите имя.";
	}

	if (!email) {
		return "Введите email.";
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Введите корректный email.";
	}

	if (!password) {
		return "Введите пароль.";
	}

	if (password.length < 8) {
		return "Пароль должен содержать минимум 8 символов.";
	}

	return null;
}
