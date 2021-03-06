<script lang="ts">
    import {scaleLinear} from 'd3-scale';

    import {detail, currentDay} from '../velib.store';
    import {getTime, formatDuration} from "../date.utils";

    import type {Course, CourseWithCoord} from "../models/velib.interface";

    export let width = 600;
    const margin = {top: 10, right: 100, bottom: 10, left: 25};

    let maxDistance = 0;


    const lineOffset = 120;
    const lineHeight = 30;
    let height = 0;
    let displayCourses: Array<CourseWithCoord>;

    $: height = $detail.length * lineHeight + margin.top + margin.bottom;
    $: xScale = scaleLinear()
            .domain([0, maxDistance])
            .range([margin.left + lineOffset, width - margin.right]);


    const addCoords = (courses: Array<Course>): [Array<CourseWithCoord>, number] => {
        let acc = 0;
        const res = courses.map(course => {
            const x1 = acc;
            acc += course.distance;
            const x2 = acc;
            return {...course, x1, x2};
        });
        return [res, acc];
    };
    const formatDay = (dayStr: string) => {
        const dayArr = dayStr.split('-');
        return `${dayArr[2]}/${dayArr[1]}/${dayArr[0]}`;
    };
    $: [displayCourses, maxDistance] = addCoords($detail);

    const close = () => currentDay.set(undefined);

</script>
{#if $detail.length > 0}
    <div class="container">

        <div class="header">
            <h3>Détails</h3>
            <div class="close-btn" on:click={close}>×</div>
        </div>
        <div class="part1">
            <div>
                <span class="label">Date : </span>{formatDay($currentDay)}
            </div>
            <div class="legend">
                <span class="mecanical">Mécanique</span>
                <span class="electrical">Électrique</span>
                <span class="faulty">Défectueux</span>
            </div>
        </div>
        <svg width={width} height={height}>
            <g class="data">
                {#each displayCourses as course, i}
                    <text x="20" y={20+i*lineHeight} class:faulty={course.isFaulty}>
                        🚲 {course.bikeId}
                    </text>
                    <text class="time" x={xScale(course.x1)} dx="-5" y={20+i*lineHeight}
                          text-anchor="end"
                    >
                        {getTime(course.start)}
                    </text>
                    <text class="time" x={xScale(course.x2)} dx="5" y={20+i*lineHeight}
                          text-anchor="start"
                    >
                        {getTime(course.end)}
                    </text>
                    <text class="duration" x={xScale(course.x2) + 40} y={20+i*lineHeight}
                          text-anchor="start"
                    >
                        {formatDuration(course.duration)}
                    </text>
                    {#if course.distance > 0.5}
                        <line
                                class="course {course.type}"
                                x1={xScale(course.x1)}
                                x2={xScale(course.x2)}
                                y1={lineHeight/2+1+ i*lineHeight}
                                y2={lineHeight/2+1+ i*lineHeight}
                        ></line>
                        <text class="time" x={xScale((course.x1 + course.x2)/2)} y={20+i*lineHeight}
                              dy="-9" text-anchor="middle"
                        >
                            {course.distance.toFixed(1)}km
                        </text>
                    {:else}
                        <line
                                class="course faulty"
                                x1={xScale(course.x1)}
                                x2={xScale(course.x1)+3}
                                y1={15+i*lineHeight}
                                y2={15+i*lineHeight}
                        ></line>
                    {/if}
                {/each}
            </g>
        </svg>

    </div>
{/if}

<style>
    h3 {
        margin: 0;
        padding: 0.5rem 0;
    }

    h3, text {
        font-family: 'Nunito', sans-serif;
        fill: #333333;
    }

    .container {
        border: 4px solid var(--velib-blue-dark);
        border-radius: 8px;
        padding: 0 1rem;
        width: min-content;
        width: -moz-min-content;
    }

    .header, .part1 {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .mecanical {
        stroke: var(--velib-green);
        fill: var(--velib-green);
        color: var(--velib-green);
    }

    .electrical {
        stroke: var(--velib-blue);
        fill: var(--velib-blue);
        color: var(--velib-blue);
    }

    .faulty {
        stroke: var(--faulty);
        fill: var(--faulty);
        color: var(--faulty);
    }

    line.course {
        stroke-width: 8px;
    }

    .time {
        fill: #666666;
        font-size: .6rem;
    }
    .duration {
        fill: #444;
        font-size: .7rem;
        font-style: italic;
    }

    .close-btn {
        color: #777;
        font: 2rem arial, sans-serif;
        position: relative;
        right: -10px;
        text-decoration: none;
        text-shadow: 0 1px 0 #fff;
        cursor: pointer;
    }
</style>