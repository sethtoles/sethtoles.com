export function random(max: number): number;
export function random(min: number, max: number): number
export function random(min: number, max?: number) {
    if (max === undefined) {
        max = min;
        min = 0;
    }

    return Math.random() * (max - min) + min;
}
