<script>
    import {scaleLinear} from 'd3-scale';
    import {arc as d3arc} from 'd3-shape';
    import {getMonthStr} from "../date.utils";

    export let month = '';
    // format : Array<['20191231', Array<Course>]>
    export let data = [];
    export let width = 150;
    export let maxDistance = 40;

    const margin = {top: 20, right: 20, bottom: 20, left: 25};
    const donutOffset = width/8;
    const levels =[0, 10, 20, 30, 40, 50]
                .filter(d => d <= maxDistance);

    const [displayMonth, displayYear] = getMonthStr(month);



    // Note: 31 days for each month (easier)
    const dayAngle = 2 * Math.PI / 31;
    $: radiusScale = scaleLinear()
            .domain([0, maxDistance])
            .range([donutOffset, width / 2 - margin.left]);

    $: slices = data.map( d => {
        const [day, courses] = d;
        const dayOfMonth = +day.substring(8)-1;
        const distance = courses.reduce( (acc, elt) => acc + elt.distance, 0);
        const shape = d3arc()
                .startAngle(dayAngle * dayOfMonth)
                .endAngle(dayAngle * (dayOfMonth + 1))
                .innerRadius(donutOffset)
                .outerRadius(radiusScale(distance))();

        return {shape};
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

</script>

<div class="container">
    <svg width={width} height={width}>
        <g transform="translate({width/2}, {width/2})">
            <g class="data">
                {#each slices as {shape}}
                    <path d="{shape}"></path>
                {/each}
            </g>
            <g class="title">
                <text x="0" y="0" dy="-5">{displayMonth}</text>
                <text x="0" y="20" dy="-5">{displayYear}</text>
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
        width: -webkit-min-content;
    }
    text {
        font-family: 'Nunito', sans-serif;
    }
    .data path {
        stroke: #8fb8bf;
        fill: #a3d2da;
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
        stroke-dasharray: 5 2;
    }
    .levels circle {
        fill: none;
        stroke: rgba(128, 184, 92, 0.52);
        stroke-width: 1px;
        stroke-dasharray: 5;
    }
    .levels text {
        fill: #999999;
        stroke: #999999;
        font-size: .8rem;
    }
</style>