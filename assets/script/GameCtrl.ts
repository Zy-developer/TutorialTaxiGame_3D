
/**
 * Zy.
 * 2020-08-20.
 * 游戏控制.
 */

import { _decorator, Component, Node, EventTouch, BoxColliderComponent, loader, Prefab, instantiate } from 'cc';
import { AudioManager } from './AudioManager';
import { CarManager } from './CarManager';
import { Constants } from './Constants';
import { CustomEventListener } from './CustomEventListener';
import { RunTimeData } from './RunTimeData';
import { MapManager } from './MapManager';
import { UIManager } from './UIManager';
import { LoadingUI } from './LoadingUI';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({ type: MapManager, tooltip: "地图管理.", displayOrder: 1 })
    mapMgr: MapManager = null;

    @property({ type: CarManager, tooltip: "小车管理.", displayOrder: 2 })
    carMgr: CarManager = null;

    @property({ type: LoadingUI, tooltip: "加载页UI.", displayOrder: 3 })
    loadingUI: LoadingUI = null;

    @property({type: Node, tooltip: "地板."})
    group: Node = null;

    private _progress: number = 5;

    onLoad() {
        this.loadingUI.show();
        this.loadMap(1);
        const collider = this.group.getComponent(BoxColliderComponent);
        collider.setGroup(Constants.CarGroup.NORMAL);
        collider.setMask(-1);
    }

    start() {
        // Your initialization goes here.

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        CustomEventListener.on(Constants.EventName.GAME_START, this.gameStart, this);
        CustomEventListener.on(Constants.EventName.GAME_OVER, this.gameOver, this);
        CustomEventListener.on(Constants.EventName.NEW_LEVEL, this.newLevel, this);

        AudioManager.playMusic(Constants.AudioSource.BACKGROUND);

        // UIManager.showDialog(Constants.UIPage.mainUI);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    private gameStart() {
        UIManager.hideDialog(Constants.UIPage.mainUI);
        UIManager.showDialog(Constants.UIPage.gameUI);
    }

    private gameOver() {
        UIManager.hideDialog(Constants.UIPage.gameUI);
        UIManager.showDialog(Constants.UIPage.resultUI);
    }

    private newLevel() {
        UIManager.hideDialog(Constants.UIPage.resultUI);
        UIManager.showDialog(Constants.UIPage.mainUI);
        this.mapMgr.recycle();
        this.loadMap(1);
    }

    /** 触摸开始. */
    private onTouchStart(event: EventTouch) {
        // console.log("touch start: ", event);
        this.carMgr.controlMoving();
    }

    /** 触摸结束. */
    private onTouchEnd(event: EventTouch) {
        // console.log("touch end: ", event);
        this.carMgr.controlMoving(false);
    }

    private reset() {
        RunTimeData.reset();
        this.mapMgr.resetMap();
        this.carMgr.reset(this.mapMgr.currentPath);
        RunTimeData.instance().currentProgress = 0;
        RunTimeData.instance().maxProgress = this.mapMgr.maxProgress;
    }

    private loadMap(level: number, callback?: Function) {
        let map = "map/map";
        if (level >= 100) {
            map += `${level}`;
        } else if (level >= 10) {
            map += `1${level}`;
        } else {
            map += `10${level}`;
        }
        map = "map/map101";
        this._progress = 5;
        this.scheduleOnce(this.loadingSchedule, 0.2);
        loader.loadRes(map, Prefab, (err, prefab: Prefab) => {
            if (err || !prefab) { return console.warn(err); }
            const mapNode = instantiate(prefab);
            mapNode.parent = this.mapMgr.node;
            this.reset();
            this._progress = 0;
            callback && callback();
            callback = null;
            CustomEventListener.emit(Constants.EventName.FINISH_PROGRESS);
            UIManager.showDialog(Constants.UIPage.mainUI);
        });
    }

    private loadingSchedule() {
        if (this._progress <= 0) return;
        CustomEventListener.emit(Constants.EventName.UPDATE_PROGRESS, 40 / 5);
        this._progress--;
        this.scheduleOnce(this.loadingSchedule, 0.2);
    }

}
