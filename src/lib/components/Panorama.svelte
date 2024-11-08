<script lang="ts">
	import { globalData, host, pano } from "$lib/core";
	import { streetView } from "$lib/googlemaps";
	import { chooseLocation } from "$lib/utils";

	let panoContainer: HTMLDivElement;

	export let blurred: boolean, interactable: boolean;

	$: if ($pano) {
		$pano.setPosition($globalData.actual);
	}

	export async function resetPanorama() {
		if ($host) {
			// Fetch closest panorama location
			const loc = (await (new $streetView.StreetViewService()).getPanorama({
				location: chooseLocation(),
				radius: 3e6,
				sources: [$streetView.StreetViewSource.OUTDOOR],
				preference: google.maps.StreetViewPreference.NEAREST,
			})).data.location?.latLng!;
			$globalData.actual = { lat: loc.lat(), lng: loc.lng() };
		}

		// Initialise panorama
		if (!$pano) {
			$pano = new google.maps.StreetViewPanorama(
				panoContainer,
				{
					position: $globalData.actual,
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
			$pano.setPosition($globalData.actual);
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
