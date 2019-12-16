import { SnakeView, ISnakeView } from './view/SnakeView';
import { SnakeController, ISnakeController } from './controller/SnakeController';
import { SnakeModel, ISnakeModel } from './model/SnakeModel';

window.addEventListener('load', () => {
    const snakeField :SVGSVGElement = document.querySelector('#snake-field');
    const scoreField :HTMLDivElement = document.querySelector('#score-dom');
    const FIELD_WIDTH :number = 50;
    const FIELD_HEIGHT :number = 50;
    let delay = 200;
    const view :ISnakeView = new SnakeView(FIELD_WIDTH, FIELD_HEIGHT, snakeField, scoreField);
    const controller :ISnakeController = new SnakeController(FIELD_WIDTH, FIELD_HEIGHT, delay);
    const model :ISnakeModel = new SnakeModel(FIELD_WIDTH, FIELD_HEIGHT);

    view.injectController(controller);
    view.injectModel(model);
    controller.injectModel(model);
});
