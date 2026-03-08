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
	isUserAdmin: boolean;
	isUserExpert: boolean;
};

export default async function UserMenu({
	isUserAdmin,
	isUserExpert,
}: UserMenuProps) {
	const head = await headers();
	const data = await auth.api.getSession({
		headers: head,
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{data?.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{data?.user.email}</DropdownMenuItem>
					<Link href={{ pathname: "/profile/my" }} passHref>
						<DropdownMenuItem>Мой профиль</DropdownMenuItem>
					</Link>
					{isUserAdmin && (
						<Link href={{ pathname: "/admin" }} passHref>
							<DropdownMenuItem>Главное меню админа</DropdownMenuItem>
						</Link>
					)}
					{isUserExpert && (
						<Link href={{ pathname: "/expert" }} passHref>
							<DropdownMenuItem>Главное меню эксперта</DropdownMenuItem>
						</Link>
					)}
					<LogoutButton />
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
