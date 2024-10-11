import { map } from "./core";
import isSea from "./is-sea";

import { get } from "svelte/store";

export function random(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

// Choose a random location on land
export function chooseLocation() {
	const location = {
		lat: random(-80, 80),
		lng: random(-180, 180),
	};
	if (isSea(location.lat, location.lng)) return chooseLocation();
	else return location;
}

export function putMarker(
	position: google.maps.LatLng,
	type: "actual" | "guess" | "otherPlayer",
	colour: string,
): google.maps.marker.AdvancedMarkerElement {
	const span = document.createElement("span");
	span.style.fontFamily = "'Material Icons'";
	span.style.fontSize = "18px";
	span.innerHTML = type == "actual" ? "\ue153" : (type == "guess" ? "\ue837" : "\ue853");
	const marker = new google.maps.marker.AdvancedMarkerElement({
		position: position,
		map: get(map),
		content: new google.maps.marker.PinElement({
			glyph: span,
			glyphColor: "#ffffff",
			background: colour,
			borderColor: colour,
		}).element,
	});
	return marker;
}

export function putPolyline(
	from: google.maps.LatLng,
	to: google.maps.LatLng,
	strokeColour: string,
) {
	const polyline = new google.maps.Polyline({
		map: get(map),
		path: [from, to],
		strokeColor: strokeColour,
		strokeOpacity: 0,
		icons: [
			{
				icon: {
					path: "M 0,-1 0,1",
					strokeOpacity: 1,
					scale: 4,
				},
				offset: "10px",
				repeat: "20px",
			},
		],
	});
	return polyline;
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

export function getPoints(
	loc1: { lat: number; lng: number },
	loc2: { lat: number; lng: number },
) {
	return Math.floor(
		5000 * (Math.E ** (-getDistanceFromLatLngInKm(loc1, loc2) / 2000)),
	);
}
