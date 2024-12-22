import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
import {audioBalanceFromScreenPosition, Vector2} from "../Utils.ts";
import {Sprite} from "./Base/Sprite.ts";
import {SFXSetType} from "../SoundController.ts";
import {BodyOptions, System} from "detect-collisions";
import {
    WeaponEnemyBomber, WeaponEnemyMachineGun,
    WeaponEnemyMine,
    WeaponEnemyMineSecondary,
    WeaponEnemyShooter,
    WeaponEnemySniper
} from "./Weapons.ts";
import {FlowController} from "../FlowController.ts";


abstract class MovementPattern {
    // implements movement patterns for enemies, like sine wave, straight line, etc.
    // takes a delta and returns a direction vector
    abstract getDirection(delta: number): Vector2;
}

class MovementPatternStraightLine extends MovementPattern {
    getDirection(_: number): Vector2 {
        return new Vector2(-1, 0);
    }
}

class MovementPatternSineWave extends MovementPattern {
    sinePeriod: number = 1000;
    sineAmplitude: number = 1;
    _accumulatedDelta: number = 0;
    xMultiplier: number = 1;

    constructor(period: number = 1000, amplitude: number = 1, xMultiplier: number = -1) {
        super();
        this.sinePeriod = period;
        this.sineAmplitude = amplitude;
        this._accumulatedDelta = 0;
        this.xMultiplier = xMultiplier;
    }

    deltaToRadians(delta: number): number {
        return (delta / this.sinePeriod) * 2 * Math.PI;
    }

    getDirection(delta: number): Vector2 {
        this._accumulatedDelta += delta;
        const direction = new Vector2(
            this.xMultiplier,
            Math.sin(this.deltaToRadians(this._accumulatedDelta)) * this.sineAmplitude
        );
        if (this._accumulatedDelta > this.sinePeriod) {
            this._accumulatedDelta = 0;
        }
        return direction;
    }
}

class MovementPatternTrackPlayerY extends MovementPattern {
    flowController: FlowController;
    owner: Actor;
    defaultDirection: Vector2;
    margin: number = 5;

    constructor(flowController: FlowController, owner: Actor, defaultDirection: Vector2 = new Vector2(-1, 0), margin: number = 5) {
        super();
        this.flowController = flowController;
        this.owner = owner;
        this.defaultDirection = defaultDirection;
        this.margin = margin;
    }

    getDirection(_: number): Vector2 {
        const player = this.flowController.getPlayerActor();
        let yDirection = 0;
        if (player) {
            if (player._body.pos.y < this.owner._body.pos.y - this.margin) {
                yDirection = -1;
            } else if (player._body.pos.y > this.owner._body.pos.y + this.margin) {
                yDirection = 1;
            }
        }
        return new Vector2(this.defaultDirection.x, yDirection);
    }
}

// enum MovementPatternType {
//     StraightLine,
//     SineWave,
//     TrackPlayerY
// }

// class MovementPatterSwitcher {
//     patternLine: MovementPatternStraightLine;
//     patternSine: MovementPatternSineWave;
//     patternTrack: MovementPatternTrackPlayerY;
//
//     constructor() {
//         this.patternLine = new MovementPatternStraightLine();
//         this.patternSine = new MovementPatternSineWave();
//         this.patternTrack = new MovementPatternTrackPlayerY();
//     }
//
//     getPattern(type: MovementPatternType): MovementPattern {
//         switch (type) {
//             case MovementPatternType.StraightLine:
//                 return this.patternLine;
//             case MovementPatternType.SineWave:
//                 return this.patternSine;
//             case MovementPatternType.TrackPlayerY:
//                 return this.patternTrack;
//             default:
//                 return new MovementPatternStraightLine();
//         }
//     }
// }


export class EnemyBase extends Actor {
    // maxHealth = DAMAGE_BASE;
    // contactDamage: number = DAMAGE_BASE;
    radius: number = 30;
    entityType: EntityType = EntityType.Enemy;
    // sprite: Sprite = new Sprite();
    // acceleration: number = 0.001;
    // maxSpeed: number = SPEED_BASE;
    // deceleration: number = 0.004;
    movementPattern: MovementPattern = new MovementPatternStraightLine();

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createBox(
            position,
            this.radius * 2,
            this.radius * 1.2,
            bodyOptions
        );
        this._body.setOffset({x:-this.radius, y:-this.radius*0.6} as SAT.Vector);
    }

    death(_: Actor | null = null) {
        super.death(_);
        if (_?.entityType === EntityType.PlayerProjectile) {
            this.flowController?.addScore(this.scoreCost);
            this.flowController?.soundController?.playSFX(
                SFXSetType.explosion,
                audioBalanceFromScreenPosition(this._body.pos.x), 1
            );
        }
        this._markedForDeletion = true;
    }

    tick(delta: number) {
        super.tick(delta);
        this.controllerDirection = this.movementPattern.getDirection(delta);
        if (this._body.pos.x < -100) {
            this.death();
        }
    }

}

