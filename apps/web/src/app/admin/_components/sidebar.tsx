import { Award, Flag, LayoutGrid, Users } from "lucide-react";
import Link from "next/link";

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
	{
		title: "Жалобы",
		href: "/admin/reports",
		icon: Flag,
	},
];

export function AdminSidebar() {
	return (
		<aside className="sticky top-0 h-[calc(100vh-5rem)] w-64 shrink-0 border-r bg-card">
			<div className="flex h-full flex-col overflow-y-auto">
				<div className="border-b p-4">
					<h2 className="font-semibold text-lg">Админ-панель</h2>
				</div>
				<nav className="flex-1 space-y-1 p-2">
					{navItems.map((item) => {
						return (
							<Link
								key={item.href}
								href={{ pathname: item.href }}
								className={
									"flex items-center gap-3 rounded-none px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground"
								}
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
