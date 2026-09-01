import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IMineable } from "$lib/classes/gameData/buildings/IMineable";
import type { IMiner } from "$lib/classes/gameData/buildings/IMiner";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IMinerRecipe } from "$lib/classes/gameData/recipes/IMinerRecipe";
import { MinerRecipe } from "$lib/classes/gameData/recipes/MinerRecipe";
import type { IItemStorage } from "$lib/classes/storages/items/IItemStorage";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import { getMap } from "$lib/utils/collectionUtils";

export class Miner extends Building implements IMiner {
    private readonly _mineableMap: Map<string, IMineable>;
    private readonly _mineableList: readonly IMineable[];

    private readonly _resourcePointStorage: IResourcePointStorage;
    private readonly _itemStorage: IItemStorage;

    public constructor(buildingData: BuildingData, item: IItem, mineableList: readonly IMineable[], resourcePointStorage: IResourcePointStorage, itemStorage: IItemStorage) {
        super(buildingData, item);

        this._mineableMap = getMap(mineableList, item => item.miningItem.gameId);
        this._mineableList = mineableList;
        this._resourcePointStorage = resourcePointStorage;
        this._itemStorage = itemStorage;
    }

    public getMineableData(itemId: string): IMineable | null {
        return this._mineableMap.get(itemId) ?? null;
    }

    public get mineableList(): readonly IMineable[] {
        return this._mineableList;
    }

    public getRecipe(mineableItemId: string): IMinerRecipe | null {
        const mineableData = this.getMineableData(mineableItemId);

        if (!mineableData || !mineableData.resourcePoint) {
            return null;
        }

        const ingredients: IItemStack[] = mineableData.consumeItem ? [mineableData.consumeItem] : [];
        const outcomes: IItemStack[] = [
            {
                item: mineableData.miningItem,
                count: 1
            }
        ];

        return new MinerRecipe(
            ingredients,
            outcomes,
            this,
            mineableData.miningTimeMs,
            mineableData.resourcePoint
        );
    }

    public isMineable(itemId: string): boolean {
        return this._mineableMap.has(itemId);
    }
}