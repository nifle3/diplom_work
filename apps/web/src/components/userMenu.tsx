"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/authClient";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

type UserMenuProps = {
	isUserAdmin: boolean;
	isUserExpert: boolean;
}

export default function UserMenu({ isUserAdmin, isUserExpert } : UserMenuProps) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
				onError: (error) => {
					toast(error.error.message);
				}
			},
		});
	};

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{session!.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session!.user.email}</DropdownMenuItem>
					<DropdownMenuItem>Мой профиль</DropdownMenuItem>
					{isUserAdmin && 
						<DropdownMenuItem onClick={() => router.push("/admin/categories")}>
							Главное меню админа
						</DropdownMenuItem>
					}
					{isUserExpert && 
						<DropdownMenuItem onClick={() => router.push("/expert")}>
							Главное меню эксперта
						</DropdownMenuItem>
					}
					<DropdownMenuItem variant="destructive" onClick={onLogout}>
						Выйти из аккаунта
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
