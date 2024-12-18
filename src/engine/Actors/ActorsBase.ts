import {System, Circle, PotentialVector, Body, BodyOptions} from "detect-collisions";
import {Sprite} from "./Sprite.ts";


enum CollisionGroup {
    None = 0,
    Player = 1,
    Enemy = 2,
    Wall = 4,
    PowerUp = 5,
    PlayerProjectile = 7,
    Projectile = 8
}

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Actor {
    body: Body<Circle> = new Circle({x: 0, y: 0}, 10);
    radius: number = 10;
    collisionGroup: CollisionGroup = CollisionGroup.None;
    sprite: Sprite = new Sprite();

    sceneSizeX: number = 1000;
    sceneSizeY: number = 900;
    rootElement: HTMLElement | null = null;

    currentVelocity: Vector2 = {x: 0, y: 0};
    deceleration: number = 0.1;
    acceleration: number = 0.7;
    maxSpeed: number = 1;

    constructor() {}

    attach(system: System, rootElement: HTMLElement, position: PotentialVector) {
        this.sprite.attachToRoot(rootElement);
        this.rootElement = rootElement;

        const bodyOptions: BodyOptions = {
            group: this.collisionGroup,
        }

        this.body = system.createCircle(
            position,
            this.radius, bodyOptions
        );

        system.insert(this.body);

        this.updateSpritePosition();
    }

    updateSpritePosition() {
        if(this.body && this.rootElement) {
            const scaleFactor = this.rootElement.clientWidth / this.sceneSizeX;
            this.sprite.updatePosition(this.body.pos.x * scaleFactor, this.body.pos.y * scaleFactor);
        }
    }

    updateVelocity(delta: number) {
        if(this.body) {
            this.currentVelocity.x *= (1 - this.deceleration);
            this.currentVelocity.y *= (1 - this.deceleration);

            // clamp currentVelocity length to maxSpeed
            const speed = Math.sqrt(this.currentVelocity.x * this.currentVelocity.x + this.currentVelocity.y * this.currentVelocity.y);
            if(speed > this.maxSpeed) {
                const factor = this.maxSpeed / speed;
                this.currentVelocity.x *= factor;
                this.currentVelocity.y *= factor;
            }

            this.body.setPosition(
                this.body.pos.x + delta * this.currentVelocity.x,
                this.body.pos.y + delta * this.currentVelocity.y,
            true);
        }
    }
}

export class Scene {
    collisionSystem: System;
    rootElement: HTMLElement;
    actors: Actor[] = [];

    constructor(rootElement: HTMLElement) {
        this.collisionSystem = new System();
        this.rootElement = rootElement;

        const line = this.collisionSystem.createLine(new Vector2(100, 100), new Vector2(1000, 100), {group: CollisionGroup.None});
        this.collisionSystem.insert(line);
    }

    addActor(actor: Actor, position: PotentialVector) {
        actor.attach(this.collisionSystem, this.rootElement, position);
        this.actors.push(actor);
    }

    update(delta: number) {
        for(let actor of this.actors) {
            actor.updateVelocity(delta);
            this.collisionSystem.checkOne(actor.body, (response) => {
                console.log('collision detected', response);
            });
            actor.updateSpritePosition();
        }
    }
}