export class EnemyRam extends EnemyBase {
    maxHealth = DAMAGE_BASE * 4;
    maxSpeed: number = SPEED_BASE * 0.5;
    sprite = new Sprite(['enemy-ram']);
    scoreCost = 100;
}

export class EnemyShooter extends EnemyBase {
    maxHealth = DAMAGE_BASE * 2;
    maxSpeed: number = SPEED_BASE * 0.5;
    sprite = new Sprite(['enemy-shooter']);
    weapon: WeaponEnemyShooter;
    scoreCost = 200;

    constructor() {
        super();
        this.weapon = new WeaponEnemyShooter(this);
        this.weapon.postInit();
    }

    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}

export class EnemyBomber extends EnemyBase {
    maxHealth = DAMAGE_BASE * 8;
    maxSpeed: number = SPEED_BASE * 0.3;
    sprite = new Sprite(['enemy-bomber']);
    weapon: WeaponEnemyBomber;
    scoreCost = 400;

    constructor() {
        super();
        this.weapon = new WeaponEnemyBomber(this);
        this.weapon.postInit();
    }

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createBox(
            position,
            this.radius * 2,
            this.radius * 2,
            bodyOptions
        );
        this._body.setOffset({x:-this.radius, y:-this.radius} as SAT.Vector);
    }

    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}

export class EnemyMine extends EnemyBase {
    maxHealth = DAMAGE_BASE * 4;
    maxSpeed: number = SPEED_BASE * 0.2;
    sprite = new Sprite(['enemy-mine']);
    weapon: WeaponEnemyMine;
    weaponsSecondary: WeaponEnemyMineSecondary;
    scoreCost = 500;
    exploded: boolean = false;

    constructor() {
        super();
        this.weapon = new WeaponEnemyMine(this);
        this.weapon.postInit();
        this.weaponsSecondary = new WeaponEnemyMineSecondary(this);
        this.weaponsSecondary.postInit();
    }

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createCircle(
            position,
            this.radius,
            bodyOptions
        );
    }

    death(_: Actor | null = null) {
        if (!this.exploded) {
            this.exploded = true;
            this.weapon.activate();
            this.weaponsSecondary.activate();
        }
        super.death(_);
    }
}

export class EnemySniper extends EnemyBase {
    maxHealth = DAMAGE_BASE * 2;
    maxSpeed: number = SPEED_BASE * 0.5;
    radius: number = 100;
    sprite = new Sprite(['enemy-sniper']);
    weapon: WeaponEnemySniper;
    scoreCost = 200;

    constructor() {
        super();
        this.weapon = new WeaponEnemySniper(this);
        this.weapon.postInit();
    }

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createBox(
            position,
            this.radius * 2,
            this.radius * 2,
            bodyOptions
        );
        this._body.setOffset({x:-this.radius, y:-this.radius} as SAT.Vector);
    }

    afterAttach() {
        super.afterAttach();
        if (this.flowController) {
            this.movementPattern = new MovementPatternTrackPlayerY(this.flowController, this, new Vector2(0, 0), 15);
        }
    }


    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}



export class EnemyBoss extends EnemyBase {
    maxHealth = DAMAGE_BASE * 2;
    maxSpeed: number = SPEED_BASE * 0.5;
    radius: number = 100;
    sprite = new Sprite(['boss']);
    weapon: WeaponEnemyMachineGun;
    scoreCost = 200;
    movementPattern: MovementPattern = new MovementPatternSineWave(2000, 1, 0);

    constructor() {
        super();
        this.weapon = new WeaponEnemyMachineGun(this);
        this.weapon.postInit();
    }

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createCircle(
            position,
            this.radius,
            bodyOptions
        );
    }

    afterAttach() {
        super.afterAttach();
        // if (this.flowController) {
        //     this.movementPattern = new MovementPatternTrackPlayerY(this.flowController, this, new Vector2(0, 0), 15);
        // }
    }

    death(_: Actor | null = null) {
        super.death(_);
        this.flowController?.winGame();
    }

    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}