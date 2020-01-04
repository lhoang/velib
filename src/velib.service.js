import {getDay} from "./date.utils";
import {groupBy} from "ramda";
import {timeFormat, timeParse} from 'd3-time-format';

const clean = (operation) => {
    const duration = (operation.endDate - operation.startDate) / 1000;
    const day = getDay(operation.startDate);
    return ({
        day,
        start: operation.startDate,
        end: operation.endDate,
        duration,
        distance: +operation.parameter3.DISTANCE/1000,
        co2: +operation.parameter3.SAVED_CARBON_DIOXIDE,
        isFaulty: duration < 60,
    });
};

const byDay = groupBy(course => course.day);
const byMonth = groupBy(([day, ]) => day.substring(0, 7));

export async function getData(source) {
    const operations = await fetch(source)
        .then(response => response.json())
        .then(json => json.walletOperations);
    return operations.map(clean);
}

export function getCoursesByMonthAndDay(courses) {
    const sorted = courses.sort((a,b) => a.start - b.start);
    const coursesByDay = byDay(sorted);
    const coursesByMonths = byMonth(Object.entries(coursesByDay));
    return Object.entries(coursesByMonths);
}

export async function buildDistancePoints(courses, total) {
    //sorted desc
    const sorted = courses.sort((a,b) => b.start - a.start);
    let distance = total;
    sorted.forEach( course => {
        course['totalDistance'] = distance;
        distance -= course.distance;
    });
    return sorted.sort((a,b) => a.start - b.start);
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

    // courses is already sorted
    const first = courses[0];
    const last = courses[courses.length-1];
    return {
        dateMin: parseTs(first.start),
        dateMax: parseTs(last.end),
        distanceMin: first.totalDistance,
        distanceMax: last.totalDistance,
    };
}