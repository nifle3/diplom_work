type AuthErrorLike = {
	code?: string;
	message?: string;
};

type SignUpValues = {
	name: string;
	email: string;
	password: string;
};

function normalizeErrorMessage(error: AuthErrorLike | string | null | undefined) {
	if (typeof error === "string") {
		return error.toLowerCase();
	}

	return error?.message?.toLowerCase() ?? "";
}

export function getAuthErrorMessage(
	error: AuthErrorLike | string | null | undefined,
	fallback = "Не удалось выполнить действие. Попробуйте еще раз.",
) {
	const code = typeof error === "string" ? "" : error?.code?.toUpperCase() ?? "";
	const message = normalizeErrorMessage(error);

	if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
		return "Пользователь с таким email уже существует.";
	}

	if (code === "INVALID_EMAIL") {
		return "Введите корректный email.";
	}

	if (code === "INVALID_PASSWORD") {
		return "Неверный пароль.";
	}

	if (code === "INVALID_EMAIL_OR_PASSWORD") {
		return "Неверный email или пароль.";
	}

	if (code === "PASSWORD_TOO_SHORT") {
		return "Пароль должен содержать минимум 8 символов.";
	}

	if (code === "PASSWORD_TOO_LONG") {
		return "Пароль слишком длинный.";
	}

	if (code === "MISSING_FIELD" || code === "VALIDATION_ERROR") {
		return "Заполните все обязательные поля.";
	}

	if (code === "FAILED_TO_CREATE_USER") {
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
