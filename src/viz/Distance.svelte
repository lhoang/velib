<script>
    import {scaleTime, scaleLinear} from 'd3-scale';
    import {axisBottom, axisRight} from 'd3-axis';
    import {timeFormat, timeParse} from 'd3-time-format';
    import {select as d3select} from 'd3-selection';
    import {line as d3line, curveStepAfter} from 'd3-shape';
    import {findMinMax} from "../velib.service";
    import {onMount} from 'svelte';

    export let points = [];
    export let width = 600;
    export let height = 250;
    export let events = [{
        date: new Date(2019, 11, 5),
        label: 'Début de la grève',
    },
    ];

    const margin = {top: 20, right: 50, bottom: 20, left: 25};
    let dateMin, dateMax, distanceMin, distanceMax;
    // Parsing des timestamps
    const parseTs = timeParse('%Q');

    $: {
        const minMax = findMinMax(points);
        dateMin = minMax.dateMin;
        dateMax = minMax.dateMax;
        distanceMin = minMax.distanceMin;
        distanceMax = minMax.distanceMax;
    }


    // Echelles et Axes
    $: xScale = scaleTime()
            .domain([dateMin, dateMax])
            .range([margin.left, width - margin.right]);

    $: yScale = scaleLinear()
            .domain([distanceMin, distanceMax])
            .range([height - margin.bottom, margin.top]);

    // Abscisse
    $: xAxis = axisBottom().scale(xScale)
            .ticks(6)
            .tickFormat(timeFormat('%d/%m'));

    $: yAxis = axisRight().scale(yScale)
            .tickSize(width - margin.left - margin.right)
            .tickFormat( function (d){
                return this.parentNode.nextSibling ? d : `${d} km`;
            });


    $: path = d3line()
            .curve(curveStepAfter)
        .x(d => xScale(parseTs(d.start)))
        .y(d => yScale(d.totalDistance))
        (points);

    $: eventLines = events.map( event => {
        const x = xScale(event.date);
        return {
            label: event.label,
            x1: x,
            x2: x,
            y1: margin.top,
            y2: height - margin.bottom,
        };
    });


    onMount(() => {
        setTimeout(() => {
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
        }, 50);
    });

</script>

<div class="container">
    <h3>Distance totale</h3>
    <svg width={width} height={height}>
        <g class="data">
            <path d="{path}"></path>
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
        font-size: .7rem;
    }
</style>