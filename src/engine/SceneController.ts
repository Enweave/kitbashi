import {System} from "detect-collisions";
import {FlowController} from "./FlowController.ts";
import {ASPECT_RATIO, VIEWPORT_WIDTH} from "./Constants.ts";
import {watch} from "vue";
import {Actor} from "./Actors/Base/ActorsBase.ts";
import {Vector2} from "./Utils.ts";
import {Task} from "./MainLoop.ts";
import {ActorInteractions} from "./Actors/Interactions.ts";

export class Scene implements Task{
    VIEWPORT_WIDTH = VIEWPORT_WIDTH;
    VIEWPORT_HEIGHT = this.VIEWPORT_WIDTH / ASPECT_RATIO

    collisionSystem: System;
    viewportElement: HTMLElement;
    debugCanvasElement: HTMLCanvasElement;
    flowController: FlowController;
    actors: Actor[] = [];

    constructor(inFlowController: FlowController, inViewportElement: HTMLElement, inDebugCanvasElement: HTMLCanvasElement) {
        this.debugCanvasElement = inDebugCanvasElement;
        this.flowController = inFlowController;
        this.collisionSystem = new System();

        this.viewportElement = inViewportElement;
        this.viewportElement.style.width = `${this.VIEWPORT_WIDTH}px`;
        this.viewportElement.style.height = `${this.VIEWPORT_HEIGHT}px`;

        this.debugCanvasElement.width = this.VIEWPORT_WIDTH;
        this.debugCanvasElement.height = this.VIEWPORT_HEIGHT;

        this.updateViewportZoom();

        watch(this.flowController.viewportContainerSize, () => {
            this.updateViewportZoom();
        });
    }

    updateViewportZoom() {
        const zoomValue = this.flowController.viewportContainerSize.value.x / this.VIEWPORT_WIDTH;
        this.viewportElement.style.transform = `scale(${zoomValue})`;
    }

    addActor(actor: Actor, position: Vector2) {
        actor.attach(this.collisionSystem, this.viewportElement, position, this.flowController);
        this.actors.push(actor);
    }

    removeActor(actor: Actor) {
        actor.sprite.htmlElement.remove();
        this.collisionSystem.remove(actor._body);
    }

    drawDebugCollisions() {
        if (this.flowController.showDebugCanvas.value) {
            const ctx = this.debugCanvasElement.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = "#FFFFFF";

                ctx.clearRect(0, 0, this.VIEWPORT_WIDTH, this.VIEWPORT_HEIGHT);
                ctx.beginPath();
                this.collisionSystem.draw(ctx);
                ctx.stroke();
            }
        }
    }

    update(delta: number) {
        let actorsToRemove: Actor[] = [];

        for(let actor of this.actors) {
            if (actor._markedForDeletion) {
                actorsToRemove.push(actor);
                this.removeActor(actor);
            } else {
                actor.tick(delta);
                this.collisionSystem.checkOne(actor._body, (response) => {
                    ActorInteractions.dispatchCollision(response);
                });
            }
        }

        this.drawDebugCollisions()

        // One day I'll implement object pooling, pinky promise
        if (actorsToRemove.length > 0) {
            this.actors = this.actors.filter((actor) => !actor._markedForDeletion);
        }

        if (this.flowController._spawnActorQueue.length > 0) {
            const actor = this.flowController._spawnActorQueue.shift() as Actor;
            this.addActor(actor, actor.spawnPosition);
        }
    }
}