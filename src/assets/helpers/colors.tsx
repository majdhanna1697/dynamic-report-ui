export function stringToColor(str: string, opacity?: number, fallback = "#CCCCCC"): string {
	if (!str) return fallback;

	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}

	let hex = (hash & 0x00ffffff).toString(16).toUpperCase();
	hex = "000000".substring(0, 6 - hex.length) + hex;

	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	if (typeof opacity === "number") {
		const clampedOpacity = Math.max(0, Math.min(opacity, 1));
		return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
	}

	return `#${hex}`;
}

export function getContrastColor(bgColor: string): "black" | "white" {
	if (bgColor.startsWith("#")) {
		bgColor = bgColor.slice(1);
	}

	if (bgColor.length === 3) {
		bgColor = bgColor
			.split("")
			.map((c) => c + c)
			.join("");
	}

	const r = parseInt(bgColor.slice(0, 2), 16);
	const g = parseInt(bgColor.slice(2, 4), 16);
	const b = parseInt(bgColor.slice(4, 6), 16);

	const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

	return brightness > 186 ? "black" : "white";
}
