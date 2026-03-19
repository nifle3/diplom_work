import { serverTrpc } from "@/lib/trpcServer";
import { EditProfileForm } from "./_components/editProfileForm";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const user = await trpcCaller.profile.getMyProfile();

	return (
		<div className="mx-auto w-full max-w-md space-y-10 py-10">
			<div className="text-center">
				<h1 className="font-bold text-2xl tracking-tight">
					Редактирование профиля
				</h1>
				<p className="mt-2 text-muted-foreground">
					Измените email, пароль или фотографию
				</p>
			</div>
			<EditProfileForm
				initialEmail={user.email}
				initialAvatarUrl={user.image}
			/>
		</div>
	);
}
