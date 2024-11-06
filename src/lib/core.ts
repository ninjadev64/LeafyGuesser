import { get, writable, type Writable } from "svelte/store";

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

export type Settings = {
	move: boolean;
	pan: boolean;
	zoom: boolean;
	timer: number;
};
export enum GameState {
	SETUP,
	PLAY,
	RESULTS,
}
export type GlobalData = {
	settings: Settings;
	state: GameState;
	actual: google.maps.LatLng;
};
export let globalData: Writable<GlobalData> = writable({
	state: GameState.SETUP,
	actual: null!,
	settings: {
		move: true,
		pan: true,
		zoom: true,
		timer: 120,
	},
});

globalData.subscribe(({ settings }) => {
	if (!settings.pan) {
		settings.move = false;
		settings.zoom = false;
	}
	if (get(pano)) {
		get(pano).setOptions({
			linksControl: settings.move,
			clickToGo: settings.move,
			panControl: settings.pan,
			zoomControl: settings.zoom,
			scrollwheel: settings.zoom,
			disableDoubleClickZoom: !settings.zoom,
		});
	}
});

export type PlayerData = {
	guessed: google.maps.LatLng | null;
};
export let playerData: Writable<PlayerData> = writable({ guessed: null });
