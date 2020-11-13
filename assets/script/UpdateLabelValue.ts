
/**
 * Zy.
 * 2020-11-13.
 * 更新Label的值.
 */

import { _decorator, Component, Node, LabelComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpdateLabelValue')
export class UpdateLabelValue extends LabelComponent {
    
    // @property({type: Node, tooltip: "."})
    // node: Node = null;

    private _startValue: number = 0;
    private _endValue: number = 0;
    private _diffValue: number = 0;
    private _currTime: number = 0;
    private _changeTime: number = 0;
    private _isPlaying: boolean = false;

    // onLoad() {}

    start () {
        // Your initialization goes here.
    }

    update (dt: number) {
        // Your update function goes here.
        if (!this._isPlaying) return;
        if (this._currTime < this._changeTime) {
            this._currTime += dt;
            const targetValue = this._startValue + Math.floor((this._currTime / this._changeTime) + this._diffValue);
            this.string = `${targetValue}`;
            return;
        }
        this.string = `${this._endValue}`;
        this._isPlaying = false;
    }

    public playUpdateValue(start: number, end: number, changeTime: number) {
        this._startValue = start;
        this._endValue = end;
        this._diffValue = end - start;
        this._currTime = 0;
        this._changeTime = changeTime;

        if (changeTime === 0) {
            this.string = `${end}`;
            return;
        }
        this.string = `${start}`;
        this._isPlaying = true;
    }

}
