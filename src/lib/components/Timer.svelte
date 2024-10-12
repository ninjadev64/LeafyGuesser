<script lang="ts">
	import { settings } from "$lib/core";

	export let hidden: boolean;
	export let guess: () => void;

	let display: HTMLDivElement;

	let interval: number;
	export function reset() {
		if (interval) clearInterval(interval);
		let start = Date.now();
		interval = setInterval(() => {
			let delta = Date.now() - start;
			let seconds = Math.round($settings.timer - (delta / 1000));
			if (seconds <= 0) {
				guess();
				clearInterval(interval);
			}
			if (display) {
				display.innerHTML = Math.floor(seconds / 60).toString().padStart(2, "0") + ":" +
					(seconds % 60).toFixed(0).padStart(2, "0");
			}
		}, 100);
	}
	reset();
</script>

<div
	class="absolute left-1/2 top-5 -translate-x-1/2 px-3 py-1 font-semibold text-lg text-neutral-300 bg-opacity-75 bg-neutral-700 border-4 border-purple-900 rounded-full z-20"
	class:hidden
	bind:this={display}
/>
