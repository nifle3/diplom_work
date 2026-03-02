import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { serverTrpc } from "@/lib/trpcServer";
import NewSessionButton from "./_components/newSessionButton";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id }= await params;
	const trpcCaller = await serverTrpc();
	const data = await trpcCaller.script.getInfo(id);

	return (
		<div className="flex justify-center p-8">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<CardTitle className="text-2xl">{data.title}</CardTitle>
					<CardDescription className="text-base">
						{data.category?.name}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">{data.description}</p>
				</CardContent>
				<CardFooter className="flex flex-col items-start gap-4">
					<div className="flex flex-col gap-1 text-muted-foreground text-xs">
						<span>
							Создано: {data.draftOverAt?.toLocaleDateString("ru-RU")}
						</span>
						<span>Автор: {data.expert?.name ?? "Неизвестно"}</span>
					</div>
					<div className="flex w-full gap-3">
						<NewSessionButton scriptId={id}/>
						<Link
							href={{ pathname: `/script/${id}/myHistory` }}
							className="flex-1"
						>
							<Button variant="outline" className="w-full">
								История
							</Button>
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
