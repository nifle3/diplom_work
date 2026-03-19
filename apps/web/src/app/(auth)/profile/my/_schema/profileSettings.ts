import { z } from "zod";

export const avatarFileSchema = z
	.custom<File>((value) => value instanceof File, "Выберите файл")
	.refine(
		(file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
		{ message: "Только jpg, png, webp" },
	)
	.refine((file) => file.size <= 4 * 1024 * 1024, {
		message: "Файл не больше 4 МБ",
	});

export const changeEmailSchema = z.object({
	email: z.string().email("Некорректный email"),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(8, "Минимум 8 символов"),
		newPassword: z.string().min(8, "Минимум 8 символов"),
		confirmPassword: z.string().min(8, "Минимум 8 символов"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Пароли не совпадают",
		path: ["confirmPassword"],
	});
