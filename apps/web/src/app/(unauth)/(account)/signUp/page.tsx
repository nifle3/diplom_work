import type { Metadata } from "next";
import Link from "next/link";

import SignUpForm from "./_components/signupForm";

export const metadata: Metadata = {
	title: "Создать аккаунт",
};

export default function SignUpPage() {
	return (
		<>
			<h1 className="mb-4 font-semibold text-2xl">Создать аккаунт</h1>
			<SignUpForm />
			<p className="mt-6 text-center text-sm">
				Уже есть аккаунт?
				<Link
					href={{ pathname: "/signIn" }}
					className="text-blue-600 hover:underline"
				>
					Войти
				</Link>
			</p>
		</>
	);
}
