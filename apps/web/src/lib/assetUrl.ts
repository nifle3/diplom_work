export function getAssetUrl(value?: string | null) {
	if (!value) {
		return undefined;
	}

	if (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("blob:") ||
		value.startsWith("/")
	) {
		return value;
	}

	return `/api/file/${value}`;
}
