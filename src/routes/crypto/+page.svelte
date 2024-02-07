<script lang="ts">
	import { onMount } from 'svelte';
	import { createWorker } from 'tesseract.js';

	let isInputMode = true;
	let isProcessingImage = false;
	let fullText = '';
	let selectedIndex = -1;
	const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	let replacements: { [key: string]: string } = {};
	$: used = Object.values(replacements);
	$: clearDisabled = isInputMode ? !fullText : !used.length;

	const findNext = () => {
		if (selectedIndex < fullText.length - 1 && !letters.includes(fullText[++selectedIndex]))
			findNext();
	};

	const findPrevious = () => {
		if (selectedIndex > 0 && !letters.includes(fullText[--selectedIndex])) findPrevious();
	};

	const handleFile = async ({ target }: Event) => {
		const { files } = target as HTMLInputElement;

		if (files?.[0]) {
			try {
				isProcessingImage = true;
				const worker = await createWorker('eng');
				const result = await worker.recognize(files[0]);
				fullText = result.data.text;
				handleFullTextChange();
				await worker.terminate();
			} catch (error) {
				console.log(error);
			} finally {
				isProcessingImage = false;
			}
		}
	};

	const handleFullTextChange = () => {
		fullText = fullText.toUpperCase();
		localStorage.setItem('fullText', fullText);
	};

	const clear = () => {
		if (isInputMode) {
			fullText = '';
			handleFullTextChange();
		} else {
			replacements = {};
			localStorage.removeItem('replacements');
		}
	};

	onMount(() => {
		fullText = localStorage.getItem('fullText') || '';
		isInputMode = !fullText;
		const savedReplacements = localStorage.getItem('replacements');
		if (savedReplacements) {
			replacements = JSON.parse(savedReplacements);
		}

		document.addEventListener('keyup', ({ key, code }) => {
			if (isInputMode) return;

			if (code === 'ArrowRight') return findNext();
			if (code === 'ArrowLeft') return findPrevious();

			const selectedLetter = fullText[selectedIndex];
			if (!selectedLetter) return;

			if (code === 'Backspace') {
				if (replacements[selectedLetter]) {
					replacements[selectedLetter] = '';
				} else if (selectedIndex > 0) {
					findPrevious();
				}
				return;
			}

			const newValue = key.toUpperCase();
			if (!letters.includes(newValue) || used.includes(newValue) || newValue === selectedLetter)
				return;

			replacements[selectedLetter] = newValue;
			localStorage.setItem('replacements', JSON.stringify(replacements));
			if (selectedIndex < fullText.length - 1) {
				findNext();
			}
		});
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="toggle-container pointer">
	<div class={`toggle-indicator ${isInputMode && 'left'}`} />
	<div class={`toggle-text ${isInputMode && 'active'}`} on:click={() => (isInputMode = true)}>
		Edit
	</div>
	<div class={`toggle-text ${!isInputMode && 'active'}`} on:click={() => (isInputMode = false)}>
		Solve
	</div>
</div>

{#if isInputMode}
	<span class="input-area">
		<textarea bind:value={fullText} spellcheck="false" on:change={handleFullTextChange} />
		<label for="image-input" class={`image-input ${isProcessingImage && 'processing'}`}>
			{#if isProcessingImage}
				<div class="lds-dual-ring" />
			{:else}
				📷
			{/if}
		</label>
		<input
			id="image-input"
			type="file"
			accept=".bmp,.jpg,.png,.pbm,.webp"
			on:change={handleFile}
			disabled={isProcessingImage}
			hidden
		/>
	</span>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<p class="content" on:click={() => (selectedIndex = -1)}>
		{#each fullText.toUpperCase().split('') as letter, index}
			{#if letters.indexOf(letter) > -1}
				<span
					on:click|stopPropagation={() => (selectedIndex = index)}
					class={`letter pointer
						${!replacements[letter] && 'dimmed'}
						${letter === (fullText[selectedIndex] || '').toUpperCase() && 'selected'}
						${index === selectedIndex && 'active'}`}>{replacements[letter] || letter}</span
				>
			{:else if letter === '\n'}
				<br />
			{:else}
				{letter}
			{/if}
		{/each}
	</p>
{/if}

<div class={`alphabet ${isInputMode && 'hidden'}`}>
	{#each letters as letter}
		<div class="letter-info">
			<div class={`original ${used.includes(letter) && 'dimmed'}`}>{letter}</div>
			<div class="replacement">{replacements[letter] || ' '}</div>
		</div>
	{/each}
</div>

<button on:click={clear} disabled={clearDisabled}>Clear</button>

<style>
	:global(body) {
		font-family: monospace;
		text-transform: uppercase;
		font-size: 20px;
		margin: 20px;
	}

	.toggle-container {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 32px;
		border: 3px solid rgba(0, 0, 0, 0);
		border-radius: 18px;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.toggle-indicator {
		position: absolute;
		width: 50%;
		height: 100%;
		border-radius: inherit;
		background-color: rgb(71, 71, 124);
		left: 50%;
		transition: left 0.2s ease-in-out;
	}

	.toggle-indicator.left {
		left: 0;
	}

	.toggle-text {
		opacity: 0.4;
		padding: 0 35px;
		z-index: 1;
		transition: opacity 0.2s ease-in-out;
	}

	.toggle-text.active {
		opacity: 1;
	}

	.input-area {
		position: relative;
	}

	.image-input {
		position: absolute;
		bottom: 30px;
		right: 10px;
		width: 40px;
		height: 40px;
		border-radius: 100%;
		background-color: rgb(71, 71, 124);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color 0.2s linear;
	}

	.image-input:hover {
		background-color: rgb(87, 87, 153);
	}

	.image-input.processing {
		cursor: initial;
	}

	p,
	textarea {
		text-align: center;
		width: 800px;
		margin: 20px 0;
		box-sizing: border-box;
		padding: 16px;
	}

	.content,
	textarea {
		min-height: 200px;
		border-radius: 8px;
		background-color: rgba(255, 255, 255, 0.04);
		letter-spacing: 1px;
	}

	textarea {
		text-transform: uppercase;
		border: none;
		font: inherit;
		color: inherit;
		resize: none;
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
