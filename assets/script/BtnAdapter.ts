
/**
 * Zy.
 * 2020-11-12.
 * 按钮适配器.
 */

import { _decorator, Component, Node, ButtonComponent } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('BtnAdapter')
export class BtnAdapter extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({tooltip: "当前播放的音效名称."})
    soundName = "";

    @property({tooltip: "延迟时间."})
    delayTime = 0;

    start () {
        // Your initialization goes here.
        this.node.on(ButtonComponent.EventType.CLICK, this.onClicked, this);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onClicked() {
        if (!this.soundName || !this.soundName.length) return;
        this.scheduleOnce(() => {
            AudioManager.playSound(this.soundName);
        }, this.delayTime);
    }

}
