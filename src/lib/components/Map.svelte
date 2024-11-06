<script lang="ts">
	import { allMarkers, allPolylines, GameState, globalData, map, maps, playerData } from "$lib/core";
	import { putMarker, putPolyline } from "$lib/utils";

	let guessMarker: google.maps.marker.AdvancedMarkerElement;
	let mapContainer: HTMLDivElement;

	export let hidden: boolean;

	export function resetMap() {
		$allMarkers.forEach((marker) => {
			marker.map = null;
			marker.remove();
		});
		$allMarkers = [];
		$allPolylines.forEach((polyline) => polyline.setMap(null));
		$allPolylines = [];
		$playerData.guessed = null;
		$globalData.state = GameState.PLAY;

		// Initialise map
		if (!$map) {
			$map = new $maps.Map(mapContainer, {
				mapId: "DEMO_MAP_ID",
				fullscreenControl: false,
			});
		}
		$map.setCenter({ lat: 0, lng: 0 });
		$map.setZoom(0.6);
		$map.addListener("click", (e: google.maps.MapMouseEvent) => {
			if ($globalData.state != GameState.PLAY) return;
			$playerData.guessed = e.latLng!;
			if (guessMarker) guessMarker.map = null;
			guessMarker = putMarker(e.latLng!, "guess", "hsl(0, 100%, 63%)");
			$allMarkers.push(guessMarker);
		});
	}

	export function guess() {
		$allMarkers.push(putMarker($globalData.actual, "actual", "hsl(0, 100%, 63%)"));
		if ($playerData.guessed) $allPolylines.push(putPolyline($globalData.actual, $playerData.guessed, "hsl(0, 100%, 63%)"));

		let bounds = new google.maps.LatLngBounds();
		$allMarkers.forEach((marker) => bounds.extend(marker.position!));
		if ($playerData.guessed) $map.setZoom(Infinity);
		$map.fitBounds(bounds);
		if (!$playerData.guessed) $map.setZoom(5);

		$globalData.state = GameState.RESULTS;
	}

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
	class={$globalData.state == GameState.PLAY ? playMapClasses : resultsMapClasses}
	class:hidden
	style="width: calc(100% - 2rem)"
	bind:this={mapContainer}
>
	{#if $globalData.state == GameState.PLAY && guessMarker && guessMarker.map}
		<button
			class="absolute bottom-0 p-2 w-full font-semibold text-md text-white bg-green-500 rounded-b-md z-20"
			on:click={guess}
		>
			Guess
		</button>
	{/if}
</div>
