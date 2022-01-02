import {derived, Readable, writable} from 'svelte/store';
import {getDay} from "./date.utils";
import type {Course, CoursesByDay} from "./models/velib.interface";

export const coursesByDay = writable<CoursesByDay>({});
export const currentDay = writable<string>(getDay(new Date()));
export const detail: Readable<Array<Course>> =
    derived([currentDay,coursesByDay],
        ([$currentDay, $coursesByDay]) =>
            $coursesByDay && $coursesByDay[$currentDay]
                ? $coursesByDay[$currentDay]
                : []
    );

export const nbWheels = writable<number>(12);
export const totalDistance = writable<number>(4523);


