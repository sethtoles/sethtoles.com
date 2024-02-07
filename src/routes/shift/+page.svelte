<script lang="ts">
	import { onMount } from 'svelte';

	let fullText = '';
	let offset = 0;
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	$: shiftedText = fullText
		.split('')
		.map((letter) => {
			const index = (letters.indexOf(letter.toUpperCase()) + offset) % 26;
			return letters[index];
		})
		.join('');

	const handleFullTextChange = () => {
		fullText = fullText.toUpperCase();
	};

	const clear = () => {
		fullText = '';
		offset = 0;
	};

	onMount(() => {
		document.addEventListener('keyup', ({ code }) => {
			if (code === 'ArrowRight') offset++;
			else if (code === 'ArrowLeft') offset--;
		});
	});
</script>

<span class="input-area">
	<input bind:value={fullText} spellcheck="false" on:change={handleFullTextChange} />
</span>

<p class="content">
	{shiftedText}
</p>

<button on:click={clear}>Clear</button>

<style>
	:global(body) {
		font-family: monospace;
		text-transform: uppercase;
		font-size: 20px;
		margin: 20px;
	}

	.input-area {
		position: relative;
	}

	p,
	textarea {
		text-align: center;
		width: 800px;
		margin: 20px 0;
		box-sizing: border-box;
		padding: 16px;
	}

	.content {
		min-height: 200px;
		border-radius: 8px;
		background-color: rgba(255, 255, 255, 0.04);
		letter-spacing: 1px;
	}

	.pointer {
		cursor: pointer;
	}

	.letter {
		border-radius: 4px;
	}

	.selected {
		background-color: rgba(217, 154, 239, 0.4);
	}

	.letter.active {
		box-shadow: inset rgb(214, 189, 255) 0 -2px 1px 0;
	}

	.dimmed {
		opacity: 0.4;
	}

	.hidden {
		opacity: 0;
	}

	.selected.dimmed {
		opacity: 0.6;
	}

	.alphabet {
		display: flex;
	}

	.letter-info {
		text-align: center;
	}

	.original {
		padding: 0 2px;
	}

	.replacement {
		border-top: 1px solid white;
		opacity: 0.6;
		font-size: smaller;
	}

	button {
		font: inherit;
		margin-top: 32px;
		border: none;
		padding: 4px 48px;
		border-radius: 24px;
		background-color: rgb(71, 71, 124);
		transition: background-color 0.2s linear;
	}

	button:hover:not(:disabled) {
		background-color: rgb(87, 87, 153);
	}

	button:disabled {
		cursor: initial;
		opacity: 0.4;
	}

	/* https://loading.io/css/ */
	.lds-dual-ring:after {
		content: ' ';
		display: block;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 5px solid;
		border-color: rgba(255, 255, 255, 0.4) transparent rgba(255, 255, 255, 0.4) transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
