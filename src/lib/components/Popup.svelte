<script lang="ts">
	export let show = false;
</script>

{#if show}
	<div
		class="absolute top-0 left-0 m-16 p-4 w-[calc(100%-8rem)] h-[calc(100%-8rem)] bg-neutral-800 border-2 border-neutral-700 rounded-lg overflow-scroll z-30"
	>
		<slot />
	</div>
{/if}
