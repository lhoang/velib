import {getDay} from "./date.utils";
import {groupBy} from "ramda";
import {timeParse} from 'd3-time-format';


const clean = (operation) => {
    const duration = (operation.endDate - operation.startDate) / 1000;
    const day = getDay(operation.startDate);
    return ({
        day,
        bikeId: operation.parameter3.BIKEID,
        start: operation.startDate,
        end: operation.endDate,
        duration,
        distance: +operation.parameter3.DISTANCE / 1000,
        co2: +operation.parameter3.SAVED_CARBON_DIOXIDE,
        type: operation.parameter1 === 'yes' ? 'electrical' : 'mecanical',
    });
};

const byDay = groupBy(course => course.day);
const byMonth = groupBy(([day,]) => day.substring(0, 7));

/**
 * A bike can be considered faulty if i took another bike within the threshold time (2min)
 * or if the duration is < 60.
 */
const tagFaulty = (sources) => {
    // Threshold in ms
    const thresholdSwitch = 120 * 1000;
    // Duration in s
    const thresholdDuration = 15 * 60;
    const minDuration = 60;
    // courses are already sorted
    for (let i = 0; i < sources.length - 1; i++) {
        const current = sources[i];
        const next = sources[i + 1];
        current.isFaulty = current.duration < minDuration
            || (current.bikeId !== next.bikeId
                && current.duration < thresholdDuration
                && (next.start - current.end) <= thresholdSwitch);
    }
};

export async function getData(source) {
    const operations = await fetch(source)
        .then(response => response.json())
        .then(json => json.walletOperations);
    const cleanedAndsorted = operations.map(clean)
        .sort((a, b) => a.start - b.start);
    tagFaulty(cleanedAndsorted);
    return cleanedAndsorted;
}

export function getCoursesByMonthAndDay(courses) {
    const coursesByDay = byDay(courses);
    const coursesByMonths = byMonth(Object.entries(coursesByDay));
    const res = Object.entries(coursesByMonths);
    // get the last 2 months only for now
    return res.slice(Math.max(res.length - 2, 1))
}

export async function buildDistancePoints(courses, total) {
    //sorted desc
    const sorted = courses.sort((a, b) => b.start - a.start);
    let distance = total;
    sorted.forEach(course => {
        course['totalDistance'] = distance;
        distance -= course.distance;
    });
    return sorted.sort((a, b) => a.start - b.start);
}

// Parsing des timestamps
const parseTs = timeParse('%Q');

export function findMinMax(courses) {
    if (!courses || courses.length === 0) {
        return {
            dateMin: 0,
            dateMax: 0,
            distanceMin: 0,
            distanceMax: 0,
        }
    }

    // courses are already sorted
    const first = courses[0];
    const last = courses[courses.length - 1];
    return {
        dateMin: parseTs(first.start),
        dateMax: parseTs(last.end),
        distanceMin: first.totalDistance,
        distanceMax: last.totalDistance,
    };
}