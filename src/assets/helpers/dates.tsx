export function formatDateSmart(createdAt) {
	const date = new Date(createdAt);
	const now = new Date();

	const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

	const yesterday = new Date();
	yesterday.setDate(now.getDate() - 1);
	const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

	const time = date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	if (isToday) {
		return `Today at ${time}`;
	} else if (isYesterday) {
		return `Yesterday at ${time}`;
	} else {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}
}
