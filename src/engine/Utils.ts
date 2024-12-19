export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getLength() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    clampLength(max: number) {
        const length = this.getLength();
        if(length > max) {
            const factor = max / length;
            this.x *= factor;
            this.y *= factor;
        }
    }
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export class Timer {
    private _duration: number;
    private _callback: () => void;
    exhausted: boolean = false;

    constructor(duration: number, callback: () => void) {
        this._duration = duration;
        this._callback = callback;
    }

    tick(delta: number) {
        this._duration -= delta;
        if(this._duration <= 0) {
            this.exhausted = true;
            this._callback();
            this._callback = () => {};
        }
    }
}