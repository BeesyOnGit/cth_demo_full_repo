// a functions that takes a time unit as a param and returns it in milliseconds or seconds
export function timeUniConversion({
    time,
    unit,
    returUnit,
}: {
    time: number | string;
    unit: "seconds" | "minutes" | "hours" | "days";
    returUnit: "milliseconds" | "seconds";
}): number {
    if (typeof time === "string") {
        time = parseInt(time);
    }

    if (returUnit === "seconds") {
        switch (unit) {
            case "seconds":
                return time;
            case "minutes":
                return time * 60;
            case "hours":
                return time * 3600;
            case "days":
                return time * 24 * 3600;
            default:
                throw new Error("Invalid time unit");
        }
    }

    switch (unit) {
        case "seconds":
            return time * 1000;
        case "minutes":
            return time * 60 * 1000;
        case "hours":
            return time * 3600 * 1000;
        case "days":
            return time * 24 * 3600 * 1000;
        default:
            throw new Error("Invalid time unit");
    }
}
