import type { IFuel } from "$lib/classes/gameData/items/IFuel";
import { Item } from "$lib/classes/gameData/items/Item";
import type { FuelData } from "$lib/data/types/items/FuelData";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class Fuel extends Item implements IFuel {
    private readonly _fuelData: FuelData;

    public constructor(itemData: ItemData, eventIds: string[], fuelData: FuelData) {
        super(itemData, eventIds);

        this._fuelData = fuelData;
    }

    public get powerProvide(): number {
        return this._fuelData.powerProvide;
    }

    public get progressRound(): number {
        return this._fuelData.progressRound;
    }
}