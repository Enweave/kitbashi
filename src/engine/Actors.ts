import {System, Circle, PotentialVector, Body, BodyOptions} from "detect-collisions";


enum CollisionGroup {
    None = 0,
    Player = 1,
    Enemy = 2,
    Wall = 4,
    PowerUp = 5,
    PlayerProjectile = 7,
    Projectile = 8
}

export class Actor {
    body: Body<Circle>
    radius: number = 10;
    collisionGroup: CollisionGroup = CollisionGroup.None;

    constructor(system: System, position: PotentialVector) {
        this.body = system.createCircle(position, this.radius);
    }
}

export class Scene {
    collisionSystem: System;
    actors: Actor[] = [];

    constructor() {
        this.collisionSystem = new System();
    }

    addActor(position: PotentialVector) {
        this.actors.push(new Actor(this.collisionSystem, position));
    }

    removeActor(actor: Actor) {
        this.collisionSystem.remove(actor.body);
        this.actors.splice(this.actors.indexOf(actor), 1);
    }
}