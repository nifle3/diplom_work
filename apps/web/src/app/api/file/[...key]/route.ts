import { getPersistentLink } from "@diplom_work/file";
import { NextResponse } from "next/server";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ key: string[] }> },
) {
	const { key } = await params;

	if (!key.length) {
		return NextResponse.json({ message: "File not found" }, { status: 404 });
	}

	return NextResponse.redirect(await getPersistentLink(key.join("/")));
}
