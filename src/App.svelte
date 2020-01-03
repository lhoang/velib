<script>
	import Wheel from './viz/Wheel.svelte';
	import {getData} from './velib.service.js';

	export let source = '';
	const promise = getData(source);
</script>

<main>
	<h1>Stats Vélib</h1>
	<div class="container">
	{#await promise}
	...loading...
	{:then data}
		{#each data as [month, courses], i}
			<Wheel {month}
				   data={courses}
				   maxDistance="38"
				   width="350"
			></Wheel>
		{/each}
	{/await}
	</div>

</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
	}

</style>