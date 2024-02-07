<script>
	import { fade, scale, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Glow from '$lib/Glow.svelte';
	import Orbit from '$lib/Orbit.svelte';

	let mounted = false;
	let decorate = false;

	onMount(() => {
		mounted = true;

		window.setTimeout(() => (decorate = true), 2000);
	});
</script>

<svelte:head>
	<title>Seth Toles</title>
	<meta name="description" content="Seth Toles's personal website" />
</svelte:head>

{#if decorate}
	<Orbit />

	<Glow color="pink" />
	<Glow color="purple" />
	<Glow color="teal" />
{/if}

<section>
	{#if mounted}
		<h1 in:slide|global={{ delay: 600, duration: 600 }}>Seth Toles</h1>
		<div class="divider" in:scale|global={{ duration: 600 }} />
		<h2 in:slide|global={{ delay: 600, duration: 600 }}>Software Engineer</h2>

		<!-- <button in:fade|global={{ delay: 1000 }}>About</button> -->
		<!-- <button in:fade|global={{ delay: 1200 }}>Resume</button> -->
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
		border-radius: 2px;
		background-color: var(--color-text);
	}

	h2 {
		margin-top: 4px;
		text-transform: uppercase;
		font-weight: 200;
		font-size: 28px;
	}

	button {
		display: block;
		width: 100%;
		margin: 16px 0;
		backdrop-filter: blur(16px);
	}
</style>
