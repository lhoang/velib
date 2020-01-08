import {getDay} from "./date.utils";
import {groupBy} from "ramda";
import {timeParse} from 'd3-time-format';


const clean = (operation) => {
    let start = operation.startDate;
    let end = operation.endDate;
    if (!start || !end) {
        start = operation.operationDate;
        end = operation.operationDate;
    }
    const duration = (end - start) / 1000;
    const day = getDay(operation.startDate);

    return ({
        day,
        bikeId: operation.parameter3.BIKEID,
        start,
        end,
        duration,
        distance: +operation.parameter3.DISTANCE / 1000,
        co2: +operation.parameter3.SAVED_CARBON_DIOXIDE,
        type: operation.parameter1 === 'yes' ? 'electrical' : 'mecanical',
    });
};

const byDay = groupBy(course => course.day);
const byMonth = groupBy(([day,]) => day.substring(0, 7));

/**
 * A bike can be considered faulty if i took another bike within the threshold time (5min)
 * or if the duration is < 60
 * or if the distance is < 100m
 */
const tagFaulty = (sources) => {
    // Threshold in ms
    const thresholdSwitch = 5 * 60 * 1000;
    // Duration in s
    const thresholdDuration = 15 * 60;
    const minDuration = 60;
    // Distance min in km
    const minDistance = 0.1;
    // courses are already sorted
    for (let i = 0; i < sources.length - 1; i++) {
        const current = sources[i];
        const next = sources[i + 1];
        current.isFaulty = current.duration < minDuration
            || (current.bikeId !== next.bikeId
                && current.duration < thresholdDuration
                && (next.start - current.end) <= thresholdSwitch)
            || (current.distance <= minDistance);
    }
};

export function cleanAndSort(operations) {
    const cleanedAndsorted = operations.map(clean)
        .sort((a, b) => a.start - b.start);
    tagFaulty(cleanedAndsorted);
    return cleanedAndsorted;
}

export async function getData(source) {
    const operations = await fetch(source)
        .then(response => response.json())
        .then(json => json.walletOperations);
    return cleanAndSort(operations);
}

export function getCoursesByMonthAndDay(courses, nbWheels) {
    const coursesByDay = byDay(courses);
    const coursesByMonths = byMonth(Object.entries(coursesByDay));
    const res = Object.entries(coursesByMonths)
        .sort((a, b) => a[0].localeCompare(b[0]));
    // get the last 2 months only for now
    return res.slice(Math.max(res.length - nbWheels, 1))
}

export function buildDistancePoints(courses, total) {
    //sorted desc
    const sorted = courses.sort((a, b) => b.start - a.start);
    let distance = +total;
    sorted.forEach(course => {
        course['totalDistance'] = distance;
        distance -= course.distance;
    });
    return sorted.sort((a, b) => a.start - b.start);
}

// Parsing des timestamps
const parseTs = timeParse('%Q');

export function findMaxDistanceForWheels(coursesByMonth) {
    const  totalDistances =  coursesByMonth
        .flatMap(([,cByDay]) => cByDay)
        .map(([, courses]) => courses.reduce((acc, elt) => acc + elt.distance, 0));
    return totalDistances.reduce( (a, b) => Math.max(a, b), 10);
}

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