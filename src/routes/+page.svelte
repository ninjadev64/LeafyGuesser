<script lang="ts">
	import { game, GameState, importLibraries, settings } from "$lib/core";

	import Map from "$lib/components/Map.svelte";
	import Panorama from "$lib/components/Panorama.svelte";
	import ResultsView from "$lib/components/ResultsView.svelte";
	import SetupView from "$lib/components/SetupView.svelte";
	import Timer from "$lib/components/Timer.svelte";

	import { onMount } from "svelte";

	let mapComponent: Map, panoComponent: Panorama, timerComponent: Timer;
	async function reset() {
		mapComponent.resetMap();
		await panoComponent.resetPanorama();
		timerComponent.reset();
	}

	let settingsOpen = false;

	onMount(async () => await importLibraries());
</script>

{#if $game.state == GameState.SETUP}
	<SetupView {reset} />
{/if}

<Panorama
	bind:this={panoComponent}
	blurred={$game.state != GameState.PLAY || settingsOpen}
	interactable={$settings.pan}
/>

<Map bind:this={mapComponent} hidden={settingsOpen} />

<Timer
	bind:this={timerComponent}
	hidden={$game.state != GameState.PLAY}
	guess={() => {
		if (mapComponent) mapComponent.guess();
	}}
/>

{#if $game.state == GameState.RESULTS}
	<ResultsView {reset} bind:settingsOpen />
{/if}
