<script lang="ts">
	import { globalData } from "$lib/core";
	import * as multiplayer from "$lib/multiplayer";

	export let reset: () => void;

	async function play() {
		// alert(await multiplayer.createGame());
		reset();
	}
</script>

<style>
	* {
		z-index: 20;
	}
</style>

<div class="flex flex-col w-screen h-screen justify-center items-center text-neutral-400 bg-neutral-700">
	<h2 class="font-bold text-2xl">Game Setup</h2>

	<div class="flex flex-row mt-4">
		<div
			class="flex flex-row items-center m-2 space-x-2"
			class:opacity-50={!$globalData.settings.pan}
		>
			<span class="text-neutral-400">Move:</span>
			<input type="checkbox" bind:checked={$globalData.settings.move} />
		</div>
		<div class="flex flex-row items-center m-2 space-x-2">
			<span class="text-neutral-400">Pan:</span>
			<input type="checkbox" bind:checked={$globalData.settings.pan} />
		</div>
		<div
			class="flex flex-row items-center m-2 space-x-2"
			class:opacity-50={!$globalData.settings.pan}
		>
			<span class="text-neutral-400">Zoom:</span>
			<input type="checkbox" bind:checked={$globalData.settings.zoom} />
		</div>
	</div>

	<span class="flex flex-row items-center m-2 mt-6 space-x-2 text-neutral-400">Timer: {$globalData.settings.timer}s</span>
	<div class="flex flex-row items-center m-2 space-x-2">
		<button class="w-6 h-6 text-neutral-300 bg-neutral-600 rounded-full" on:click={() => $globalData.settings.timer -= 1}>
			-
		</button>
		<input type="range" min="0" max="600" bind:value={$globalData.settings.timer} />
		<button class="w-6 h-6 text-neutral-300 bg-neutral-600 rounded-full" on:click={() => $globalData.settings.timer += 1}>
			+
		</button>
	</div>

	<button
		class="mt-6 px-4 py-2 font-semibold text-md text-white bg-green-500 rounded-md"
		on:click={play}
	>
		Play
	</button>
</div>
