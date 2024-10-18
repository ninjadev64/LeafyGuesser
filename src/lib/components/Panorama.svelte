<script lang="ts">
	import { game, pano, streetView } from "$lib/core";
	import { chooseLocation } from "$lib/utils";

	let panoContainer: HTMLDivElement;

	export let blurred: boolean, interactable: boolean;

	export async function resetPanorama() {
		// Fetch closest panorama location
		$game.actual = (await (new $streetView.StreetViewService()).getPanorama({
			location: chooseLocation(),
			radius: 3e6,
			sources: [$streetView.StreetViewSource.OUTDOOR],
			preference: google.maps.StreetViewPreference.NEAREST,
		})).data.location?.latLng!;

		// Initialise panorama
		if (!$pano) {
			$pano = new google.maps.StreetViewPanorama(
				panoContainer,
				{
					position: $game.actual,
					addressControl: false,
					panControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					zoomControlOptions: {
						position: google.maps.ControlPosition.LEFT_CENTER,
					},
					motionTracking: false,
					motionTrackingControl: false,
					fullscreenControl: false,
				},
			);
		} else {
			$pano.setPosition($game.actual);
		}
		$pano.setPov($pano.getPhotographerPov());

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
	}
</script>

<div
	bind:this={panoContainer}
	class="h-screen"
	class:blur-lg={blurred}
	class:pointer-events-none={blurred || !interactable}
/>
