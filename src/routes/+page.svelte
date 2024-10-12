<script lang="ts">
	import { game, GameState, importLibraries, settings } from "$lib/core";

	import Map from "$lib/components/Map.svelte";
	import Panorama from "$lib/components/Panorama.svelte";
	import ResultsView from "$lib/components/ResultsView.svelte";
	import Timer from "$lib/components/Timer.svelte";

	import { onMount } from "svelte";

	let mapComponent: Map, panoComponent: Panorama, timerComponent: Timer;
	async function reset() {
		mapComponent.resetMap();
		await panoComponent.resetPanorama();
		timerComponent.reset();
	}

	let settingsOpen = false;

	onMount(async () => {
		await importLibraries();
		await reset();

		setTimeout(() => {
			// Un-invert colours and dismiss warning when API key is invalid or exhausted
			const canvas = document.querySelector(".mapsConsumerUiSceneCoreScene__canvas") as HTMLCanvasElement;
			if (canvas && canvas.style.filter == "invert(1)") {
				(document.querySelector(".mapsConsumerUiSceneCoreScene__root")! as HTMLDivElement).style.filter = "invert(1)";
				(document.evaluate(
					"//div[text() = 'For development purposes only']",
					document,
					null,
					XPathResult.ANY_TYPE,
					null,
				).iterateNext()! as HTMLDivElement).style.display = "none";
				(document.querySelectorAll(".dismissButton")! as NodeListOf<HTMLButtonElement>).forEach((element) =>
					element.click()
				);
			}
		}, 500);
	});
</script>

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
