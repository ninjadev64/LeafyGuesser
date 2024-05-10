<script lang="ts">
	import { getDistanceFromLatLngInKm, isMobile, random } from "$lib/utils";
	import isSea from "is-sea";
	import { onMount } from "svelte";

	let panoramaElement: HTMLDivElement;
	let mapElement: HTMLDivElement;

	// The correct coordinates of the generated location.
	let actual: { lat: number, lng: number } = { lat: 0, lng: 0 };
	// The coordinates guessed by the user.
	let guessed: { lat: number, lng: number } | null = null;

	function createPanorama(maps: any) {
		let lat = random(-90, 90);
		let lon = random(-180, 180);
		while (!isMobile() && isSea(lat, lon)) {
			lat = random(-90, 90);
			lon = random(-180, 180);
		}

		maps.Map.getClosestPanorama(
			new maps.LocationRect(new maps.Location(lat, lon), 10, 10),
			(panoramaInfo: any) => {
				actual = { lat: panoramaInfo.la, lng: panoramaInfo.lo };
				new maps.Map(panoramaElement, {
					mapTypeId: maps.MapTypeId.streetside,
					zoom: 18,
					streetsideOptions: {
						panoramaInfo,
						showCurrentAddress: false,
						showHeadingCompass: false,
						showExitButton: false,
						overviewMapMode: maps.OverviewMapMode.hidden
					}
				});
			},
			() => createPanorama(maps)
		);
	}

	let map: import("leaflet").Map;
	let marker: import("leaflet").Marker | null = null;
	async function createMap(interactive: boolean) {
		const leaflet = await import("leaflet");
		map = leaflet.map(mapElement).setView([ 0, 0 ], 1);
		marker = null;

		leaflet.tileLayer(
			"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
			{
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}
		)
		.addTo(map);

		if (interactive) {
			const resizeObserver = new ResizeObserver(() => map.invalidateSize());
			resizeObserver.observe(mapElement);

			map.on("click", (e) => {
				if (e.originalEvent.target != mapElement) return;
				if (isSea(e.latlng.lat, e.latlng.lng)) return;
				if (marker) marker.setLatLng(e.latlng);
				else marker = leaflet.marker(e.latlng).addTo(map);
			});
		}

		mapElement.style.display = "flex";
	}

	async function load() {
		guessed = null;

		// @ts-expect-error
		let maps = Microsoft.Maps;
		createPanorama(maps);

		createMap(true);
	}

	onMount(() => {
		if (document.readyState == "loading") {
			document.addEventListener("DOMContentLoaded", load);
		} else {
			load();
		}
	});

	async function guess() {
		guessed = marker!.getLatLng();
		await createMap(false);
		const leaflet = await import("leaflet");
		let icon = leaflet.icon({
			iconUrl: "/flag.png",
			iconSize: [ 36, 36 ]
		});
		leaflet.marker(guessed).addTo(map);
		leaflet.marker(actual, { icon }).addTo(map);
		leaflet.polyline([ guessed, actual ], { color: "#666a66", dashArray: "4 6" }).addTo(map);
	}

	function getPoints(km: number): number {
		// some magic I made
		return Math.floor(5000 * (Math.E ** (-km / 2250)));
	}
</script>

<svelte:head>
	<title> LeafyGuesser </title>
	<script src="https://www.bing.com/api/maps/mapcontrol?callback=GetMap&key=Anq5yPQTmPkdnG6LkbHm4e8azPHpUxXJvqKpzn7kVflejFUVttZTZt1bi_li4hJd" defer></script>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</svelte:head>

{#if !guessed}
	<div
		bind:this={panoramaElement}
		class="w-full h-screen"
	>
		<div class="flex flex-col h-screen justify-center items-center">
			<p class="font-bold text-2xl"> LeafyGuesser </p>
			<p class="text-xl"> Loading... </p>
		</div>
	</div>

	<div
		bind:this={mapElement}
		class="
			flex-col absolute right-0 bottom-0 m-4 sm:m-6 hidden
			sm:!w-[20rem] h-[12rem]
			sm:hover:!w-[40rem] hover:h-[18rem] sm:hover:!h-[24rem]
			transition-all duration-200
			rounded-md
		"
		style="width: calc(100% - 2rem); # couldn't get calc working in tailwind (w-[...])"
	>
		{#if marker}
			<button
				class="absolute bottom-0 z-[100000] p-2 w-full font-semibold text-md bg-green-200 rounded-b-md"
				on:click={guess}
			>
				Guess
			</button>
		{/if}
	</div>
{:else}
	<div class="flex flex-col justify-center items-center h-screen bg-gray-700">
		<h2 class="font-bold text-2xl text-gray-50"> Guessed! </h2>
		<p class="text-lg text-gray-50"> {Intl.NumberFormat().format(getDistanceFromLatLngInKm(guessed, actual))} km </p>
		<p class="text-lg text-gray-50"> {getPoints(getDistanceFromLatLngInKm(guessed, actual))} points </p>
		<div bind:this={mapElement} class="my-4 w-[40rem] h-[24rem] rounded-md" />
		<button class="px-4 py-2 text-gray-200 bg-green-600 rounded-md" on:click={load}> Play again </button>
	</div>
{/if}
