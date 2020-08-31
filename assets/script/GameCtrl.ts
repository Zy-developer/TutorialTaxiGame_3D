
/**
 * Zy.
 * 2020-08-20.
 * 游戏控制.
 */

import { _decorator, Component, Node, EventTouch, BoxColliderComponent } from 'cc';
import { AudioManager } from './AudioManager';
import { CarManager } from './CarManager';
import { Constants } from './Constants';
import { MapManager } from './MapManager';
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

    @property({type: Node, tooltip: "地板."})
    group: Node = null;

    onLoad() {
        this.mapMgr.resetMap();
        this.carMgr.reset(this.mapMgr.currentPath);

        const collider = this.group.getComponent(BoxColliderComponent);
        collider.setGroup(Constants.CarGroup.NORMAL);
        collider.setMask(-1);
    }

    start() {
        // Your initialization goes here.

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        AudioManager.playMusic(Constants.AudioSource.BACKGROUND);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

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
}
