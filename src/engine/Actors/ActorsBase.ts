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
    body: Body<Circle> | null = null;
    radius: number = 10;
    collisionGroup: CollisionGroup = CollisionGroup.None;
    sprite: Sprite = new Sprite();

    sceneSizeX: number = 1000;
    sceneSizeY: number = 900;
    rootElement: HTMLElement | null = null;

    currentVelocity: Vector2 = {x: 0, y: 0};
    deceleration: number = 0.1;
    acceleration: number = 1;
    maxSpeed: number = 5;

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
            this.currentVelocity.x *= 1 - this.deceleration;
            this.currentVelocity.y *= 1 - this.deceleration;
            this.body.pos.x += this.currentVelocity.x * delta;
            this.body.pos.y += this.currentVelocity.y * delta;
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
    }

    addActor(actor: Actor, position: PotentialVector) {
        actor.attach(this.collisionSystem, this.rootElement, position);
        this.actors.push(actor);
    }

    update(delta: number) {
        for(let actor of this.actors) {
            actor.updateVelocity(delta);
            actor.updateSpritePosition();
        }
    }
}