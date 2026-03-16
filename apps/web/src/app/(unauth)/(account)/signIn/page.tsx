import type { Metadata } from "next";
import Link from "next/link";

import SignInForm from "./_components/signInForm";

export const metadata: Metadata = {
	title: "Войти в аккаунт",
};

export default function SignInPage() {
	return (
		<>
			<h1 className="mb-4 font-semibold text-2xl">Войти в аккаунт</h1>
			<SignInForm />
			<p className="mt-6 text-center text-sm">
				Нет аккаунта?
				<Link
					href={{ pathname: "/signUp" }}
					className="text-blue-600 hover:underline"
				>
					Зарегистрироваться
				</Link>
			</p>
		</>
	);
}
