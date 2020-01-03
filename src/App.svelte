<script>
	import Wheel from './viz/Wheel.svelte';
	import {getData} from './velib.service.js';

	export let source = '';
	const promise = getData(source);
</script>

<main>
	<h1>Stats Vélib</h1>

	<Wheel month="Nov"></Wheel>

	{#await promise}
	... loading...
	{:then data}
		{#each data as d, i}
			{i} - {JSON.stringify(d)} <br/>
		{/each}
	{/await}

</main>

<style>

</style>