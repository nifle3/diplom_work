import type { Metadata } from "next";
import Link from "next/link";

import SignUpForm from "./_components/signupForm";

export const metadata: Metadata = {
	title: "Создать аккаунт",
};

export default function SignUpPage() {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
				<h1 className="mb-4 font-semibold text-2xl">Создать аккаунт</h1>
				<SignUpForm />
				<p className="mt-6 text-center text-sm">
					Уже есть аккаунт?
					<Link href={{pathname: "/signIn"}} className="text-blue-600 hover:underline">
						Войти
					</Link>
				</p>
			</div>
		</div>
	);
}
