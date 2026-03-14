import crypto from "node:crypto";
import path from "node:path";

export function generateFileKey(
	originalName: string,
	folder = "uploads",
): string {
	const ext = path.extname(originalName);
	return `${folder}/${crypto.randomUUID()}${ext}`;
}
