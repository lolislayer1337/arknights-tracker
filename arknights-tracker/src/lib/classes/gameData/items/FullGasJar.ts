import type { IFullGasJar } from "$lib/classes/gameData/items/IFullGasJar";
import { Item } from "$lib/classes/gameData/items/Item";
import type { FullJarData } from "$lib/data/types/items/FullJarData";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class FullGasJar extends Item implements IFullGasJar {
    private readonly _fullJarData: FullJarData;

    protected constructor(itemData: ItemData, eventIds: string[], fullJarData: FullJarData) {
        super(itemData, eventIds);

        this._fullJarData = fullJarData;
    }

    public get emptyJarId(): string {
        return this._fullJarData.emptyJarId;
    }

    public get gasId(): string {
        return this._fullJarData.gasId;
    }
}