export function random(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

function deg2rad(deg: number) {
	return deg * (Math.PI / 180);
}

export function getDistanceFromLatLngInKm(
	{ lat: lat1, lng: lng1 }: { lat: number; lng: number },
	{ lat: lat2, lng: lng2 }: { lat: number; lng: number },
) {
	// Use the Haversine formula to calculate the distance between two coordinates.
	let a = (Math.sin(deg2rad(lat2 - lat1) / 2) ** 2) +
		(Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2))) *
			(Math.sin(deg2rad(lng2 - lng1) / 2) ** 2);
	let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	let d = 6371 /* radius of the Earth */ * c;
	return d;
}

export function getPoints(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }) {
	return Math.floor(5000 * (Math.E ** (-getDistanceFromLatLngInKm(loc1, loc2) / 2000)));
}
