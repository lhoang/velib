/**
 * Operation (Velib Data).
 */
export interface Operation {
    startDate: number;
    endDate: number;
    operationDate: number;
    parameter1: 'yes' | 'no';
    parameter3: {
        BIKEID: string;
        DISTANCE: string;
        SAVED_CARBON_DIOXIDE: number
    };
}

/**
 * Course from Operation.
 */
interface Course {
    day: string;
    bikeId: string;
    start: number;
    end: number;
    duration: number;
    distance: number;
    co2: number;
    type: 'electrical' | 'mecanical';
    isFaulty?: boolean;
    totalDistance?: number;
}

export interface MinMax {
    dateMin: Date;
    dateMax: Date;
    distanceMin: number;
    distanceMax: number;
}

/**
 * Courses grouped by day.
 * Ex:
 * ```
 * {
 * '2020-05-01': [Courses]
 * }
 * ```
 */
export interface CoursesByDay {
    [key: string]: Array<Course>;
}

/**
 * Entries of CoursesByDay.
 */
export type CoursesByDateEntries = Array<[string, Array<Course>]>;

/**
 * Courses grouped by month and day
 * Ex:
 * ```
 * {
 * '2020-05': [
 *       ['2020-05-01',[Courses]],
 *       ['2020-05-02',[Courses]],
 *  ]
 * }
 * ```
 */
export interface CoursesByMonth {
    [key: string]: CoursesByDateEntries
}

/**
 * Entries of CoursesByMonth
 * Ex:
 * ```
 * ['2020-05', [
 *       ['2020-05-01',[Courses]],
 *       ['2020-05-02',[Courses]],
 *  ]
 * ]
 * ```
 */
export type CoursesByMonthEntries = Array<[string, CoursesByDateEntries]>;

export interface CourseWithCoord extends Course {
    x1: number;
    x2: number;
}

export type {Course};

export interface SpinParams {
    duration: number;
    startAngle: number;
    leftOffset: number;
}