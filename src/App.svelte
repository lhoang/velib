<script>
    import Wheel from './viz/Wheel.svelte';
    import Distance from './viz/Distance.svelte';
    import Details from './viz/Details.svelte';
    import {getData} from './velib.service.js';
    import {coursesByDay, nbWheels, totalDistance} from './velib.store';

    import {
        buildDistancePoints,
        findMaxDistanceForWheels,
        getCoursesByMonthAndDay
    } from "./velib.service";
    import Sidepanel from "./Sidepanel.svelte";

    export let source = '';
    let coursesByMonth = [];
    let distancePoints = [];

    $:(async () => getData(source).then(result => coursesByDay.set(result)))();
    $: coursesByMonth = getCoursesByMonthAndDay($coursesByDay, $nbWheels);
    $: maxDistance = findMaxDistanceForWheels(coursesByMonth) * 1.2;
    $: distancePoints = buildDistancePoints(coursesByMonth, $totalDistance);

</script>


<main>
    <h1>Stats Vélib</h1>
    <div class="container">
        <div class="distance">
            {#if distancePoints.length === 0}
                ...loading...
            {:else}
                <Distance points={distancePoints} height="200" width="700">
                </Distance>
            {/if}
        </div>
        <div class="details">
            <Details></Details>
        </div>
        <div class="wheels">
            {#if coursesByMonth.length === 0}
                ...loading...
            {:else}
                {#each coursesByMonth as [month, courses], i}
                    <Wheel {month}
                           data={courses}
                           {maxDistance}
                           width="350"
                    ></Wheel>
                {/each}
            {/if}
        </div>
    </div>
    <Sidepanel></Sidepanel>

</main>

<style>
    * {
        --velib-blue: #a3d2da;
        --velib-blue-dark: #8fb8bf;
        --velib-green: #80b85c;
        --velib-green-dark: #6a9c4e;
        --faulty: #b86575;
    }

    main {
        margin: 0;
    }

    h1, h2, h3, text {
        font-family: 'Nunito', sans-serif;
    }

    .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
        grid-template-areas:
                "distance details"
                "wheels details";
    }
    .distance {
        grid-area: distance;
    }
    .details {
        grid-area: details;
    }

    .wheels {
        grid-area: wheels;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

</style>