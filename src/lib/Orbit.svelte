<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getDistanceFromVelocity, random } from './utils';

	const NUM_CANVASES = 25;
	const CANVAS_CYCLE_TIME_MS = 1000;
	const FADE_DURATION_MS = (NUM_CANVASES - 1) * CANVAS_CYCLE_TIME_MS;
	const NUM_ORBITS = 2;
	const MAX_VELOCITY = 20;
	const MAX_DISTANCE = getDistanceFromVelocity(MAX_VELOCITY, MAX_VELOCITY);

	const start = performance.now();
	let cycle = -1;

	let canvases: HTMLCanvasElement[] = [];
	let ctxs: (CanvasRenderingContext2D | null)[] = new Array(NUM_CANVASES).fill(null);
	let ctx: CanvasRenderingContext2D | null;

	let innerWidth: number;
	let innerHeight: number;
	let iteration = 1;

	let globalAttractor = { x: 0, y: 0 };

	const orbits = new Array(NUM_ORBITS).fill(null).map(() => {
		const hue = random(20);
		return {
			position: { x: 0, y: 0 },
			previousPosition: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
			attraction: random(0.0005, 0.001),
			color: `hsl(${hue + 20}, 60%, 45%)`,
			attractor: globalAttractor
		};
	});

	let animationFrame: number;

	function updateGlobalAttractorPosition() {
		globalAttractor.x =
			(Math.sin(((iteration / innerWidth) % 1) * 2 * Math.PI) * innerWidth) / 2 + innerWidth / 2;
		globalAttractor.y =
			(Math.cos(((iteration / innerHeight) % 1) * 2 * Math.PI) * innerHeight) / 2 + innerHeight / 2;
	}

	function draw(now: number) {
		if (!ctx) return;

		const elapsed = now - start;
		const newCycle = Math.floor(elapsed / CANVAS_CYCLE_TIME_MS) % NUM_CANVASES;

		if (newCycle !== cycle) {
			const newContext = ctxs[newCycle];

			if (newContext) {
				ctx = newContext;
				ctx.clearRect(0, 0, innerWidth, innerHeight);
			}
		}

		// Update attractor position
		updateGlobalAttractorPosition();

		// Draw orbits
		for (let i = 0; i < orbits.length; i++) {
			const { position, previousPosition, velocity, color, attractor, attraction } = orbits[i];
			const { x, y } = position;

			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.lineCap = newCycle === cycle ? 'round' : 'butt';

			// Start line at previous position
			ctx.moveTo(x, y);

			// Update velocity based on attractor
			const velocityX = velocity.x + (attractor.x - x) * attraction;
			const velocityY = velocity.y + (attractor.y - y) * attraction;
			const desiredDistance = getDistanceFromVelocity(velocityX, velocityY);
			const differenceFactor = desiredDistance / MAX_DISTANCE;

			if (differenceFactor > 1) {
				velocity.x = velocityX / differenceFactor;
				velocity.y = velocityY / differenceFactor;
			} else {
				velocity.x = velocityX;
				velocity.y = velocityY;
			}

			// Set line width based on velocity
			const scaledDistance = getDistanceFromVelocity(velocity.x, velocity.y);
			const width = Math.min(1 / (scaledDistance / MAX_DISTANCE), 10) * (innerWidth / 900);
			ctx.lineWidth = width;

			// Store previous position
			previousPosition.x = position.x;
			previousPosition.y = position.y;

			// Update position based on velocity
			position.x += velocity.x;
			position.y += velocity.y;

			// Draw line to new position
			ctx.lineTo(position.x, position.y);
			ctx.stroke();
		}

		// Iterate
		iteration++;
		cycle = newCycle;
		animationFrame = requestAnimationFrame(draw);
	}

	onMount(async () => {
		// Store canvas contexts
		ctxs = canvases.map((canvasEl) => canvasEl.getContext('2d'));
		ctx = ctxs[0];

		updateGlobalAttractorPosition();

		for (let i = 0; i < orbits.length; i++) {
			orbits[i].position.x = random(
				globalAttractor.x - innerWidth / 6,
				globalAttractor.x + innerWidth / 6
			);
			orbits[i].position.y = innerHeight + 10;
			orbits[i].velocity.y = -(MAX_VELOCITY / 4);

			orbits[i].previousPosition.x = orbits[i].position.x;
			orbits[i].previousPosition.y = orbits[i].position.y;

			if (i % 2 === 1) {
				orbits[i].attractor = orbits[i - 1].position;
				orbits[i].attraction = orbits[i].attraction * 4;
			}
		}

		draw(start);
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#each ctxs as _, i}
	<canvas
		bind:this={canvases[i]}
		width={innerWidth}
		height={innerHeight}
		style:opacity={cycle === i ? 1 : 0}
		style:transition-duration="{cycle === i ? 0 : FADE_DURATION_MS}ms"
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
