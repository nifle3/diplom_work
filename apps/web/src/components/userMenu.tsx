import { auth } from "@diplom_work/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "./logoutButton";
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

type UserMenuProps = {
	role: string;
};

export default async function UserMenu({
	role
}: UserMenuProps) {
	const head = await headers();
	const data = await auth.api.getSession({
		headers: head,
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">{data?.user.name}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
					<DropdownMenuLabel>{data?.user.email}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<Link href={{ pathname: "/profile/my" }} passHref>
						<DropdownMenuItem>Мой профиль</DropdownMenuItem>
					</Link>
					{role === "admin" ? (
						<Link href={{ pathname: "/admin" }} passHref>
							<DropdownMenuItem>Главное меню админа</DropdownMenuItem>
						</Link>
					)
					 : (
						<Link href={{ pathname: "/expert" }} passHref>
							<DropdownMenuItem>Главное меню эксперта</DropdownMenuItem>
						</Link>
					)}
					<DropdownMenuSeparator />
					<LogoutButton />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
