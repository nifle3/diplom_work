"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/authClient";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function LogoutButton() {
	const router = useRouter();

	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				},
				onError: (error) => {
					toast(error.error.message);
				},
			},
		});
	};

	return (
		<DropdownMenuItem variant="destructive" onClick={onLogout}>
			Выйти из аккаунта
		</DropdownMenuItem>
	);
}
