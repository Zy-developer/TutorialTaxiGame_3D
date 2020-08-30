
/**
 * Zy.
 * 2020-08-20.
 * 小车.
 */

import { _decorator, Component, Node, Vec3, ParticleSystemComponent } from 'cc';
import { AudioManager } from './AudioManager';
import { Constants } from './Constants';
import { CustomEventListener } from './CustomEventListener';
import { RoadPoint, RoadMoveType, RoadPointType } from './RoadPoint';
const { ccclass, property } = _decorator;

@ccclass('Car')
export class Car extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    private static tempVec: Vec3 = new Vec3();

    /** 当前路线点对象. */
    private _currentRoadPoint: RoadPoint = null;
    /** 起始点. */
    private _pointA: Vec3 = new Vec3();
    /** 结束点. */
    private _pointB: Vec3 = new Vec3();
    /** 速度. */
    private _currentSpeed: number = .1;
    /** 移动状态. */
    private _isMoving: boolean = false;
    /** 偏移量. */
    private _offset: Vec3 = new Vec3();
    /** 触摸状态. */
    private _touchState: boolean = false;
    /** 原始角度. */
    private _originRotation: number = 0;
    /** 目标角度. */
    private _targetRotation: number = 0;
    /** 中心点. */
    private _centerPoint: Vec3 = new Vec3();
    private _rotMeasure: number = 0;
    /** 玩家小车标记. */
    private _isMain: boolean = false;
    /** 是否订单中状态. */
    private _isInOrder: boolean = false;
    /** 加速度. */
    private _acceleration: number = .1;
    /** 是否刹车状态. */
    private _isBraking: boolean = false;
    /** 汽车尾气. */
    private _gesParticle: ParticleSystemComponent = null;
    private _overCallback: Function = null;

    public maxSpeed: number = 1;

    start() {
        // Your initialization goes here.

        CustomEventListener.on(Constants.EventName.FININSHED_WALK, this.onWalkFinished, this);
    }

    update(deltaTime: number) {
        // Your update function goes here.
        if (!this._isMoving || this._isInOrder) {
            return;
        }
        // 更新移动.
        this._offset = this.node.worldPosition;
        
        this._currentSpeed += this._acceleration * deltaTime;
        if (this._currentSpeed > .5) {
            this._currentSpeed = .5;
        }
        if (this._currentSpeed <= .001) {
            this._isMoving = false;
            if (this._isBraking) {
                this._isBraking = false;
                CustomEventListener.emit(Constants.EventName.END_BRAKING);
            }
        }

        switch (this._currentRoadPoint.moveType) {
            case RoadMoveType.LINE: // 直线.
                this.updateLine();
                break;
            case RoadMoveType.CURVE: // 转弯.
                this.updateCurve();
                break;
        }
        this.node.worldPosition = this._offset;
        Vec3.subtract(Car.tempVec, this._pointB, this._offset);
        // console.log(`===> car update ${this.node.worldPosition}, ${Car.tempVec}, ${this._pointB}, ${this._pointA}.`);
        if (Car.tempVec.length() <= 0.01) {
            this.arrivalStation();
        }
    }

    /** 直线更新位置. */
    updateLine() {
        const z = this._pointB.z - this._pointA.z;
        const x = this._pointB.x - this._pointA.x;
        if (z !== 0) {
            if (z > 0) {
                this._offset.z += this._currentSpeed;
                if (this._offset.z > this._pointB.z) this._offset.z = this._pointB.z;
            } else {
                this._offset.z -= this._currentSpeed;
                if (this._offset.z < this._pointB.z) this._offset.z = this._pointB.z;
            }
        } else if (x !== 0) {
            if (x > 0) {
                this._offset.x += this._currentSpeed;
                if (this._offset.x > this._pointB.x) this._offset.x = this._pointB.x;
            } else {
                this._offset.x -= this._currentSpeed;
                if (this._offset.x < this._pointB.x) this._offset.x = this._pointB.x;
            }
        }
    }

    /** 弯路更新位置. */
    updateCurve() {
        const offsetRotation = this._targetRotation - this._originRotation;
        const currentRotation = this.conversionAngle(this.node.eulerAngles.y);
        // (currentRotation - offsetRotation) 当前的进度值.
        // (this._currentSpeed * this._rotMeasure * 
        // (this._targetRotation > this._originRotation ? 1 : -1)) 当前帧运动的角度.
        let nextStation = (currentRotation - this._originRotation) + 
            (this._currentSpeed * this._rotMeasure * 
            (this._targetRotation > this._originRotation ? 1 : -1));
        if (Math.abs(nextStation) > Math.abs(offsetRotation)) {
            nextStation = offsetRotation;
        }
        let target = nextStation + this._originRotation;
        Car.tempVec.set(0, target, 0);
        this.node.eulerAngles = Car.tempVec;
        const sin = Math.sin(nextStation * Math.PI / 180);
        const cos = Math.cos(nextStation * Math.PI / 180);
        const xLength = this._pointA.x - this._centerPoint.x;
        const zLength = this._pointA.z - this._centerPoint.z;
        const xPos = xLength * cos + zLength * sin + this._centerPoint.x;
        const zPos = -xLength * sin + zLength * cos + this._centerPoint.z;
        this._offset.set(xPos, 0, zPos - 1);
    }

    public setEntry(entry: Node, isMain: boolean = false) {
        this.node.worldPosition = entry.worldPosition;
        this._currentRoadPoint = entry.getComponent(RoadPoint);
        this._isMain = isMain;
        if (!this._currentRoadPoint) { return console.log("===> _currentRoadPoint is null."); }
        this._pointA = entry.worldPosition;
        this._pointB = this._currentRoadPoint.nextStation.worldPosition;
        const z = this._pointB.z - this._pointA.z;
        const x = this._pointB.x - this._pointA.x;
        if (z !== 0) {
            if (z < 0) {
                this.node.eulerAngles = new Vec3();
            } else {
                this.node.eulerAngles = new Vec3(0, 180, 0);
            }
        } else if (x !== 0) {
            if (x > 0) {
                this.node.eulerAngles = new Vec3(0, 270, 0);
            } else {
                this.node.eulerAngles = new Vec3(0, 90, 0);
            }
        }
        if (this._isMain) {
            const gesNode = this.node.getChildByName("Particle_gas");
            this._gesParticle = gesNode.getComponent(ParticleSystemComponent);
            this._gesParticle.play();
        }
    }

    /** 开始运动. */
    public startRuning() {
        if (this._currentRoadPoint) {
            this._isMoving = true;
            this._touchState = true;
            this._acceleration = .2;
        }
    }

    /** 停止运动. */
    public stopRuning() {
        this._acceleration -= .3;
        this._isMoving = false;
        this._touchState = false;
        this._isBraking = true;
        CustomEventListener.emit(Constants.EventName.START_BRAKING, this.node);
        AudioManager.playSound(Constants.AudioSource.STOP);
    }

    public moveAfterFinished(callback: Function) {
        this._overCallback = callback;
    }

    /** 到站. */
    private arrivalStation() {
        // console.log("=== 到达站点.", this._currentRoadPoint.nextStation);
        this._pointA = this._pointB;
        if (this._currentRoadPoint.nextStation) {
            this._currentRoadPoint = this._currentRoadPoint.nextStation.getComponent(RoadPoint);
            // console.log("nextStation: ", this._currentRoadPoint.nextStation);
            if (this._currentRoadPoint.pointType === RoadPointType.END) {
                this._acceleration = 0;
                this._currentSpeed = .1;
                CustomEventListener.emit(Constants.EventName.SHOW_COIN, this.node.worldPosition);
            }
        }
        if (this._currentRoadPoint.nextStation) {
            this._pointB = this._currentRoadPoint.nextStation.worldPosition;
            if (this._isMain) {
                if (this._isBraking) {
                    this._isBraking = false;
                    CustomEventListener.emit(Constants.EventName.END_BRAKING);
                }
                if (this._currentRoadPoint.pointType === RoadPointType.GREETING) {
                    this.greetingCustomer();
                } else if (this._currentRoadPoint.pointType === RoadPointType.GOODBYD) {
                    this.goodbydCustomer();
                } else if (this._currentRoadPoint.pointType === RoadPointType.END) {
                    AudioManager.playSound(Constants.AudioSource.WIN);
                }
            }
            this.setCurveData();
        } else {
            this._isMoving = false;
            this._currentRoadPoint = null;
            this._overCallback && this._overCallback(this);
            this._overCallback = null;
        }
    }

    /** 接乘客. */
    private greetingCustomer() {
        this._isInOrder = true;
        this._currentSpeed = 0;
        this._gesParticle.stop();
        CustomEventListener.emit(Constants.EventName.GREETING, this.node.worldPosition, this._currentRoadPoint.direction);
    }

    /** 送乘客. */
    private goodbydCustomer() {
        this._isInOrder = true;
        this._currentSpeed = 0;
        this._gesParticle.stop();
        CustomEventListener.emit(Constants.EventName.GOODBYD, this.node.worldPosition, this._currentRoadPoint.direction);
        CustomEventListener.emit(Constants.EventName.SHOW_COIN, this.node.worldPosition);
    }

    /** 乘客走路结束. */
    private async onWalkFinished() {
        this._isInOrder = false;
        this._isMoving = this._touchState;
        this._currentSpeed = .1;
        this._gesParticle.play();
        // console.log(`===> walk finished isInOrder: ${this._isInOrder}, isMoving: ${this._isMoving}, touchState: ${this._touchState}.`, );
    }

    /** 设置拐弯数据. */
    private setCurveData() {
        if (this._currentRoadPoint.moveType === RoadMoveType.CURVE) {
            // 转弯.
            this._originRotation = this.conversionAngle(this.node.eulerAngles.y);
            if (this._currentRoadPoint.clockwise) {
                this._targetRotation = this._originRotation - 90;
                if ((this._pointB.z < this._pointA.z && this._pointB.x > this._pointA.x) ||
                    (this._pointB.z > this._pointA.z && this._pointB.x < this._pointA.x)) {
                    this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                } else {
                    this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                }
            } else {
                this._targetRotation = this._originRotation + 90;
                if (this._pointB.z > this._pointA.z && this._pointB.x > this._pointA.x ||
                    (this._pointB.z < this._pointA.z && this._pointB.x < this._pointA.x)) {
                    this._centerPoint.set(this._pointB.x, 0, this._pointA.z);
                } else {
                    this._centerPoint.set(this._pointA.x, 0, this._pointB.z);
                }
            }
            Vec3.subtract(Car.tempVec, this._pointA, this._centerPoint);
            let radiu = Car.tempVec.length();
            this._rotMeasure = 90 / (Math.PI * radiu / 2);
        }
    }

    /** 角度转换为正值. */
    private conversionAngle(value: number): number {
        return value <= 0 ? value += 360 : value;
    }
}
