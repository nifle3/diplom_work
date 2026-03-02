"use client";

import { Award, LayoutGrid, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{
		title: "Категории",
		href: "/admin/categories",
		icon: LayoutGrid,
	},
	{
		title: "Эксперты",
		href: "/admin/experts",
		icon: Users,
	},
	{
		title: "Достижения",
		href: "/admin/achievements",
		icon: Award,
	},
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className="w-64 shrink-0 border-l bg-card">
			<div className="flex h-full flex-col">
				<div className="border-b p-4">
					<h2 className="font-semibold text-lg">Админ-панель</h2>
				</div>
				<nav className="flex-1 space-y-1 p-2">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href || pathname.startsWith(item.href + "/");
						return (
							<Link
								key={item.href}
								href={item.href as any}
								className={cn(
									"flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors",
									isActive
										? "bg-primary text-primary-foreground"
										: "hover:bg-muted hover:text-foreground",
								)}
							>
								<item.icon className="size-4" />
								{item.title}
							</Link>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}
