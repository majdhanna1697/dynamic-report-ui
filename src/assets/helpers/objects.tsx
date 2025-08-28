export function sortJsonByKey(data: object, key: string, direction = "asc") {
	if (!Array.isArray(data)) {
		throw new Error("Input must be an array of objects");
	}

	const sorted = [...data].sort((a, b) => {
		const valA = a[key];
		const valB = b[key];

		if (valA < valB) return direction === "asc" ? -1 : 1;
		if (valA > valB) return direction === "asc" ? 1 : -1;
		return 0;
	});

	return sorted;
}
