import {getDay} from "./date.utils";
import {groupBy} from "ramda";
import {timeParse} from 'd3-time-format';
import type {
    Course,
    CoursesByDay,
    CoursesByMonth,
    CoursesByMonthEntries,
    MinMax,
    Operation
} from "./models/velib.interface";


const clean = (operation: Operation): Course => {
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

export function byDay(courses: Array<Course>): CoursesByDay{
    return groupBy(course => course.day)(courses);
}

const byMonth: (courses: Array<[string, Array<Course>]>) => CoursesByMonth =
    groupBy(([day,]) => day.substring(0, 7));

/**
 * A bike can be considered faulty if i took another bike within the threshold time (5min)
 * or if the duration is < 60
 * or if the distance is < 100m
 */
const tagFaulty = (sources: Array<Course>) => {
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

export function cleanAndSort(operations: Array<Operation>): Array<Course> {
    const cleanedAndsorted = operations.map(clean)
        .sort((a, b) => a.start - b.start);
    tagFaulty(cleanedAndsorted);
    return cleanedAndsorted;
}

export async function getData(source: string): Promise<CoursesByDay> {
    const operations = await fetch(source)
        .then(response => response.json())
        .then(json => json.walletOperations);
    return byDay(cleanAndSort(operations));
}

export function getCoursesByMonthAndDay(coursesByDay, nbWheels: number): CoursesByMonthEntries {
    const coursesByMonths = byMonth(Object.entries(coursesByDay));
    const res = Object.entries(coursesByMonths)
        .sort((a, b) => a[0].localeCompare(b[0]));
    return res.slice(Math.max(res.length - nbWheels, 1))
}

export function buildDistancePoints(coursesByMonth: CoursesByMonthEntries, total: number): Array<Course> {
    //sorted desc
    const sorted = coursesByMonth
        .flatMap(([,cByDay]) => cByDay)
        .flatMap(([, courses]) => courses)
        .sort((a, b) => b.start - a.start);
    let distance = +total;
    sorted.forEach(course => {
        course.totalDistance = distance;
        distance -= course.distance;
    });
    return sorted.sort((a, b) => a.start - b.start);
}

// Parsing timestamps
const parseTs : (a: string | number)=> Date = timeParse('%Q');

export function findMaxDistanceForWheels(coursesByMonth: CoursesByMonthEntries): number {
    const  totalDistances =  coursesByMonth
        .flatMap(([,cByDay]) => cByDay)
        .map(([, courses]) => courses.reduce((acc, elt) => acc + elt.distance, 0));
    return totalDistances.reduce( (a, b) => Math.max(a, b), 10);
}

export function findMinMax(courses: Array<Course>): MinMax {
    if (!courses || courses.length === 0) {
        return {
            dateMin: new Date(),
            dateMax: new Date(),
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