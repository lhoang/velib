<script lang="ts">
    import Wheel from './viz/Wheel.svelte';
    import Distance from './viz/Distance.svelte';
    import Details from './viz/Details.svelte';
    import {getData} from './velib.service.js';
    import {coursesByDay, currentDay, nbWheels, totalDistance} from './velib.store';
    import {
        buildDistancePoints,
        findMaxDistanceForWheels,
        getCoursesByMonthAndDay
    } from "./velib.service";
    import {addDay, getDay} from "./date.utils";
    import Sidepanel from "./Sidepanel.svelte";

    export let source = '';
    const margin = {top: 10, right: 75, bottom: 10, left: 75};
    let width;
    let coursesByMonth = [];
    let distancePoints = [];

    $:(async () => getData(source).then(result => coursesByDay.set(result)))();
    $: coursesByMonth = getCoursesByMonthAndDay($coursesByDay, $nbWheels);
    $: maxDistance = findMaxDistanceForWheels(coursesByMonth) * 1.2;
    $: distancePoints = buildDistancePoints(coursesByMonth, $totalDistance);
    $: displayWidth = width > 800 ? Math.min(width/2 - margin.left, 1200) : width;

    const moveRight = (event) => {
        if (event.key === 'ArrowRight') {
            currentDay.update(d => getDay(addDay(d, 1)));
        } else if (event.key === 'ArrowLeft') {
            currentDay.update(d => getDay(addDay(d, -1)));
        }
    }

</script>

<svelte:window on:keydown={moveRight}/>

<main bind:clientWidth={width}>
    <h1>Stats Vélib</h1>
    <div class="container">
        <div class="distance">
            {#if distancePoints.length === 0}
                ...loading...
            {:else}
                <Distance points={distancePoints} height="{displayWidth/3}" width="{displayWidth}">
                </Distance>
            {/if}
        </div>
        <div class="details">
            <Details width={displayWidth * 7/8}></Details>
        </div>
        <div class="wheels">
            {#if coursesByMonth.length === 0}
                ...loading...
            {:else}
                {#each coursesByMonth as [month, courses], i}
                    <Wheel {month}
                           data={courses}
                           {maxDistance}
                           width={displayWidth/2}
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
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        grid-template-areas:
                    "distance"
                    "details"
                    "wheels";
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

    @media print, screen and (min-width: 800px) {
        .container {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
                    "distance details"
                    "wheels details";
        }
    }
</style>