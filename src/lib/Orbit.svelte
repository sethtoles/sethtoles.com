<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { random } from './utils';

	const NUM_CANVASES = 25;
	const CANVAS_CYCLE_TIME_MS = 1000;
	const FADE_DURATION_MS = (NUM_CANVASES - 1) * CANVAS_CYCLE_TIME_MS;

	const NUM_ORBITS = 2;
	const MAX_VELOCITY = 20;
	const MAX_DIST = Math.sqrt(Math.pow(MAX_VELOCITY, 2) + Math.pow(MAX_VELOCITY, 2));

	let canvases: HTMLCanvasElement[] = [];
	let ctxs: (CanvasRenderingContext2D | null)[] = new Array(NUM_CANVASES).fill(null);
	let activeCtxIndex = -1;
	let ctx: CanvasRenderingContext2D | null;

	let innerWidth: number;
	let innerHeight: number;
	let iteration = 1;

	let center = { x: 0, y: 0 };

	const orbits = new Array(NUM_ORBITS).fill(null).map(() => {
		const hue = random(20);
		return {
			position: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
			attraction: random(0.0005, 0.001),
			color: `hsl(${hue + 20}, 60%, 45%)`,
			attractor: center
		};
	});

	let animationFrame: number;
	let contextCycleTimeout: number;

	function updateCenter() {
		center.x =
			(Math.sin(((iteration / innerWidth) % 1) * 2 * Math.PI) * innerWidth) / 2 + innerWidth / 2;
		center.y =
			(Math.cos(((iteration / innerHeight) % 1) * 2 * Math.PI) * innerHeight) / 2 + innerHeight / 2;
	}

	function cycleContext() {
		activeCtxIndex = (activeCtxIndex + 1) % ctxs.length;
		ctx = ctxs[activeCtxIndex];
		ctx?.clearRect(0, 0, innerWidth, innerHeight);

		contextCycleTimeout = window.setTimeout(cycleContext, CANVAS_CYCLE_TIME_MS);
	}

	function draw() {
		if (!ctx) return;

		// Update attractor position
		updateCenter();

		// Draw orbits
		for (let i = 0; i < orbits.length; i++) {
			const { position, velocity, color, attractor, attraction } = orbits[i];
			const { x, y } = position;

			// Start line at previous position
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(x, y);

			// Update velocity based on attractor
			const velocityX = velocity.x + (attractor.x - x) * attraction;
			const velocityY = velocity.y + (attractor.y - y) * attraction;
			velocity.x = Math.min(Math.max(-MAX_VELOCITY, velocityX), MAX_VELOCITY);
			velocity.y = Math.min(Math.max(-MAX_VELOCITY, velocityY), MAX_VELOCITY);

			// Calculate line width based on velocity
			const dist = Math.sqrt(Math.pow(velocityX, 2) + Math.pow(velocityY, 2));
			const width = Math.min((1 / Math.min(dist / MAX_DIST, 1)) * 2, 10);
			ctx.lineWidth = width;

			// Update position based on velocity
			position.x += velocity.x;
			position.y += velocity.y;

			// Draw line to new position
			ctx.lineTo(position.x, position.y);
			ctx.stroke();
		}

		// Iterate
		iteration++;
		animationFrame = requestAnimationFrame(draw);
	}

	onMount(async () => {
		// Store canvas contexts
		ctxs = canvases.map((canvasEl) => canvasEl.getContext('2d'));

		updateCenter();

		for (let i = 0; i < orbits.length; i++) {
			orbits[i].position.x = random(center.x - innerWidth / 4, center.x + innerWidth / 4);
			orbits[i].position.y = innerHeight + random(innerHeight / 8);
			orbits[i].velocity.y = -(MAX_VELOCITY / 4);

			if (i % 2 === 1) {
				orbits[i].attractor = orbits[i - 1].position;
				orbits[i].attraction = orbits[i].attraction * 4;
			}
		}

		cycleContext();
		draw();
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
		if (contextCycleTimeout) clearTimeout(contextCycleTimeout);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#each ctxs as _, i}
	<canvas
		bind:this={canvases[i]}
		width={innerWidth}
		height={innerHeight}
		style:opacity={activeCtxIndex === i ? 1 : 0}
		style:transition-duration="{activeCtxIndex === i ? 0 : FADE_DURATION_MS}ms"
	/>
{/each}

<style>
	canvas {
		position: fixed;
		width: 100vw;
		height: 100vh;
		transition-property: opacity;
		z-index: -1;
	}
</style>
