import {getDay} from "./date.utils";
import {groupBy} from "ramda";


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

    const sortedAndCleaned = operations.map(clean)
        .sort((a,b) => a.start - b.start);

    const operationsByDay = byDay(sortedAndCleaned);
    const operationsByMonths=  byMonth(Object.entries(operationsByDay));
    return Object.entries(operationsByMonths);
}
