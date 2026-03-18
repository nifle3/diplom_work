import { z } from "zod";

export const profileFormSchema = z
	.object({
		email: z.email("Некорректный email"),
		password: z.string().optional(),
		confirmPassword: z.string().optional(),
		avatar: z
			.custom<File>((v) => v instanceof File, "Выберите файл")
			.optional()
			.refine(
				(file) => {
					if (!file) return true;
					return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
				},
				{ message: "Только jpg, png, webp" },
			)
			.refine(
				(file) => {
					if (!file) return true;
					return file.size <= 4 * 1024 * 1024; // 4MB
				},
				{ message: "Файл не больше 4 МБ" },
			),
	})
	.refine(
		(data) => {
			if (!data.password && !data.confirmPassword) return true;
			return data.password === data.confirmPassword;
		},
		{
			message: "Пароли не совпадают",
			path: ["confirmPassword"],
		},
	);

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
