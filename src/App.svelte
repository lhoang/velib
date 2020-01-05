<script>
    import Wheel from './viz/Wheel.svelte';
    import Distance from './viz/Distance.svelte';
    import Details from './viz/Details.svelte';
    import {getData} from './velib.service.js';
    import {buildDistancePoints, getCoursesByMonthAndDay} from "./velib.service";

    export let source = '';
    let allCourses = [];
    let coursesByMonthPromise;
    let distancePoints;

    $:(async () => allCourses = await getData(source))();
    $: coursesByMonthPromise = getCoursesByMonthAndDay(allCourses);


    $: distancePoints = buildDistancePoints(allCourses, 965.1);

</script>

<main>
    <h1>Stats Vélib</h1>
    <div class="container">
        <div class="details">
            <Details></Details>
        </div>
		<div class="wheels">
        {#await coursesByMonthPromise}
            ...loading...
        {:then  coursesByMonth}
            {#each coursesByMonth as [month, courses], i}
                <Wheel {month}
                       data={courses}
                       maxDistance="38"
                       width="350"
                ></Wheel>
            {/each}
        {/await}
		</div>

		<div class="distance">
        {#await distancePoints}
			...loading...
        {:then points}
			<Distance {points} height="300" width="700">
			</Distance>
        {/await}
		</div>

    </div>

</main>

<style>
	* {
		--velib-blue: #a3d2da;
		--velib-blue-dark: #8fb8bf;
		--velib-green: #80b85c;
		--velib-green-dark: #6a9c4e;
        --faulty: #b86575;
	}

	h1, h2, h3, text {
		font-family: 'Nunito', sans-serif;
	}

	.container {
		display: flex;
		flex-direction: column;
	}
    .wheels {
        display: flex;
        flex-direction: row;
    }

</style>