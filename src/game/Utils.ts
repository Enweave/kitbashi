import {VIEWPORT_WIDTH} from "./Constants.ts";

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

    getNormalizedDirectionTo(target: Vector2) {
        const direction = new Vector2(target.x - this.x, target.y - this.y);
        direction.clampLength(1);
        return direction;
    }

}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export class Timer {
    private _timeLeft: number;
    private _callback: () => void;
    public duration: number;
    exhausted: boolean = false;
    callbackCalled: boolean = false;

    constructor(duration: number, callback: () => void) {
        this._timeLeft = duration;
        this.duration = duration;
        this._callback = callback;
    }

    reset() {
        this._timeLeft = this.duration;
        this.exhausted = false;
        this.callbackCalled = false;
    }

    tick(delta: number) {
        if(this.exhausted) {
            return;
        }
        this._timeLeft -= delta;
        if(this._timeLeft <= 0 && !this.callbackCalled) {
            this.exhausted = true;
            this.callbackCalled = true;
            this._callback();
        }
    }
}

export function audioBalanceFromScreenPosition(ActorPositionX: number): number {
    const halfWidth = VIEWPORT_WIDTH / 2;
    const balance = (ActorPositionX - halfWidth) / halfWidth;
    return clamp(balance, -1, 1);
}