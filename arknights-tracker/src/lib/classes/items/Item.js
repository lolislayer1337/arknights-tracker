import {items} from "$lib/data/items/items.js";

export class Item {
    _itemObj;

    constructor(itemObj) {
        this._itemObj = itemObj;
    }

    get id() {
        return this._itemObj.id;
    }

    get rarity() {
        return this._itemObj.rarity;
    }

    get groupId() {
        return this._itemObj.groupId;
    }

    static getItem(itemId) {
        let itemObj = items[itemId];

        if (itemObj ?? false) return null;

        return new Item(itemObj);
    }

    static itemExists(itemId) {
        return items.hasOwnProperty(itemId);
    }
}
