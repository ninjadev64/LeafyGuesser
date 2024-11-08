import { Game } from "./multiplayer.ts";
import { putMarker, putPolyline, stringToColour } from "./utils.ts";

import { get, type Writable, writable } from "svelte/store";

export const allMarkers: Writable<google.maps.marker.AdvancedMarkerElement[]> = writable([]),
	allPolylines: Writable<google.maps.Polyline[]> = writable([]);

export const map: Writable<google.maps.Map> = writable(),
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
	actual: google.maps.LatLngLiteral;
};
export const globalData: Writable<GlobalData> = writable({
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
	guess: google.maps.LatLngLiteral | null;
	hasGuessed: boolean;
};
export const playerData: Writable<PlayerData> = writable({ guess: null, hasGuessed: false });

export const componentReset: Writable<() => void> = writable();
export function reset() {
	playerData.update((v) => {
		v.guess = null;
		v.hasGuessed = false;
		return v;
	});
	globalData.update((v) => {
		v.state = GameState.PLAY;
		return v;
	});
	get(componentReset)();
}

export const game: Writable<Game> = writable();
export function initMultiplayer() {
	const g = get(game);
	if (get(host)) {
		g.updateGlobalData(get(globalData));
	} else {
		globalData.set(g.getGlobalData());
	}
	globalData.subscribe((value) => g.updateGlobalData(value));
	playerData.subscribe((value) => g.updatePlayerData(value));
	g.on("globalDataUpdated", (v) => {
		if (get(globalData).state != GameState.PLAY && v.state == GameState.PLAY) {
			reset();
		}
		globalData.set(v);
	});
	g.on("playerUpdated", () => {
		let allGuessed = true;
		for (const data of Object.values(g.getAllPlayerData())) {
			if (!data.hasGuessed) allGuessed = false;
		}

		if (allGuessed) {
			const actual = get(globalData).actual, guess = get(playerData).guess;
			const m = get(map), am = get(allMarkers), ap = get(allPolylines);
			if (Object.keys(g.getAllPlayerData()).length != 1) {
				for (const [username, data] of Object.entries(g.getAllPlayerData())) {
					if (data.guess) {
						am.push(
							putMarker(
								data.guess,
								username == g.localPlayerName ? "guess" : "otherPlayer",
								stringToColour(username),
							),
						);
						ap.push(putPolyline(actual, data.guess, stringToColour(username)));
					}
				}
			} else if (guess) {
				ap.push(putPolyline(actual, guess, "hsl(0, 100%, 63%)"));
			}
			am.push(putMarker(actual, "actual", "hsl(0, 100%, 63%)"));

			const bounds = new google.maps.LatLngBounds();
			am.forEach((marker) => bounds.extend(marker.position!));
			if (guess) m.setZoom(Infinity);
			m.fitBounds(bounds);
			if (am.length == 1) m.setZoom(10);

			globalData.update((v) => {
				v.state = GameState.RESULTS;
				return v;
			});
		}
	});
}

export const host: Writable<boolean> = writable(false);
