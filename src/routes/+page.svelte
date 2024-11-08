<script lang="ts">
	import { componentReset, GameState, globalData } from "$lib/core";
	import { importLibraries } from "$lib/googlemaps";
	import * as multiplayer from "$lib/multiplayer";

	import Map from "$lib/components/Map.svelte";
	import Panorama from "$lib/components/Panorama.svelte";
	import ResultsView from "$lib/components/ResultsView.svelte";
	import SetupView from "$lib/components/SetupView.svelte";
	import Timer from "$lib/components/Timer.svelte";

	import { onMount } from "svelte";

	let mapComponent: Map, panoComponent: Panorama, timerComponent: Timer;
	$componentReset = async () => {
		mapComponent.resetMap();
		await panoComponent.resetPanorama();
		timerComponent.reset();
	};

	let settingsOpen = false;

	onMount(async () => {
		await importLibraries();
		multiplayer.init();
	});
</script>

{#if $globalData.state == GameState.SETUP}
	<SetupView />
{/if}

<Panorama
	bind:this={panoComponent}
	blurred={$globalData.state != GameState.PLAY || settingsOpen}
	interactable={$globalData.settings.pan}
/>

<Map bind:this={mapComponent} hidden={settingsOpen} />

<Timer
	bind:this={timerComponent}
	hidden={$globalData.state != GameState.PLAY}
	guess={() => {
		if (mapComponent) mapComponent.guess();
	}}
/>

{#if $globalData.state == GameState.RESULTS}
	<ResultsView bind:settingsOpen />
{/if}
