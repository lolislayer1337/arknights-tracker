import type { IFullBottle } from "$lib/classes/gameData/items/IFullBottle";
import { Item } from "$lib/classes/gameData/items/Item";
import type { FullBottleData } from "$lib/data/types/items/FullBottleData";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class FullBottle extends Item implements IFullBottle {
    private readonly _fullBottleData: FullBottleData;

    public constructor(itemData: ItemData, eventIds: string[], fullBottleData: FullBottleData) {
        super(itemData, eventIds);

        this._fullBottleData = fullBottleData;
    }

    public get emptyBottleId(): string {
        return this._fullBottleData.emptyBottleId;
    }

    public get liquidId(): string {
        return this._fullBottleData.liquidId;
    }
}