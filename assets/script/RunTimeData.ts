
/**
 * Zy.
 * 2020-09-04.
 * 游戏数据.
 */

import { _decorator } from 'cc';
import { Configuration } from './Configuration';
import { Constants } from './Constants';
const { ccclass } = _decorator;

@ccclass('RunTimeData')
export class RunTimeData {
    
    private static _instance: RunTimeData = null;

    public currentProgress = 0;
    public maxProgress = 0;
    public isTakeOver = true;
    public playerData: PlayerData = null;

    public static instance() {
        if (!this._instance) {
            this._instance = new RunTimeData();
        }
        return this._instance;
    }

    public static reset() {
        if (!this._instance) { return; }
        this._instance.currentProgress = 0;
        this._instance.maxProgress = 0;
        this._instance.isTakeOver = true;
    }

    constructor() {
        this.playerData = PlayerData.instance();
    }

    public get currLevel() {
        return this.playerData.playerInfo.level;
    }

    public get totalMoney() {
        return this.playerData.playerInfo.money;
    }

}


interface IPlayerInfo {
    money: number,
    level: number,
}

@ccclass('PlayerData')
export class PlayerData {
    
    private static _instance: PlayerData = null;

    public static instance() {
        if (!this._instance) {
            this._instance = new PlayerData();
        }
        return this._instance;
    }

    public playerInfo: IPlayerInfo = { money: 0, level: 1 };

    public loadFromCache() {
        const info = Configuration.instance().getConfigData(Constants.PlayerConfigID);
        if (info) {
            this.playerInfo = info;
        }
    }

    public passLevel(rewardMoney: number) {
        this.playerInfo.level++;
        this.playerInfo.money += rewardMoney;
        this.savePlayerInfoToCache();
    }

    public savePlayerInfoToCache() {
        Configuration.instance().setConfigData(Constants.PlayerConfigID, this.playerInfo);
    }

}
