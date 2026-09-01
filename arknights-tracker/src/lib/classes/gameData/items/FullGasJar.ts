import type { IFullGasJar } from "$lib/classes/gameData/items/IFullGasJar";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import { Item } from "$lib/classes/gameData/items/Item";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class FullGasJar extends Item implements IFullGasJar {
    private readonly _emptyJar: IItem;
    private readonly _gas: IItem;

    public constructor(itemData: ItemData, eventIds: string[], icon: IImageIcon, emptyJar: IItem, gas: IItem) {
        super(itemData, eventIds, icon);

        this._emptyJar = emptyJar;
        this._gas = gas;
    }

    public get emptyJar(): IItem {
        return this._emptyJar;
    }

    public get gas(): IItem {
        return this._gas;
    }
}