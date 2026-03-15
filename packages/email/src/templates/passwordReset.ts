export function buildPasswordResetHtml(resetUrl: string) {
	return `
		<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
			<h1 style="font-size: 20px; margin-bottom: 16px;">Сброс пароля</h1>
			<p style="margin-bottom: 16px;">
				Мы получили запрос на восстановление пароля для вашего аккаунта Interview Master AI.
			</p>
			<p style="margin-bottom: 24px;">
				Нажмите на кнопку ниже, чтобы задать новый пароль.
			</p>
			<a
				href="${resetUrl}"
				style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600;"
			>
				Сбросить пароль
			</a>
			<p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
				Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.
			</p>
		</div>
	`;
}

export function buildPasswordResetText(resetUrl: string) {
	return [
		"Сброс пароля Interview Master AI",
		"",
		"Мы получили запрос на восстановление пароля.",
		`Чтобы задать новый пароль, откройте ссылку: ${resetUrl}`,
		"",
		"Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.",
	].join("\n");
}
