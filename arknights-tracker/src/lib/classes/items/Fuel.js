import {Item} from "$lib/classes/items/Item.js";
import {fuel} from "$lib/data/items/fuel.js";

export class Fuel extends Item {
    _fuelObj;

    constructor(itemObj, fuelObj) {
        super(itemObj);

        this._fuelObj = fuelObj;
    }

    get powerProvide() {
        return this._fuelObj.powerProvide;
    }

    get progressRound() {
        return this._fuelObj.progressRound;
    }

    static getFuel(itemId) {
        if (!this.isFuel(itemId)) return null;
        if (!this.itemExists(itemId)) return null;

        let item = this.getItem(itemId);

        return this.getFuelFromItem(item);
    }

    static getFuelFromItem(item) {
        if (!this.isFuel(item.id)) return null;

        let fuelObj = fuel[item.id];

        return new Fuel(item, fuelObj);
    }

    static isFuel(itemId) {
        return fuel.hasOwnProperty(itemId);
    }
}