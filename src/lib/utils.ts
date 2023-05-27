export function random(max: number): number;
export function random(min: number, max: number): number
export function random(min: number, max?: number) {
    if (max === undefined) {
        max = min;
        min = 0;
    }

    return Math.random() * (max - min) + min;
}

type Position = { x: number, y: number };
export function getDistanceFromPositions(start: Position, end: Position) {
    return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2))
}

export function getDistanceFromVelocity(x: number, y: number) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}
