import type { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAssetUrl } from "@/lib/assetUrl";
import { serverTrpc } from "@/lib/trpcServer";
import { ProfileSettingsDialogs } from "./_components/profileSettingsDialogs";

export const metadata: Metadata = {
	title: "Мой профиль",
};

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const user = await trpcCaller.profile.getMyProfile();
	const avatarSrc = getAssetUrl(user.image);

	return (
		<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl dark:from-violet-700 dark:to-indigo-800">
			<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
			<div className="relative z-10 flex flex-col gap-6">
				<div className="flex flex-col items-center gap-4 sm:flex-row">
					<div className="relative">
						<Avatar className="h-28 w-28 border-4 border-white/20 shadow-lg">
							<AvatarImage src={avatarSrc} alt={user.name} />
							<AvatarFallback className="bg-white/20 font-bold text-3xl text-white backdrop-blur-sm">
								{user.name[0]?.toUpperCase() ?? "?"}
							</AvatarFallback>
						</Avatar>
						<div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-bold text-amber-900 text-sm shadow-lg">
							{user.xp}
						</div>
					</div>
					<div className="text-center sm:text-left">
						<h1 className="font-bold text-3xl tracking-tight">{user.name}</h1>
						<p className="mt-1 text-white/80">{user.email}</p>
					</div>
				</div>
				<ProfileSettingsDialogs
					email={user.email}
					image={user.image}
					name={user.name}
				/>
			</div>
		</div>
	);
}
