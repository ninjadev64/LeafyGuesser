import { get, type Writable, writable } from "svelte/store";

export const maps: Writable<google.maps.MapsLibrary> = writable(),
	streetView: Writable<google.maps.StreetViewLibrary> = writable(),
	markers: Writable<google.maps.MarkerLibrary> = writable();

export async function importLibraries() {
	await import("./googlemaps.js");
	maps.set(await google.maps.importLibrary("maps") as google.maps.MapsLibrary);
	streetView.set(await google.maps.importLibrary("streetView") as google.maps.StreetViewLibrary);
	markers.set(await google.maps.importLibrary("marker") as google.maps.MarkerLibrary);
}

export const allMarkers: Writable<google.maps.marker.AdvancedMarkerElement[]> = writable([]),
	allPolylines: Writable<google.maps.Polyline[]> = writable([]);

export let map: Writable<google.maps.Map> = writable(),
	pano: Writable<google.maps.StreetViewPanorama> = writable();

export enum GameState {
	PLAY,
	RESULTS,
}
export type Game = {
	state: GameState;
	actual: google.maps.LatLng;
	guessed: google.maps.LatLng;
};
export let game: Writable<Game> = writable({ state: GameState.PLAY, actual: null!, guessed: null! });

export type Settings = {
	move: boolean;
	pan: boolean;
	zoom: boolean;
};
export const settings: Writable<Settings> = writable({
	move: true,
	pan: true,
	zoom: true,
});
settings.subscribe((value) => {
	if (!value.pan) {
		value.move = false;
		value.zoom = false;
	}
	if (get(pano)) {
		get(pano).setOptions({
			linksControl: value.move,
			clickToGo: value.move,
			panControl: value.pan,
			zoomControl: value.zoom,
			scrollwheel: value.zoom,
			disableDoubleClickZoom: !value.zoom,
		});
	}
});
