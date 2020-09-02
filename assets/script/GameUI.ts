
/**
 * Zy.
 * 2020-09-01.
 * 游戏页UI.
 */

import { _decorator, Component, Node, LabelComponent, SpriteComponent, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({type: LabelComponent, tooltip: "当前等级.", displayOrder: 1})
    currentLevel: LabelComponent = null;

    @property({type: LabelComponent, tooltip: "目标等级.", displayOrder: 2})
    targetLevel: LabelComponent = null;

    @property({type: SpriteComponent, tooltip: "当前进度.", displayOrder: 3})
    currentSprite: SpriteComponent = null;

    @property({type: SpriteComponent, tooltip: "完成进度.", displayOrder: 4})
    targetSprite: SpriteComponent = null;

    @property({type: SpriteFrame, tooltip: "未完成等级纹理.", displayOrder: 5})
    levelUnFinished: SpriteFrame = null;

    @property({type: SpriteFrame, tooltip: "完成等级纹理.", displayOrder: 6})
    levelFinished: SpriteFrame = null;

    @property({type: SpriteFrame, tooltip: "订单未完成纹理.", displayOrder: 7})
    orderUnCompeteSF: SpriteFrame = null;

    @property({type: SpriteFrame, tooltip: "订单进行中纹理.", displayOrder: 8})
    ordingSF: SpriteFrame = null;

    @property({type: SpriteFrame, tooltip: "订单完成纹理.", displayOrder: 9})
    orderCompeteSF: SpriteFrame = null;

    @property({type: [SpriteComponent], tooltip: "进度.", displayOrder: 10})
    progress: SpriteComponent[] = [];

    @property({type: SpriteComponent, tooltip: "头像.", displayOrder: 11})
    avatar: SpriteComponent = null;

    @property({type: LabelComponent, tooltip: "对话内容.", displayOrder: 12})
    content: LabelComponent = null;

    @property({type: Node, tooltip: "对话节点.", displayOrder: 13})
    talkNode: Node = null;

    @property({type: Node, tooltip: "引导节点.", displayOrder: 14})
    guideNode: Node = null;

    start () {
        // Your initialization goes here.
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    public show(...args: any[]) {

    }

    public hide() {
        
    }
    
}
