import { InvalidLink } from "./_components/invalidLink";
import { ResetForm } from "./_components/resetForm";

type SearchParams = {
	token?: string;
	error?: string;
};

type PageProps = {
	searchParams: Promise<Readonly<SearchParams>>;
};

export default async function Page({ searchParams }: PageProps) {
	const { token, error } = await searchParams;

	if (error || !token) {
		return <InvalidLink />;
	}

	return (
		<>
			<h1 className="mb-2 font-semibold text-2xl">Сброс пароля</h1>
			<ResetForm token={token} />
		</>
	);
}
