<script lang="ts">
	import { allMarkers, allPolylines, GameState, globalData, map, playerData } from "$lib/core";
	import { maps } from "$lib/googlemaps";
	import { putMarker } from "$lib/utils";

	let guessMarker: google.maps.marker.AdvancedMarkerElement;
	let mapContainer: HTMLDivElement;

	export let hidden: boolean;

	export function resetMap() {
		// Reset map elements
		$allMarkers.forEach((marker) => {
			marker.map = null;
			marker.remove();
		});
		$allMarkers = [];
		$allPolylines.forEach((polyline) => polyline.setMap(null));
		$allPolylines = [];

		// Initialise map
		if (!$map) {
			$map = new $maps.Map(mapContainer, {
				mapId: "DEMO_MAP_ID",
				fullscreenControl: false,
			});
		}
		$map.setCenter({ lat: 0, lng: 0 });
		$map.setZoom(0.6);

		// Guess marker placement
		$map.addListener("click", (e: google.maps.MapMouseEvent) => {
			if ($globalData.state != GameState.PLAY || $playerData.hasGuessed) return;
			$playerData.guess = { lat: e.latLng!.lat(), lng: e.latLng!.lng() };
			if (guessMarker) guessMarker.map = null;
			guessMarker = putMarker(e.latLng!, "guess", "hsl(0, 100%, 63%)");
			$allMarkers.push(guessMarker);
		});
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
	{#if $globalData.state == GameState.PLAY && $playerData.guess && !$playerData.hasGuessed}
		<button
			class="absolute bottom-0 p-2 w-full font-semibold text-md text-white bg-green-500 rounded-b-md z-20"
			on:click={() => $playerData.hasGuessed = true}
		>
			Guess
		</button>
	{/if}
</div>
