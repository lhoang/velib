<script>
    import {scaleLinear} from 'd3-scale';
    import {arc as d3arc} from 'd3-shape';
    import {getMonthStr} from "../date.utils";
    import {detail} from '../velib.store';

    export let month = '';
    // format : Array<['20191231', Array<Course>]>
    export let data = [];
    export let width = 150;
    export let maxDistance = 40;

    const margin = {top: 20, right: 20, bottom: 20, left: 25};
    const donutOffset = width/8;
    $: levels = [0, 1, 2, 3].map( v => Math.ceil(v * maxDistance/4));

    $: [displayMonth, displayYear] = getMonthStr(month);



    // Note: 31 days for each month (easier)
    const dayAngle = 2 * Math.PI / 31;
    $: radiusScale = scaleLinear()
            .domain([0, maxDistance])
            .range([donutOffset, width / 2 - margin.left]);

    $: slices = data.map( d => {
        const [day, courses] = d;
        const dayOfMonth = +day.substring(8)-1;
        const totalDistance = courses.reduce( (acc, elt) => acc + elt.distance, 0);
        const outerShape = d3arc()
                .startAngle(dayAngle * dayOfMonth)
                .endAngle(dayAngle * (dayOfMonth + 1))
                .innerRadius(radiusScale(0))
                .outerRadius(radiusScale(totalDistance))();

        let currentDistance = 0;
        const innerShapes = courses.map( course => {
            const offset = course.isFaulty ? Math.PI / 360 : 0;

            const shape = d3arc()
                    .startAngle(dayAngle * dayOfMonth + offset)
                    .endAngle(dayAngle * (dayOfMonth + 1) - offset)
                    .innerRadius(radiusScale(currentDistance))
                    .outerRadius(radiusScale(currentDistance + course.distance))();
            currentDistance += course.distance;
            return {shape, course};
        });

        return {outerShape, innerShapes};
    });

    const weeks = ['1-5', '6-10', '11-15', '16-20', '21-25', '26-30'];


    const weekAngle = 5 * dayAngle;
    $: weekSlices = weeks.map((d, i) => {
        const shape = d3arc().startAngle(i * weekAngle)
                .endAngle((i + 1) * weekAngle)
                .innerRadius(donutOffset -1)
                .outerRadius(radiusScale(maxDistance))();

        return {shape, name: d};

    });

    const displayDetails = (index) => {
        detail.set(data[index]);
    }

</script>

<div class="container">
    <svg width={width} height={width}>
        <g transform="translate({width/2}, {width/2})">
            <g class="title">
                <text x="0" y="0" dy="-8">{displayMonth}</text>
                <text x="0" y="25" dy="-8">{displayYear}</text>
            </g>
            <g class="weeks">
                {#each weekSlices as {shape, name}, i}
                    <path id="week{i}" d="{shape}"></path>
                    <text dy="-4">
                        <textPath href="#week{i}" startOffset="12%" >
                            {name}
                        </textPath>
                    </text>
                {/each}
            </g>
            <g class="data">
                {#each slices as {outerShape, innerShapes}, index}
                    <g class="slice" on:click={() => displayDetails(index)}>
                    {#each innerShapes as {shape, course}}
                        <path d="{shape}"
                              class="inner {course.type} {course.isFaulty ? 'faulty' : ''}"
                              data-bikeid={course.bikeId}
                        >
                        </path>
                    {/each}
                    <path d="{outerShape}" class="outer"></path>
                    </g>
                {/each}
            </g>
            <g class="levels">
                {#each levels as level}
                    <circle cx="0" cy="0" r="{radiusScale(level)}"></circle>
                    <text x="0" y={-radiusScale(level)}>{level}</text>
                {/each}
                <text x="0" y="{-width/2 +20}">km</text>
            </g>
        </g>
    </svg>
</div>

<style>
    .container {
        width: min-content;
        width: -moz-min-content;
    }
    text {
        font-family: 'Nunito', sans-serif;
    }
    .mecanical {
        fill: var(--velib-green);
    }

    .electrical {
        fill: var(--velib-blue);
    }

    .faulty {
        stroke: var(--faulty);
        stroke-width: 4px;
        fill: var(--faulty);
    }

    .data path.outer {
        stroke: var(--velib-blue-dark);
        fill: transparent;
    }

    .slice:hover {
        transform: scale(1.2);
        cursor: help;
    }
    .slice:hover path.outer {
        stroke-width: 3px;
        stroke: #333333;
    }

    .data path.inner {
        stroke: #666;
    }
    .data path.inner.faulty {
        stroke: var(--faulty);
        stroke-width: 3px;
        fill: var(--faulty);
    }



    .title text {
        fill: #333333;
        stroke: #333333;
        font-size: 1.6rem;
        text-anchor: middle;
    }

    .weeks path {
        fill: none;
        stroke: lightgray;
        stroke-width: 1px;
        stroke-dasharray: 5,2;
    }
    .levels circle {
        fill: none;
        stroke: var(--velib-green);
        stroke-opacity: .52;
        stroke-width: 1px;
        stroke-dasharray: 5;
    }
    .levels text {
        fill: #737373;
        stroke: #737373;
        font-size: .8rem;
    }
</style>