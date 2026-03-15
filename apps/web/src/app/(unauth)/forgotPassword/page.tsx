import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./_components/forgotPasswordForm";

export const metadata: Metadata = {
	title: "Восстановление пароля",
};

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
				<h1 className="mb-2 font-semibold text-2xl">Восстановление пароля</h1>
				<p className="mb-6 text-muted-foreground text-sm">
					Введите email, и мы отправим ссылку для сброса пароля.
				</p>
				<ForgotPasswordForm />
				<p className="mt-6 text-center text-sm">
					Вернуться к{" "}
					<Link
						href={{ pathname: "/signIn" }}
						className="text-blue-600 hover:underline"
					>
						входу
					</Link>
				</p>
			</div>
		</div>
	);
}
