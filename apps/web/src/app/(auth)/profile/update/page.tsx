import { serverTrpc } from "@/lib/trpcServer";

export default async function Page() {
	const trpcCaller = await serverTrpc();
	const user = await trpcCaller.profile.getMyProfile();

	return null;
}
