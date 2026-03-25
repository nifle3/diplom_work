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
	username: string;
	email: string;
};

export default async function UserMenu({
	role,
	username,
	email,
}: Readonly<UserMenuProps>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">{username}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
					<DropdownMenuLabel>{email}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<Link href={{ pathname: "/profile/my" }} passHref>
						<DropdownMenuItem>Мой профиль</DropdownMenuItem>
					</Link>
					{role === "admin" ? (
						<Link href={{ pathname: "/admin" }} passHref>
							<DropdownMenuItem>Главное меню админа</DropdownMenuItem>
						</Link>
					) : (
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
