<script lang="ts">
	import { getPoints } from "$lib/utils";

	import { onMount } from "svelte";
	import isSea from "$lib/is-sea";

	import Gear from "phosphor-svelte/lib/Gear";
	import Popup from "$lib/components/Popup.svelte";

	let maps: google.maps.MapsLibrary, streetView: google.maps.StreetViewLibrary, markers: google.maps.MarkerLibrary;
	async function importLibraries() {
		await import("$lib/googlemaps");
		maps = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
		streetView = await google.maps.importLibrary("streetView") as google.maps.StreetViewLibrary;
		markers = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
	}

	// Choose a random location on land
	function chooseLocation() {
		const location = {
			lat: Math.random() * 150 - 70,
			lng: Math.random() * 360 - 180,
		};
		if (isSea(location.lat, location.lng)) return chooseLocation();
		else return location;
	}

	let guessMarker: google.maps.marker.AdvancedMarkerElement, allMarkers: google.maps.marker.AdvancedMarkerElement[] = [], allPolylines: google.maps.Polyline[] = [];
	export function putMarker(position: google.maps.LatLng, type: "actual" | "guess" | "otherPlayer", colour: string): google.maps.marker.AdvancedMarkerElement {
		const span = document.createElement("span");
		span.style.fontFamily = "'Material Icons'";
		span.style.fontSize = "18px";
		span.innerHTML = type == "actual" ? "\ue153" : (type == "guess" ? "\ue837" : "\ue853");
		const marker = new google.maps.marker.AdvancedMarkerElement({
			position: position,
			map,
			content: new google.maps.marker.PinElement({
				glyph: span,
				glyphColor: "#ffffff",
				background: colour,
				borderColor: colour,
			}).element,
		});
		allMarkers.push(marker);
		return marker;
	}

	enum GameState {
		PLAY,
		RESULTS,
	}
	let gameState: GameState = GameState.PLAY;

	let map: google.maps.Map, pano: google.maps.StreetViewPanorama;
	let mapContainer: HTMLDivElement, panoContainer: HTMLDivElement;
	let actual: google.maps.LatLng, guessed: google.maps.LatLng;

	type Settings = {
		move: boolean;
		pan: boolean;
		zoom: boolean;
	};
	const settings: Settings = { move: true, pan: true, zoom: true };
	$: {
		if (!settings.pan) {
			settings.move = false;
			settings.zoom = false;
		}
		if (pano) {
			pano.setOptions({
				linksControl: settings.move,
				clickToGo: settings.move,
				panControl: settings.pan,
				zoomControl: settings.zoom,
				scrollwheel: settings.zoom,
				disableDoubleClickZoom: !settings.zoom,
			});
		}
	}
	let settingsOpen = false;

	async function reset() {
		allMarkers.forEach((marker) => {
			marker.map = null;
			marker.remove();
		});
		allMarkers = [];
		allPolylines.forEach((polyline) => polyline.setMap(null));
		allPolylines = [];
		gameState = GameState.PLAY;

		// Initialise map
		if (!map) map = new maps.Map(mapContainer, { mapId: "DEMO_MAP_ID", fullscreenControl: false });
		map.setCenter({ lat: 0, lng: 0 });
		map.setZoom(0.6);
		map.addListener("click", (e: google.maps.MapMouseEvent) => {
			if (gameState != GameState.PLAY) return;
			guessed = e.latLng!;
			if (guessMarker) guessMarker.map = null;
			guessMarker = putMarker(e.latLng!, "guess", "hsl(0, 100%, 63%)");
		});

		// Fetch closest panorama location
		actual = (await (new streetView.StreetViewService()).getPanorama({
			location: chooseLocation(),
			radius: 3e6,
			sources: [streetView.StreetViewSource.OUTDOOR],
			preference: google.maps.StreetViewPreference.NEAREST,
		})).data.location?.latLng!;

		// Initialise panorama
		if (!pano) {
			pano = new google.maps.StreetViewPanorama(
				panoContainer,
				{
					position: actual,
					addressControl: false,
					panControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					zoomControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					motionTracking: false,
					motionTrackingControl: false,
					fullscreenControl: false,
				},
			);
		} else {
			pano.setPosition(actual);
		}
		pano.setPov(pano.getPhotographerPov());
		map.setStreetView(pano);
	}

	function guess() {
		putMarker(actual, "actual", "hsl(0, 100%, 63%)");
		const polyline = new google.maps.Polyline({
			map,
			path: [guessed, actual],
			strokeColor: "hsl(0, 100%, 63%)",
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
		allPolylines.push(polyline);

		let bounds = new google.maps.LatLngBounds();
		allMarkers.forEach((marker) => bounds.extend(marker.position!));
		map.setZoom(Infinity);
		map.fitBounds(bounds);

		gameState = GameState.RESULTS;
	}

	onMount(async () => {
		await importLibraries();

		await reset();

		setTimeout(() => {
			// Un-invert colours and dismiss warning when API key is invalid or exhausted
			if ((document.querySelector(".mapsConsumerUiSceneCoreScene__canvas")! as HTMLCanvasElement).style.filter == "invert(1)") {
				(document.querySelector(".mapsConsumerUiSceneCoreScene__root")! as HTMLDivElement).style.filter = "invert(1)";
				(document.querySelector(".dismissButton")! as HTMLButtonElement).click();
			}
		}, 500);
	});

	const playMapClasses = "flex-col absolute right-0 bottom-0 m-4 sm:m-6 " +
		"sm:!w-[20rem] h-[12rem] " +
		"sm:hover:!w-[40rem] hover:h-[18rem] sm:hover:!h-[24rem] " +
		"transition-all duration-200 " +
		"rounded-md z-20";

	const resultsMapClasses = "absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 " +
		"sm:!w-[48rem] h-[32rem] " +
		"transition-all duration-200 " +
		"rounded-md";
</script>

<div
	bind:this={panoContainer}
	class="h-screen"
	class:pointer-events-none={gameState == GameState.RESULTS || settingsOpen || !settings.pan}
	class:blur-lg={gameState == GameState.RESULTS || settingsOpen}
/>

<!-- deno-fmt-ignore -->
<div
	class={gameState == GameState.PLAY ? playMapClasses : resultsMapClasses}
	class:hidden={settingsOpen}
	style="width: calc(100% - 2rem); # couldn't get calc working in tailwind (w-[...])"
	bind:this={mapContainer}
>
	{#if gameState == GameState.PLAY && guessMarker && guessMarker.map}
		<button
			class="absolute bottom-0 p-2 w-full font-semibold text-md text-white bg-green-500 rounded-b-md z-20"
			on:click={guess}
		>
			Guess
		</button>
	{:else if gameState == GameState.RESULTS}
		<button
			class="absolute bottom-0 p-2 w-full font-semibold text-md text-white bg-green-500 rounded-b-md z-20"
			on:click={reset}
		>
			Continue
		</button>
	{/if}
</div>

{#if gameState == GameState.RESULTS}
	<span
		class="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 font-extrabold text-4xl text-white z-20"
		style="top: calc(45% + 20rem)"
	>
		{
			getPoints(
				{ lat: guessed.lat(), lng: guessed.lng() },
				{ lat: actual.lat(), lng: actual.lng() },
			)
		}
		points
	</span>
{/if}

<button
	class="absolute left-2 top-2 w-10 h-10 hidden justify-center items-center font-bold text-xl text-white bg-neutral-700 rounded-full z-30"
	class:!flex={gameState == GameState.RESULTS}
	on:click={() => settingsOpen = !settingsOpen}
>
	<Gear />
</button>

<Popup show={settingsOpen}>
	<div class="flex flex-row items-center m-2 space-x-2" class:opacity-50={!settings.pan}>
		<span class="dark:text-neutral-400"> Move: </span>
		<input type="checkbox" bind:checked={settings.move} />
	</div>
	<div class="flex flex-row items-center m-2 space-x-2">
		<span class="dark:text-neutral-400"> Pan: </span>
		<input type="checkbox" bind:checked={settings.pan} />
	</div>
	<div class="flex flex-row items-center m-2 space-x-2" class:opacity-50={!settings.pan}>
		<span class="dark:text-neutral-400"> Zoom: </span>
		<input type="checkbox" bind:checked={settings.zoom} />
	</div>
</Popup>
