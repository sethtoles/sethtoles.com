<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { BACKGROUND_HSL } from './constants';
	import { getDistanceFromVelocity, random } from './utils';

	const TWO_PI = Math.PI * 2;
	const NUM_ORBITS = 2;
	const MAX_VELOCITY = 20;
	const MAX_DISTANCE = getDistanceFromVelocity(MAX_VELOCITY, MAX_VELOCITY);
	const NUM_STEPS = 1200;
	const LAST_STEP_INDEX = NUM_STEPS - 1;
	const SATURATION = 60;
	const LIGHTNESS = 45;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;

	let innerWidth: number;
	let innerHeight: number;
	let animationFrame: number;
	let iteration = 1;

	const orbits = new Array(NUM_ORBITS).fill(null).map((_) => {
		return {
			hue: random(20, 40),
			attraction: random(0.0005, 0.001),
			useGlobalAttractor: true,
			steps: new Array(NUM_STEPS).fill(null).map(() => ({ x: 0, y: 0, width: 0 })),
			velocity: { x: 0, y: 0 },
		};
	});

	const globalAttractor = { x: 0, y: 0 };
	function updateGlobalAttractorPosition() {
		const centerOffsetX = innerWidth / 2;
		const centerOffsetY = innerHeight / 2;
		const phaseX = (iteration / innerWidth) % 1;
		const phaseY = (iteration / innerHeight) % 1;

		globalAttractor.x =
			Math.sin(phaseX * TWO_PI) * random(0.8, 1.2) * centerOffsetX + centerOffsetX;
		globalAttractor.y =
			Math.cos(phaseY * TWO_PI) * random(0.8, 1.2) * centerOffsetY + centerOffsetY;
	}

	function draw() {
		if (!ctx) return;

		// Update attractor position
		updateGlobalAttractorPosition();

		ctx.clearRect(0, 0, innerWidth, innerHeight);
		ctx.lineCap = 'round';

		// Draw orbits
		for (let i = 0; i < NUM_STEPS; i++) {
			for (let j = 0; j < NUM_ORBITS; j++) {
				const { hue, steps } = orbits[j];
				const previousStep = steps[i - 1];
				if (!previousStep) continue;

				const step = steps[i];
				const progress = expoOut(i / NUM_STEPS);
				const remaining = 1 - progress;
				ctx.strokeStyle = `hsl(${hue}, ${SATURATION * progress + BACKGROUND_HSL[1] * remaining}%, ${
					LIGHTNESS * progress + BACKGROUND_HSL[2] * remaining
				}%)`;
				ctx.lineWidth = step.width;

				ctx.beginPath();
				ctx.moveTo(previousStep.x, previousStep.y);
				ctx.lineTo(step.x, step.y);
				ctx.stroke();
			}
		}

		// Update latest step
		for (let i = 0; i < orbits.length; i++) {
			const { useGlobalAttractor, attraction, velocity, steps } = orbits[i];
			const attractor = useGlobalAttractor ? globalAttractor : orbits[i - 1].steps[LAST_STEP_INDEX];
			const lastStep = steps[LAST_STEP_INDEX];

			// Update velocity based on attractor
			const velocityX = velocity.x + (attractor.x - lastStep.x) * attraction;
			const velocityY = velocity.y + (attractor.y - lastStep.y) * attraction;
			const desiredDistance = getDistanceFromVelocity(velocityX, velocityY);
			const differenceFactor = desiredDistance / MAX_DISTANCE;

			if (differenceFactor > 1) {
				velocity.x = velocityX / differenceFactor;
				velocity.y = velocityY / differenceFactor;
			} else {
				velocity.x = velocityX;
				velocity.y = velocityY;
			}

			const scaledDistance = getDistanceFromVelocity(velocity.x, velocity.y);
			const width =
				random(0.9, 1.15) * Math.min(1 / (scaledDistance / MAX_DISTANCE), 10) * (innerWidth / 700);

			const stepToUpdate = steps.shift();
			if (!stepToUpdate) return;
			stepToUpdate.x = lastStep.x + velocity.x;
			stepToUpdate.y = lastStep.y + velocity.y;
			stepToUpdate.width = width;
			steps.push(stepToUpdate);
		}

		// Iterate
		iteration++;
		animationFrame = requestAnimationFrame(draw);
	}

	onMount(async () => {
		// Store canvas contexts
		ctx = canvas.getContext('2d');

		updateGlobalAttractorPosition();

		orbits.forEach((orbit, i) => {
			const xVariance = innerWidth / 6;
			const initialPosition = {
				x: random(globalAttractor.x - xVariance, globalAttractor.x + xVariance),
				y: innerHeight + 10,
			};
			orbit.velocity.y = -(MAX_VELOCITY / 4);

			orbit.steps.forEach((step) => {
				step.x = initialPosition.x;
				step.y = initialPosition.y;
			});

			// Every other orbit should follow the previous orbit
			if (i % 2 === 1) {
				orbit.useGlobalAttractor = false;
				orbit.attraction = orbit.attraction * 4;
			}
		});

		draw();
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<canvas bind:this={canvas} width={innerWidth} height={innerHeight} />

<style>
	canvas {
		position: fixed;
		width: 100vw;
		height: 100vh;
		z-index: -1;
	}
</style>
