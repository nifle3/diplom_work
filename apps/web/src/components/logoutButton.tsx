"use client";

import { toast } from "sonner";

import { authClient } from "@/lib/authClient";
import { getAuthErrorMessage } from "@/lib/authMessages";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function LogoutButton() {
	const onLogout = () => {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/";
				},
				onError: (error) => {
					toast.error(getAuthErrorMessage(error, "Не удалось выйти из аккаунта."));
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
