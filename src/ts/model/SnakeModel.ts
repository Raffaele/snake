import SimpleMovement from '../types/SimpleMoevement';

import { ISnakeView } from '../view/SnakeView';
import { ISnakeController } from '../controller/SnakeController';

type Point = {
    x :number,
    y :number
};

export interface ISnakeModel {
    injectController(ISnakeModel) :void;
    injectView(ISnakeView) :void;
    setMovement(SimpleMovement) :void;
    setSnakeLenghtIncrement(number) :void;
    addHead() :void;
    onAppleChange (Function) :void;
    offAppleChange (Function) :void;
    onSnakeHeadAdd (Function) :void;
    offSnakeHeadAdd (Function) :void;
    onSnakeBodyRemove (Function) :void;
    offSnakeBodyRemove (Function) :void;
    onAppleCaptured (Function) :void;
    offAppleCaptured (Function) :void;
    onScoreChange (Function) :void;
    offScoreChange (Function) :void;
    onFail (Function) :void;
    offFail (Function) :void;
    setApplePosition(Point) :void;
    incrementScore() :void;
    reset() :void;
}

export class SnakeModel implements ISnakeModel {
    private controller :ISnakeController;
    private view :ISnakeView;
    private applePosition :Point;
    private snakeBody :Point[];
    private movement :SimpleMovement;
    private snakeLengthIncrement :number;
    private appleChangeCallbacks :Function[] = [];
    private snakeHeadAddCallbacks :Function[] = [];
    private snakeBodyRemoveCallbacks :Function[] = [];
    private appleCatpuredCallbacks :Function[] = [];
    private scoreChangeCallbacks :Function[] = [];
    private failCallbacks :Function[] = [];
    private score :number;
    constructor (private width :number, private height :number) {
        this.initSnakeBody();
        this.applePosition = null;
        this.snakeLengthIncrement = 0;
        this.score = 0;
    }
    private initSnakeBody() :void {
        this.snakeBody = [{
            x: Math.trunc(this.width/2),
            y: Math.trunc(this.height/2)
        }];
    }
    public injectController(controller :ISnakeController) :void {
        this.controller = controller;
    }
    public injectView(view :ISnakeView) :void {
        this.view = view;
    }
    public setMovement(movement :SimpleMovement) :void {
        this.movement = movement;
    }
    public setSnakeLenghtIncrement(increment :number) :void {
        this.snakeLengthIncrement += increment;
    }
    public reset() :void {
        this.snakeBody.forEach(position => {
            this.propagateQueueRemove(position);
        });
        this.initSnakeBody();
        this.score = 0;
    }

    public incrementScore() :void {
        this.score++;
        this.scoreChangeCallbacks.forEach(callback => {
            callback(this.score);
        });
    }

    private addEvent(eventList :Function[], callback :Function) :void {
        eventList.push(callback);
    }

    private removeEvent(eventList :Function[], callback :Function) :void {
        const indexToRemove = eventList.indexOf(callback);
        if (indexToRemove > -1) {
            eventList.splice(indexToRemove, 1);
        }
    }

    public onAppleChange(callback :Function) {
        this.addEvent(this.appleChangeCallbacks, callback);
    }
    public onSnakeHeadAdd(callback :Function) {
        this.addEvent(this.snakeHeadAddCallbacks, callback);
    }
    public onSnakeBodyRemove(callback :Function) {
        this.addEvent(this.snakeBodyRemoveCallbacks, callback);
    }
    public onAppleCaptured(callback :Function) {
        this.addEvent(this.appleCatpuredCallbacks, callback);
    }
    public onScoreChange(callback :Function) {
        this.addEvent(this.scoreChangeCallbacks, callback);
    }
    public onFail(callback :Function) {
        this.addEvent(this.failCallbacks, callback);
    }

    public offAppleChange(callback :Function) {
        this.removeEvent(this.appleChangeCallbacks, callback);
    }
    public offSnakeHeadAdd(callback :Function) {
        this.removeEvent(this.snakeHeadAddCallbacks, callback);
    }
    public offSnakeBodyRemove(callback :Function) {
        this.removeEvent(this.snakeBodyRemoveCallbacks, callback);
    }
    public offAppleCaptured(callback :Function) {
        this.removeEvent(this.appleCatpuredCallbacks, callback);
    }
    public offScoreChange(callback :Function) {
        this.removeEvent(this.scoreChangeCallbacks, callback);
    }
    public offFail(callback :Function) {
        this.removeEvent(this.failCallbacks, callback);
    }
    private propagateAddHead(newPosition :Point) :void {
        this.snakeHeadAddCallbacks.forEach((callback) => {
            callback(newPosition);
        });
    }

    private propagateQueueRemove(oldPosition :Point) :void {
        this.snakeBodyRemoveCallbacks.forEach((callback) => {
            callback(oldPosition);
        });
    }

    public setApplePosition(position :Point) {
        this.applePosition = position;
        this.appleChangeCallbacks.forEach(callback => {
            callback(position);
        });
    }

    private propagateAppleCatpured(position :Point) {
        this.appleCatpuredCallbacks.forEach(cb => {
            cb(position);
        });
    }

    private propagateFail() {
        this.failCallbacks.forEach(cb => {
            cb();
        });
    }

    private isInvalidHeadPosition(x :number, y :number) :boolean {
        const isOutOfBound =  x<0 || y < 0 || x >= this.width || y >= this.height;
        const isAutoMatching = this.snakeBody.some(position => {
            return position.x === x && position.y === y;
        });
        return isOutOfBound || isAutoMatching;
    }

    public addHead() :void {
        if(!this.movement) {
            return;
        }
        const oldHeadPosition = this.snakeBody[0];
        const x = oldHeadPosition.x + this.movement.x;
        const y = oldHeadPosition.y + this.movement.y;
        const newHeadPosition :Point = { x, y };
        if (x === this.applePosition.x && y === this.applePosition.y) {
            this.propagateAppleCatpured(newHeadPosition);
        }
        if (this.isInvalidHeadPosition(x, y)) {
            this.propagateFail();
            return;
        }
        this.snakeBody.unshift(newHeadPosition);
        this.propagateAddHead(newHeadPosition);
        if (this.snakeLengthIncrement > 0) {
            this.snakeLengthIncrement--;
        } else {
            const lastBodyPixel = this.snakeBody.pop();
            this.propagateQueueRemove(lastBodyPixel);
        }
    }
}
