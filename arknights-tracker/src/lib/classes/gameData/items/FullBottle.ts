import type { IFullBottle } from "$lib/classes/gameData/items/IFullBottle";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class FullBottle extends Item implements IFullBottle {
    private readonly _emptyBottle: IItem;
    private readonly _liquid: IItem;

    public constructor(itemData: ItemData, eventIds: string[], icon: IImageIcon, emptyBottle: IItem, liquid: IItem) {
        super(itemData, eventIds, icon);
        this._emptyBottle = emptyBottle;
        this._liquid = liquid;
    }

    public get emptyBottle(): IItem {
        return this._emptyBottle;
    }

    public get liquid(): IItem {
        return this._liquid;
    }
}