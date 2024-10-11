<script lang="ts">
	import { game, GameState, settings } from "$lib/core";
	import { getPoints } from "$lib/utils";

	import Popup from "$lib/components/Popup.svelte";
	import Gear from "phosphor-svelte/lib/Gear";

	export let reset: () => void;
	export let settingsOpen: boolean;
</script>

<div
	class="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
	style="top: calc(45% + 20rem)"
>
	<button
		class="p-2 w-[48rem] font-semibold text-md text-white bg-green-500 rounded-md"
		on:click={reset}
	>
		Continue
	</button>

	<span class="mt-8 font-extrabold text-4xl text-white">
		{
			getPoints(
				{ lat: $game.guessed.lat(), lng: $game.guessed.lng() },
				{ lat: $game.actual.lat(), lng: $game.actual.lng() },
			)
		}
		points
	</span>
</div>

<button
	class="absolute left-2 top-2 w-10 h-10 hidden justify-center items-center font-bold text-xl text-white bg-neutral-700 rounded-full z-30"
	class:!flex={$game.state == GameState.RESULTS}
	on:click={() => settingsOpen = !settingsOpen}
>
	<Gear />
</button>

<Popup show={settingsOpen}>
	<div
		class="flex flex-row items-center m-2 space-x-2"
		class:opacity-50={!$settings.pan}
	>
		<span class="dark:text-neutral-400"> Move: </span>
		<input type="checkbox" bind:checked={$settings.move} />
	</div>
	<div class="flex flex-row items-center m-2 space-x-2">
		<span class="dark:text-neutral-400"> Pan: </span>
		<input type="checkbox" bind:checked={$settings.pan} />
	</div>
	<div
		class="flex flex-row items-center m-2 space-x-2"
		class:opacity-50={!$settings.pan}
	>
		<span class="dark:text-neutral-400"> Zoom: </span>
		<input type="checkbox" bind:checked={$settings.zoom} />
	</div>
</Popup>
