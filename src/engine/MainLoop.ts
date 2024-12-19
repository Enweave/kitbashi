import {FlowController} from "./FlowController.ts";
import {watch} from "vue";

export interface Task {
    update: (delta: number) => void;
}

export class MainLoop {
    private tasks: Task[] = [];
    private loopHandle: number | null = null;
    private lastTime = 0;
    private FPS: number = 64;
    private frameDuration = 1000 / this.FPS;
    private flowController: FlowController;

    constructor(inFlowController: FlowController) {
        console.log('MainLoop created');
        this.flowController = inFlowController;

        watch(this.flowController.paused, (newVal) => {
            if (newVal) {
                this.stop();
            } else {
                this.start();
            }
        });
    }

    addTask(task: Task) {
        this.tasks.push(task);
    }

    clearTasks() {
        this.tasks = [];
    }

    start() {
        this.lastTime = Date.now() - this.frameDuration;
        let handler = () => {
            this.loopHandle = requestAnimationFrame(handler);
            const currentTime = Date.now();
            const delta = currentTime - this.lastTime;
            if (delta > this.frameDuration) {
                this.lastTime = currentTime;
                this.update(delta);
            }
        }
        handler();
    }

    stop() {
        this.loopHandle && cancelAnimationFrame(this.loopHandle);
    }

    private update(delta: number) {
        this.tasks.forEach(task => task.update(delta));
    }
}