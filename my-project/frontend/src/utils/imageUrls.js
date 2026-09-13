export function resolveImageUrl(imageValue, apiBaseUrl = "") {
	if (!imageValue) {
		return null;
	}

	try {
		const imageUrl = new URL(imageValue, window.location.origin);
		const apiOrigin = apiBaseUrl
			? new URL(apiBaseUrl, window.location.origin).origin
			: null;

		if (apiOrigin && imageUrl.pathname.startsWith("/storage/")) {
			return `${apiOrigin}${imageUrl.pathname}${imageUrl.search}${imageUrl.hash}`;
		}

		return imageUrl.toString();
	} catch {
		return imageValue;
	}
}
