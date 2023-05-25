<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';
	import { get } from 'svelte/store';

	const NUM_CANVASES = 5;
	const SWITCH_TIME_MS = 5000;
	const NUM_ORBITS = 5;

	const PHASE_X_MS = 2000;
	const PHASE_Y_MS = 900;

	let canvases: HTMLCanvasElement[] = [];
	let ctxs: (CanvasRenderingContext2D | null)[] = new Array(NUM_CANVASES).fill(null);
	let ctxOrder = ctxs.map((_, i) => ctxs.length - i);
	let activeCtxIndex = -1;
	let ctx: CanvasRenderingContext2D | null;

	let innerWidth: number;
	let innerHeight: number;
	let iteration = 1;

	const orbits = new Array(NUM_ORBITS)
		.fill(null)
		.map(() => spring({ x: 0, y: 0 }, { stiffness: Math.random() * 0.001, damping: 0 }));
	const prevPositions = orbits.map(() => ({ x: 0, y: 0 }));

	let centerX = 0;
	let centerY = 0;

	let animationFrame: number;
	let switchTimeout: number;

	function getX() {
		return (
			(Math.sin(((iteration % PHASE_X_MS) / PHASE_X_MS) * 2 * Math.PI) * innerWidth) / 2 +
			innerWidth / 2
		);
	}

	function getY() {
		return (
			(Math.cos(((iteration % PHASE_Y_MS) / PHASE_Y_MS) * 2 * Math.PI) * innerHeight) / 2 +
			innerHeight / 2
		);
	}

	function switchContext() {
		const last = ctxOrder.pop() as number;
		ctxOrder.unshift(last);
		ctxOrder = ctxOrder;

		activeCtxIndex = (activeCtxIndex + 1) % ctxs.length;
		ctx = ctxs[activeCtxIndex];
		ctx?.clearRect(0, 0, innerWidth, innerHeight);

		switchTimeout = window.setTimeout(switchContext, SWITCH_TIME_MS);
	}

	function draw() {
		if (!ctx) return;

		if (iteration++ % 10 === 0) {
			ctx.fillStyle = 'rgba(22, 25, 38, 0.025)';
			ctx.fillRect(0, 0, innerWidth, innerHeight);
		}

		ctx.strokeStyle = 'rgba(234, 181, 39, 0.5)';

		centerX = getX();
		centerY = getY();

		orbits.forEach((orbit, i) => {
			orbit.set({ x: centerX, y: centerY });

			const { x, y } = get(orbit);
			const { x: prevX, y: prevY } = prevPositions[i];

			if (ctx) {
				const dist = Math.max(0.5, Math.sqrt(Math.pow(prevY - y, 2) + Math.pow(prevX - x, 2)));
				const width = (1 / dist) * 15 + 1;

				ctx.lineWidth = width;
				ctx.beginPath();
				ctx.moveTo(prevX, prevY);
				ctx.lineTo(x, y);
				ctx.stroke();
			}

			prevPositions[i] = { x, y };
		});

		animationFrame = requestAnimationFrame(draw);
	}

	onMount(async () => {
		ctxs = canvases.map((canvasEl) => canvasEl.getContext('2d'));

		orbits.forEach((orbit, i) => {
			const x = getX() + Math.random() * (innerWidth / 2) - innerWidth / 2;
			const y = getY() + Math.random() * 15 + 15;

			prevPositions[i] = { x, y };
			orbit.set({ x, y }, { hard: true });
		});

		switchContext();
		draw();
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
		if (switchTimeout) clearTimeout(switchTimeout);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#each ctxs as _, i}
	<canvas
		bind:this={canvases[i]}
		width={innerWidth}
		height={innerHeight}
		style:opacity={activeCtxIndex === i ? 1 : 0}
		style:z-index={-ctxOrder[i]}
		style:transition-duration={activeCtxIndex === i ? '0s' : `${NUM_CANVASES * SWITCH_TIME_MS}ms`}
	/>
{/each}

<!-- <div style:left="{centerX}px" style:top="{centerY}px" /> -->

<style>
	canvas {
		position: fixed;
		width: 100vw;
		height: 100vh;
		transition-property: opacity;
		transition-timing-function: cubic-bezier(0.7, 0, 0.84, 0);
	}

	div {
		position: fixed;
		width: 10px;
		height: 10px;
		background-color: red;
	}
</style>
