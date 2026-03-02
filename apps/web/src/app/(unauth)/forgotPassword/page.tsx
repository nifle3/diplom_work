import Link from "next/link";

export default function ForgotPasswordPage() {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<div className="mx-auto mt-16 max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
				<h1 className="mb-4 font-semibold text-2xl">Восстановление пароля</h1>

				<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
					<div>
						<label className="mb-1 block text-sm">Email</label>
						<input
							className="w-full rounded-md border px-3 py-2"
							type="email"
						/>
					</div>

					<div className="flex items-center justify-between">
						<button className="rounded-md bg-yellow-600 px-4 py-2 text-white">
							Отправить инструкцию
						</button>
					</div>
				</form>

				<p className="mt-6 text-center text-sm">
					Вернулись в{" "}
					<Link href={{pathname: "/signIn"}} className="text-blue-600 hover:underline">
						Войти
					</Link>
				</p>
			</div>
		</div>
	);
}
