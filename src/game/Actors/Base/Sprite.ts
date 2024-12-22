export class Sprite {
  htmlElement: HTMLElement;
  rootElement: HTMLElement | null = null;
  extraClasses: string[] = [];

  constructor(extraClasses: string[] = []) {
    this.extraClasses = extraClasses;
    this.htmlElement = document.createElement('div');
    this.htmlElement.className = 'sprite';
    this.extraClasses.forEach((className) => {
      this.htmlElement.classList.add(className);
    });
  }

  updatePosition(x: number, y: number) {
    this.htmlElement.style.transform = `translate(${x}px, ${y}px)`;
  }

  attachToRoot(htmlRoot: HTMLElement) {
    this.rootElement = htmlRoot;
    htmlRoot.appendChild(this.htmlElement);
  }
}
