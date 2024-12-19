import {System, Circle, Body, BodyOptions} from "detect-collisions";
import {Sprite} from "./Sprite.ts";
import {Vector2} from "../Utils.ts";
import {LOW_VELOCITY_THRESHOLD} from "../Constants.ts";


enum EntityType {
    None = 0,
    Player = 1,
    Enemy = 2,
    Wall = 4,
    PowerUp = 5,
    PlayerProjectile = 7,
    Projectile = 8
}

export class Actor {
    maxHealth: number = 1;
    radius: number = 15;
    entityType: EntityType = EntityType.None;
    sprite: Sprite = new Sprite();
    acceleration: number = 0.002;
    maxSpeed: number = 0.4;
    deceleration: number = 0.007;

    _isAlive: boolean = true;
    _isInvulnerable: boolean = false;
    _currentHealth: number = 1;

    controllerDirection: Vector2 = new Vector2(0, 0);
    _currentVelocity: Vector2 = new Vector2(0, 0);

    _body: Body<Circle> = new Circle({x: 0, y: 0}, 10);

    constructor() {}

    attach(system: System, rootElement: HTMLElement, position: Vector2) {
        this.sprite.attachToRoot(rootElement);

        const bodyOptions: BodyOptions = {
            userData: this,
        }

        this._body = system.createCircle(
            position,
            this.radius, bodyOptions
        );

        system.insert(this._body);

        this.updateSpritePosition();
    }

    updateSpritePosition() {
        if(this._body) {
            this.sprite.updatePosition(this._body.pos.x, this._body.pos.y);
        }
    }

    tick(delta: number) {
        this.updateMovement(delta);
        this.updateSpritePosition();
    }

    updateMovement(delta: number) {
        if(this._body) {
            let accelerationX: number;
            let  accelerationY: number;
            if(this.controllerDirection.x != 0 || this.controllerDirection.y != 0) {
                accelerationX = this.controllerDirection.x * this.acceleration * delta;
                accelerationY = this.controllerDirection.y * this.acceleration * delta;
                this._currentVelocity.x += accelerationX;
                this._currentVelocity.y += accelerationY;
            } else {
                if (this._currentVelocity.getLength() > LOW_VELOCITY_THRESHOLD) {
                    this._currentVelocity.x -= this._currentVelocity.x * this.deceleration * delta;
                    this._currentVelocity.y -= this._currentVelocity.y * this.deceleration * delta;
                } else {
                    this._currentVelocity.x = 0;
                    this._currentVelocity.y = 0;
                }
            }

            this._currentVelocity.clampLength(this.maxSpeed);

            // clamp currentVelocity length to maxSpeed

            this._body.setPosition(
                this._body.pos.x + delta * this._currentVelocity.x,
                this._body.pos.y + delta * this._currentVelocity.y,
            true);
        }
    }
}

