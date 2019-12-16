import SimpleMovement from '../types/SimpleMoevement';

import { ISnakeModel } from '../model/SnakeModel';
import { ISnakeView } from '../view/SnakeView';

export interface ISnakeController {
    injectModel(ISnakeModel) :void;
    injectView(ISnakeView) :void;
    setHeadMovement(SimpleMovement) :void;
}

export class SnakeController implements ISnakeController {
    private model :ISnakeModel;
    private view :ISnakeView;
    private isMovementInitialised :boolean = false;
    private isGameFailed :boolean = false;
    constructor(private width :number, private height :number, private interval :number) {
        this.moveSnake();
    }
    public injectModel(model :ISnakeModel) {
        this.model = model;
        model.injectController(this);
        model.onAppleCaptured(() => {
            this.setRandomApple();
            this.model.setSnakeLenghtIncrement(3);
            this.model.incrementScore();
        });
        model.onFail(() => {
            this.isMovementInitialised = false;
            this.isGameFailed = true;
        });
    }
    public injectView(view :ISnakeView) {
        this.view = view;
    }
    private moveSnake() {
        !this.isGameFailed && this.model && this.model.addHead();
        setTimeout(() => {this.moveSnake()}, this.interval);
    }
    public setHeadMovement(movement :SimpleMovement) :void {
        if (this.isGameFailed) {
            this.isGameFailed = false;
            this.model.reset();
            this.model.setSnakeLenghtIncrement(3);
        }
        this.isGameFailed = false;
        if (!this.isMovementInitialised) {
            this.setRandomApple();
            this.isMovementInitialised = true;
        }
        this.model.setMovement(movement);
    }

    private setRandomApple() {
        const x :number = Math.trunc(Math.random() * this.width);
        const y :number = Math.trunc(Math.random() * this.height);
        this.model.setApplePosition({x, y});
    }
}
