import Link from "next/link";
import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { ScriptCard } from "@/components/scriptCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getAssetUrl } from "@/lib/assetUrl";
import { serverTrpc } from "@/lib/trpcServer";

type PageProps = {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		categoryId?: string;
	}>;
};

export default async function Page({ params, searchParams }: PageProps) {
	const [{ id }, { categoryId }] = await Promise.all([params, searchParams]);
	const parsedCategoryId = categoryId
		? Number.parseInt(categoryId, 10)
		: undefined;
	const selectedCategoryId = Number.isNaN(parsedCategoryId)
		? undefined
		: parsedCategoryId;

	const trpcCaller = await serverTrpc();

	let profile: Awaited<ReturnType<typeof trpcCaller.script.getExpertProfile>>;

	try {
		profile = await trpcCaller.script.getExpertProfile({
			expertId: id,
			categoryId: selectedCategoryId,
		});
	} catch (error) {
		if (error instanceof TRPCError && error.code === "NOT_FOUND") {
			notFound();
		}

		throw error;
	}

	const avatarSrc = getAssetUrl(profile.expert.image);
	const selectedCategory = profile.categories.find(
		(category) => category.id === selectedCategoryId,
	);
	const totalCourses = profile.categories.reduce(
		(sum, category) => sum + category.count,
		0,
	);

	return (
		<div className="space-y-8">
			<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 p-8 text-white shadow-xl">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_28%)]" />
				<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
						<Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
							<AvatarImage src={avatarSrc} alt={profile.expert.name} />
							<AvatarFallback className="bg-white/15 font-bold text-3xl text-white">
								{profile.expert.name[0]?.toUpperCase() ?? "?"}
							</AvatarFallback>
						</Avatar>

						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-white/70">
								Эксперт
							</p>
							<h1 className="mt-2 font-bold text-3xl tracking-tight sm:text-4xl">
								{profile.expert.name}
							</h1>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Card className="border-white/15 bg-white/10 p-5 text-white shadow-none backdrop-blur-sm">
							<p className="text-sm text-white/70">Всего курсов</p>
							<p className="mt-2 font-semibold text-3xl">{totalCourses}</p>
						</Card>

						<Card className="border-white/15 bg-white/10 p-5 text-white shadow-none backdrop-blur-sm">
							<p className="text-sm text-white/70">Категорий</p>
							<p className="mt-2 font-semibold text-3xl">
								{profile.categories.length}
							</p>
						</Card>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="font-semibold text-2xl">Курсы эксперта</h2>
						<p className="text-muted-foreground text-sm">
							Выберите категорию, чтобы отфильтровать список.
						</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-3">
					<Link
						href={`/profile/expert/${id}`}
						className={`rounded-full border px-4 py-2 text-sm transition-colors ${
							!selectedCategoryId
								? "border-sky-600 bg-sky-600 text-white"
								: "border-border bg-background hover:border-sky-600 hover:text-sky-700"
						}`}
					>
						Все категории
					</Link>

					{profile.categories.map((category) => {
						const isActive = category.id === selectedCategoryId;

						return (
							<Link
								href={`/profile/expert/${id}?categoryId=${category.id}`}
								key={category.id}
								className={`rounded-full border px-4 py-2 text-sm transition-colors ${
									isActive
										? "border-sky-600 bg-sky-600 text-white"
										: "border-border bg-background hover:border-sky-600 hover:text-sky-700"
								}`}
							>
								{category.name} ({category.count})
							</Link>
						);
					})}
				</div>
			</section>

			<section>
				{profile.courses.length === 0 ? (
					<Card className="rounded-3xl border-dashed p-12 text-center">
						<h3 className="font-semibold text-xl">Курсы не найдены</h3>
						<p className="mt-2 text-muted-foreground">
							{selectedCategory
								? "В этой категории у эксперта пока нет опубликованных курсов."
								: "У этого эксперта пока нет опубликованных курсов."}
						</p>
					</Card>
				) : (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{profile.courses.map((course) => (
							<ScriptCard key={course.id} script={course} />
						))}
					</div>
				)}
			</section>
		</div>
	);
}
