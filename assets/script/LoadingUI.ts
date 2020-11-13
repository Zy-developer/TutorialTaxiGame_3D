
/**
 * Zy.
 * 2020-11-13.
 * 加载页UI.
 */

import { _decorator, Component, Node } from 'cc';
import { Constants } from './Constants';
import { CustomEventListener } from './CustomEventListener';
import { UpdateLabelValue } from './UpdateLabelValue';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends Component {
    
    @property({type: UpdateLabelValue, tooltip: "进度显示."})
    progressLabel: UpdateLabelValue = null;

    private _progress: number = 0;

    onEnable() {
        CustomEventListener.on(Constants.EventName.UPDATE_PROGRESS, this.onUpdateProgress, this);
        CustomEventListener.on(Constants.EventName.FINISH_PROGRESS, this.finishLoading, this);
    }

    // onLoad() {}

    start () {
        // Your initialization goes here.
    }

    // update (dt: number) {
    //     // Your update function goes here.
    // }

    public show() {
        this.node.active = true;
        this._progress = 50;
        this.progressLabel.playUpdateValue(this._progress, this._progress, 0);
    }

    public hide() {
        this.node.active = false;
    }

    private onUpdateProgress(value: number) {
        this._progress += value;
        this.progressLabel.playUpdateValue(this._progress - value, this._progress, 0.2);
    }

    private finishLoading() {
        this.progressLabel.playUpdateValue(this._progress, 100, 0.2);
        this._progress = 100;
        this.scheduleOnce(this.hide, 0.5);
    }

}
