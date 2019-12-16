import SimpleMovement from '../types/SimpleMoevement';

import { ISnakeModel } from '../model/SnakeModel';
import { ISnakeController } from '../controller/SnakeController';

export interface ISnakeView {
    injectModel(ISnakeModel) :void;
    injectController(ISnakeController) :void;
}

export class SnakeView implements ISnakeView {
    private model :ISnakeModel;
    private controller :ISnakeController;
    private keyboardCommands :Map<string, SimpleMovement> = new Map<string, SimpleMovement> ();
    
    private apple :SVGRectElement;
    private snakeBody :SVGRectElement[] = [];
    constructor(
        private width :number,
        private height :number,
        private field :SVGSVGElement,
        private scoreDom :HTMLDivElement,
        private pixelSize :number = 10
    ) {
        this.field.setAttributeNS(null, 'width', `${pixelSize*width}px`);
        this.field.setAttributeNS(null, 'height', `${pixelSize*height}px`);
        
        this.initCommands();
        document.addEventListener('keydown', ({ code }) => {
            const command = this.keyboardCommands.get(code);
            if (!command) return;
            this.controller.setHeadMovement(command);
        });
        this.apple = this.getSvgSquare('green', -1, -1);
        this.field.appendChild(this.apple);
    }

    public injectModel(model :ISnakeModel) {
        this.model = model;
        model.injectView(this);
        model.onAppleChange((newPosition :{x:number, y:number}) => {
            this.setApplePosition(newPosition.x, newPosition.y);
        });
        model.onSnakeHeadAdd((newPosition :{x:number, y:number}) => {
            this.addPixel('red', newPosition.x, newPosition.y);
        });
        model.onSnakeBodyRemove((oldPosition :{x:number, y:number}) => {
            this.removePixel('red', oldPosition.x, oldPosition.y);
        });
        model.setSnakeLenghtIncrement(3);
        model.onScoreChange(newScore => {
            this.scoreDom.innerHTML = newScore.toString();
        });
    }
    public injectController(controller :ISnakeController) {
        this.controller = controller;
        controller.injectView(this);
    }

    private removePixel(color :string, xPos :number, yPos :number) {
        const x :number = xPos * this.pixelSize;
        const y :number = yPos * this.pixelSize;
        const pixelToRemove = this.field.querySelector(`rect[fill="${color}"][x="${x}"][y="${y}"]`);
        pixelToRemove && pixelToRemove.remove();
    }

    private initCommands () :void {
        this.keyboardCommands.set('ArrowUp', {x:0, y:-1});
        this.keyboardCommands.set('ArrowDown', {x:0, y:1});
        this.keyboardCommands.set('ArrowLeft', {x:-1, y:0});
        this.keyboardCommands.set('ArrowRight', {x:1, y:0});
    }

    private getSvgSquare (color: string, x :number, y :number) :SVGRectElement {
        const element :SVGRectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        element.setAttributeNS(null, 'fill', color);
        this.setSvgSquarePosition(element, x, y);
        element.setAttributeNS(null, 'width', this.pixelSize.toString());
        element.setAttributeNS(null, 'height', this.pixelSize.toString());
        return element;
    }

    private setSvgSquarePosition(square :SVGRectElement, x :number, y :number) {
        square.setAttributeNS(null, 'x', (this.pixelSize * x).toString());
        square.setAttributeNS(null, 'y', (this.pixelSize * y).toString());
    }

    private setApplePosition(x :number, y :number) :void {
        // console.log(x, y, this.apple);
        this.setSvgSquarePosition(this.apple, x, y);
    }

    private addPixel(color :string, x :number, y :number) {
        const pixel :SVGRectElement = this.getSvgSquare(color, x, y);
        this.field.appendChild(pixel);
    }

    addSnakeBodyHead(x :number, y :number) :void {
        const newHead :SVGRectElement = this.getSvgSquare('red', x, y);
        this.snakeBody.unshift(newHead);
        this.field.appendChild(newHead);
    }

    removeLastSnakeBodyQueue() :void {
        if (!this.snakeBody.length) {
            return;
        }

        const lastSnakeBodyqueue = this.snakeBody.splice(-1);
        lastSnakeBodyqueue[0].remove();
    }
}
