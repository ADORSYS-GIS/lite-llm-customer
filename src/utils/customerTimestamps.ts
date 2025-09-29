const CUSTOMER_TIMESTAMPS_KEY = "customer_creation_timestamps";

type CustomerTimestamps = Record<string, string>;

// Get all customer timestamps from local storage
export function getCustomerTimestamps(): CustomerTimestamps {
	if (typeof window === "undefined") return {};
	const timestamps = localStorage.getItem(CUSTOMER_TIMESTAMPS_KEY);
	return timestamps ? JSON.parse(timestamps) : {};
}

// Get a specific customer's creation timestamp
export function getCustomerTimestamp(userId: string): string | null {
	const timestamps = getCustomerTimestamps();
	return timestamps[userId] || null;
}

// Set a customer's creation timestamp
export function setCustomerTimestamp(
	userId: string,
	timestamp: string = new Date().toISOString(),
): void {
	if (typeof window === "undefined") return;

	const timestamps = getCustomerTimestamps();
	// Don't overwrite existing timestamps
	if (timestamps[userId]) return;

	timestamps[userId] = timestamp;
	localStorage.setItem(CUSTOMER_TIMESTAMPS_KEY, JSON.stringify(timestamps));
}

// Get formatted creation date for display
export function getFormattedCreationDate(userId: string): string {
	const timestamp = getCustomerTimestamp(userId);
	if (!timestamp) return "N/A";

	try {
		return new Date(timestamp).toLocaleDateString();
	} catch (_e) {
		console.error("Invalid date format for customer", userId, timestamp);
		return "N/A";
	}
}
