<script>
    import {scaleTime, scaleLinear} from 'd3-scale';
    import {axisBottom, axisRight} from 'd3-axis';
    import {timeFormat, timeParse} from 'd3-time-format';
    import {select as d3select} from 'd3-selection';
    import {bisect} from 'd3-array';
    import {line as d3line, curveStepAfter} from 'd3-shape';
    import {findMinMax} from "../velib.service";
    import {currentDay} from '../velib.store';
    import {onMount, afterUpdate} from 'svelte';
    import {draw} from 'svelte/transition';
    import {formatDDMM, getDay, parseDay} from "../date.utils";

    export let points = [];
    export let width = 600;
    export let height = 250;
    export let events = [
        {
            date: new Date(2019, 11, 5),
            label: 'Début de la grève',
        },
        {
            date: new Date(2020, 2, 17),
            label: 'Confinement Covid-19'
        },
        {
            date: new Date(2020, 4, 11),
            label: 'Déconfinement'
        },
    ];

    const margin = {top: 20, right: 50, bottom: 20, left: 25};
    let dateMin, dateMax, distanceMin, distanceMax, allDates;
    // Parsing des timestamps
    const parseTs = timeParse('%Q');
    let dataMap = new Map();

    let scrollEnabled = true;
    const toggleScroll = () => scrollEnabled = !scrollEnabled;

    $: {
        const minMax = findMinMax(points);
        dateMin = minMax.dateMin;
        dateMax = minMax.dateMax;
        distanceMin = minMax.distanceMin;
        distanceMax = minMax.distanceMax;
        allDates = points.map(p => parseTs(p.start));
        dataMap = new Map(points.map(p => [
            p.day,
            Math.floor(p.totalDistance)
        ]));
    }

    // Echelles et Axes
    $: xScale = scaleTime()
            .domain([dateMin, dateMax])
            .range([margin.left, width - margin.right]);

    $: yScale = scaleLinear()
            .domain([distanceMin, distanceMax])
            .range([height - margin.bottom, margin.top]);

    $: nbTicks = Math.min(4, Math.floor(width / 100));

    // Abscisse
    $: xAxis = axisBottom().scale(xScale)
            .ticks(nbTicks)
            .tickFormat(timeFormat('%d/%m'));

    $: yAxis = axisRight().scale(yScale)
            .ticks(nbTicks)
            .tickSize(width - margin.left - margin.right)
            .tickFormat(function (d) {
                return this.parentNode.nextSibling ? d : `${d} km`;
            });


    $: path = d3line()
            .curve(curveStepAfter)
            .x(d => xScale(parseTs(d.start)))
            .y(d => yScale(d.totalDistance))
            (points);

    $: eventLines = events.map(event => {
        const x = xScale(event.date);
        return {
            label: event.label,
            x1: x,
            x2: x,
            y1: margin.top,
            y2: height - margin.bottom,
        };
    });

    let transitionReset = 0;
    $:  points ? transitionReset++ : transitionReset;


    const followMouse = (event) => {
        if (!scrollEnabled) return;
        const mouseX = event.layerX;
        const value = getDay(allDates[bisect(allDates, xScale.invert(mouseX))]);
        // console.log(value);
        currentDay.set(value);
    };
    $: xDay = xScale(parseDay($currentDay));
    $: infos = $currentDay && dataMap.get($currentDay)
            ? [formatDDMM($currentDay), dataMap.get($currentDay)]
            : [];

    const setAxis = () => {
        // Génération des axes
        d3select('g[ref="xAxis"]').call(xAxis)
                .call(g => g.select(".domain")
                        .remove());
        d3select('g[ref="yAxis"]').call(yAxis)
                .call(g => g.select(".domain")
                        .remove())
                .call(g => g.selectAll(".tick line")
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-dasharray", "2,2"))
                .call(g => g.selectAll(".tick text")
                        .attr("x", 4)
                        .attr("dy", -4));
    };

    onMount(() => {
        setTimeout(() => {
            setAxis();
        }, 50);
    });
    afterUpdate(() => setAxis());

</script>

<div class="container">
    <h3>Distance totale</h3>
    <svg width={width} height={height}
         on:mousemove={followMouse}
         on:click={toggleScroll}
         class:scrollable={scrollEnabled}
    >
        <g class="data">
            <!-- This is using an {#each} block with one item, when the key changes,
svelte removes the component
and adds a new one, therefor triggering the transitions.
https://stackoverflow.com/questions/59062025/is-there-a-way-to-perform-svelte-transition-without-a-if-block
-->
            {#each [transitionReset] as count (count)}
                <path in:draw="{{duration: 2000}}"
                      d="{path}" id="distance-path">
                </path>
<!--                <text class="biker" text-anchor="end">-->
<!--                    <textPath href="#distance-path"-->
<!--                              startOffset="90%" in:draw="{{duration: 2000}}">-->
<!--                        🚵OO-->
<!--                    </textPath>-->
<!--                </text>-->
            {/each}
        </g>
        <g class="events">
            {#each eventLines as {x1, x2, y1, y2, label}}
                <line {x1} {x2} {y1} {y2}></line>
                <text x={x1} y={margin.top}
                      dx="5">
                    {label}
                </text>
            {/each}
        </g>
        <g class="cursor">
            <line x1="{xDay}" x2="{xDay}"
                  y1="{margin.top}" y2="{height - margin.bottom}"
            >
            </line>
            {#if infos[0]}
                <g transform="translate(5, 0)">
                    <rect x="{xDay}" y="{height - margin.bottom - width*4/100}"
                          width={width*10/100}
                          height={width*4/100}
                    >
                    </rect>
                    <text x="{xDay}" y={height - margin.bottom} dy="-15"> {infos[0]}</text>
                    <text x="{xDay}" y={height - margin.bottom}> {infos[1]}km</text>
                </g>
            {/if}
        </g>

        <g>
            <g ref="xAxis" transform={`translate(0, ${height - margin.bottom})`}></g>
            <g ref="yAxis" transform={`translate(${margin.left}, 0)`}></g>
        </g>
    </svg>

</div>


<style>
    h3, text {
        font-family: 'Nunito', sans-serif;
    }

    text {
        font-size: 1vw;
    }

    .container {
        width: min-content;
        width: -moz-min-content;
    }

    g.data path {
        stroke: var(--velib-green-dark);
        stroke-width: 2px;
        fill: none;
    }

    g.events line {
        stroke: var(--faulty);
        stroke-width: 2px;
    }

    g.events text {
        stroke: #666666;
        fill: #666666;
        font-size: .9vw;
    }

    g.cursor line {
        stroke: var(--velib-blue-dark);
        stroke-width: 2px;
    }

    g.cursor rect {
        fill: lightyellow;
        border-radius: 3px;
    }

    g.cursor text {
        fill: #333333;
        font-size: .9vw;
        font-weight: bold;
    }

    svg {
        cursor: pointer;
    }

    .scrollable {
        cursor: col-resize;
    }

    .biker {
        stroke: black;
        font-size: 1vw;
    }
</style>