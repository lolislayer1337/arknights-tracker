import {Item} from "$lib/classes/items/Item.js";
import {fullBottles} from "$lib/data/items/fullBottles.js";

export class FullBottle extends Item{
    _fullBottleObj;

    constructor(itemObj, fullBottleObj) {
        super(itemObj);

        this._fullBottleObj = fullBottleObj;
    }

    get emptyBottleId() {
        return this._fullBottleObj.emptyBottleId;
    }

    get liquidId() {
        return this._fullBottleObj.liquidId;
    }

    get emptyBottleItem() {
        return Item.getItem(this.emptyBottleId)
    }

    get liquidItem() {
        return Item.getItem(this.liquidId)
    }

    static getFullBottle(itemId) {
        if (!this.itemExists(itemId)) return null;

        let item = this.getItem(itemId);

        return this.getFullBottleFromItem(item);
    }

    static getFullBottleFromItem(item) {
        if (!this.isFullBottle(item.id)) return null;

        let fullBottleObj = fullBottles[item.id];

        return new FullBottle(item, fullBottleObj);
    }

    static isFullBottle(itemId) {
        return fullBottles.hasOwnProperty(itemId);
    }
}