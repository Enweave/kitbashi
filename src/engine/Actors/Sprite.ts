export class Sprite {
    htmlElement: HTMLElement;
    rootElement: HTMLElement | null = null;

    constructor() {
        this.htmlElement = document.createElement('div');
        this.htmlElement.className = 'sprite';
    }

    updatePosition(x: number, y: number) {
        this.htmlElement.style.transform = `translate(${x}px, ${y}px)`;
    }

    attachToRoot(htmlRoot: HTMLElement) {
        this.rootElement = htmlRoot;
        htmlRoot.appendChild(this.htmlElement);
    };
}