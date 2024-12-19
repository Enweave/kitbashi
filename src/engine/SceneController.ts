import {System} from "detect-collisions";
import {FlowController} from "./FlowController.ts";
import {ASPECT_RATIO, VIEWPORT_WIDTH} from "./Constants.ts";
import {watch} from "vue";
import {Actor} from "./Actors/ActorsBase.ts";
import {Vector2} from "./Utils.ts";
import {Task} from "./MainLoop.ts";

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
        actor.attach(this.collisionSystem, this.viewportElement, position);
        this.actors.push(actor);
    }

    update(delta: number) {
        for(let actor of this.actors) {
            actor.tick(delta);
            this.collisionSystem.checkOne(actor._body, (response) => {
                console.log('collision detected', response);
            });
        }

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
}