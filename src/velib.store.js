import {derived, writable} from 'svelte/store';
import {getDay} from "./date.utils";

export const coursesByDay = writable(undefined);
export const currentDay = writable(getDay(new Date()));
export const detail =
    derived([currentDay,coursesByDay],
        ([$currentDay, $coursesByDay]) =>
            $coursesByDay && $coursesByDay[$currentDay]
                ? $coursesByDay[$currentDay]
                : []
    );
