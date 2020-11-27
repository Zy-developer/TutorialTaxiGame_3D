
/**
 * Zy.
 * YYYY-MM-dd
 * 文件功能描述.
 */

import { _decorator, Component, Node } from 'cc';
import { Constants } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('Configuration')
export class Configuration {
    
    static _instance: Configuration = null;
    public static instance() {
        if (!this._instance) {
            this._instance = new Configuration();
        }
        return this._instance;
    }

    private _jsonData = {};
    private _markSave = false;
    public init() {
        const localStorage = cc.sys.localStorage.getItem(Constants.GameConfigID);
        if (localStorage) {
            this._jsonData = JSON.parse(localStorage);
        }
        setInterval(this.scheduleSave, 500);
    }

    public getConfigData(key: string) {
        const data = this._jsonData[key];
        return data || "";
    }

    public setConfigData(key: string, value: any) {
        if (!value) { return; }
        this._jsonData[key] = value;
        this._markSave = true;
    }

    private scheduleSave() {
        if (!this._markSave) { return; }
        this._markSave = false;
        const data = JSON.stringify(this._jsonData);
        cc.sys.localStorage.setItem(data);
    }
    
}
