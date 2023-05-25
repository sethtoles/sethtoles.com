<script>
	import { scale, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Glow from '$lib/Glow.svelte';
	import Orbit from '$lib/Orbit.svelte';

	let mounted = false;
	let showOrbit = false;

	onMount(() => {
		mounted = true;

		window.setTimeout(() => (showOrbit = true), 5000);
	});
</script>

<svelte:head>
	<title>Seth Toles</title>
	<meta name="description" content="Seth Toles's personal website" />
</svelte:head>

{#if showOrbit}
	<Orbit />
{/if}

<Glow color="pink" />
<Glow color="purple" />
<Glow color="teal" />

<section>
	{#if mounted}
		<h1 in:slide={{ delay: 600, duration: 600 }}>Seth Toles</h1>
		<div class="divider" in:scale={{ duration: 600 }} />
		<h2 in:slide={{ delay: 600, duration: 600 }}>Software Engineer</h2>
	{/if}
</section>

<style>
	section {
		text-align: center;
	}

	h1 {
		margin-bottom: 0;
	}

	.divider {
		width: 100%;
		height: 2px;
		background-color: var(--color-text);
	}

	h2 {
		margin-top: 4px;
		text-transform: uppercase;
		font-weight: 200;
		font-size: 28px;
	}
</style>
