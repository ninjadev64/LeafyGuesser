<script lang="ts">
	import { GameState, globalData, host, playerData, reset } from "$lib/core";
	import { getPoints } from "$lib/utils";

	import Popup from "$lib/components/Popup.svelte";
	import Gear from "phosphor-svelte/lib/Gear";

	export let settingsOpen: boolean;
</script>

{#if !settingsOpen}
	<div
		class="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
		style="top: calc(45% + 20rem)"
	>
		{#if $host}
			<button
				class="p-2 sm:!w-[48rem] font-semibold text-md text-white bg-green-500 rounded-md"
				style="width: calc(100vw - 2rem)"
				on:click={reset}
			>
				Continue
			</button>
		{/if}

		<span class="-mt-4 font-extrabold text-4xl text-white" class:!mt-8={$host}>
			{
				getPoints(
					{ lat: $globalData.actual.lat, lng: $globalData.actual.lng },
					$playerData.guess ? { lat: $playerData.guess.lat, lng: $playerData.guess.lng } : null,
				)
			}
			points
		</span>
	</div>
{/if}

<button
	class="absolute left-2 top-2 w-10 h-10 hidden justify-center items-center font-bold text-xl text-white bg-neutral-700 rounded-full z-30"
	class:!flex={$globalData.state == GameState.RESULTS}
	on:click={() => settingsOpen = !settingsOpen}
>
	<Gear />
</button>

<Popup show={settingsOpen}>
	<span class="text-neutral-400">Sure is empty in here.</span>
</Popup>
