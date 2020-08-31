
/**
 * Zy.
 * 2020-08-20.
 * 小车管理.
 */

import { _decorator, Component, Node, loader, Prefab, instantiate } from 'cc';
import { Car } from './Car';
import { Constants } from './Constants';
import { CustomEventListener } from './CustomEventListener';
import { PoolManager } from './PoolManager';
import { RoadPoint, RoadPointType } from './RoadPoint';
const { ccclass, property } = _decorator;

@ccclass('CarManager')
export class CarManager extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: Car, tooltip: "小车." })
    mainCar: Car = null;

    /** 当前路径点. */
    private _currentPath: Node[] = [];
    private _aiCars: Car[] = [];

    start() {
        // Your initialization goes here.

        CustomEventListener.on(Constants.EventName.GAME_OVER, this.gameOver, this);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    /** 重置小车. */
    public reset(points: Node[]) {
        if (!points || points.length <= 0) { return; }
        this.createMainCar(points[0]);
        this._currentPath = points;
        this.startSchedule();
    }

    /** 控制运动. */
    public controlMoving(isRuning: boolean = true) {
        if (isRuning) {
            this.mainCar.startRuning();
        } else {
            this.mainCar.stopRuning();
        }
    }

    private createMainCar(point: Node) {
        this.mainCar.setEntry(point, true);
    }

    private startSchedule() {
        for (let i = 1, node: Node, roadPoint: RoadPoint; i < this._currentPath.length; ++i) {
            node = this._currentPath[i];
            roadPoint = node.getComponent(RoadPoint);
            roadPoint.startSchedule(this.createEnemy.bind(this));
        }
    }

    private stopSchedule() {
        for (let i = 1, node: Node, roadPoint: RoadPoint; i < this._currentPath.length; ++i) {
            node = this._currentPath[i];
            roadPoint = node.getComponent(RoadPoint);
            roadPoint.stopSchedule();
        }
    }

    private gameOver() {
        this.stopSchedule();
        for (let i = 0; i < this._aiCars.length; i++) {
            const car = this._aiCars[i];
            car.stopImmediately();
        }
    }

    private createEnemy(roadPoint: RoadPoint, carId: string) {
        const self = this;
        loader.loadRes(`car/car${carId}`, Prefab, (err, prefab: Prefab) => {
            if (err || !prefab) { return console.warn(`===> load car/car${carId} error: ${err}, prefab: `, prefab); }
            const node = PoolManager.getNode(prefab, self.node);
            const car = node.getComponent(Car);
            this._aiCars.push(car);
            car.setEntry(roadPoint.node);
            car.maxSpeed = roadPoint.speed;
            car.startRuning();
            car.moveAfterFinished(this.recycleAICar.bind(this));
        });
    }

    private recycleAICar(car: Car) {
        const index = this._aiCars.indexOf(car);
        if (index < 0) { return; }
        PoolManager.putNode(car.node);
        this._aiCars.splice(index, 1);
    }
}
