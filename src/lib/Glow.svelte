<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		random,
		getRandomScreenLocation,
		getDistanceFromPositions,
		getDistanceFromVelocity,
	} from './utils';

	export let color: 'pink' | 'purple' | 'teal';

	const MAX_DURATION_MS = 50000;

	let mounted = false;

	const offsetX = -1800 / 2;
	const offsetY = -1300 / 2;
	let coords = { x: offsetX, y: offsetY };
	let duration = 0;

	function setTarget() {
		const { innerWidth, innerHeight } = window;
		const newCoords = getRandomScreenLocation();
		newCoords.x += offsetX;
		newCoords.y += offsetY;
		const distance = getDistanceFromPositions(coords, newCoords);
		const maxDistance = getDistanceFromVelocity(innerWidth, innerHeight);

		coords = newCoords;
		duration = MAX_DURATION_MS * (distance / maxDistance);
	}

	onMount(() => {
		setTarget();

		mounted = true;
	});
</script>

{#if mounted}
	<div
		style:--color="var(--color-{color})"
		style:transform="translate({coords.x}px, {coords.y}px"
		style:transition-duration="{duration}ms"
		on:transitionend={setTarget}
		in:fade|global={{ duration: 6000, delay: random(1000, 10000) }}
	/>
{/if}

<style>
	div {
		position: fixed;
		z-index: -1;
		width: 1800px;
		height: 1300px;
		background-image: radial-gradient(
			closest-side,
			rgba(var(--color), 0.25),
			rgba(var(--color), 0)
		);
		transition-property: transform;
		transition-timing-function: ease-in-out;
	}
</style>
