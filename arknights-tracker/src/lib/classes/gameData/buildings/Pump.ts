import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IEnableLiquid } from "$lib/classes/gameData/buildings/IEnableLiquid";
import type { IPump } from "$lib/classes/gameData/buildings/IPump";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import { PumpRecipe } from "$lib/classes/gameData/recipes/PumpRecipe";
import type { IResourcePointStorage } from "$lib/classes/storages/resourcePoints/IResourcePointStorage";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import { getMap } from "$lib/utils/collectionUtils";

export class Pump extends Building implements IPump {
    private readonly _pumpTimeMs: number;
    private readonly _enableLiquids: readonly IEnableLiquid[];
    private readonly _enableLiquidMap: Map<string, IEnableLiquid>;

    private readonly _resourcePointStorage: IResourcePointStorage;

    public constructor(buildingData: BuildingData, buildingItem: IItem, pumpTimeMs: number, enableLiquids: readonly IEnableLiquid[], resourcePointStorage: IResourcePointStorage) {
        super(buildingData, buildingItem);

        this._pumpTimeMs = pumpTimeMs;
        this._enableLiquids = enableLiquids;
        this._enableLiquidMap = getMap(enableLiquids, item => item.item.gameId);
        this._resourcePointStorage = resourcePointStorage;
    }

    public get enableLiquids(): readonly IEnableLiquid[] {
        return this._enableLiquids;
    }

    public get pumpTimeMs(): number {
        return this._pumpTimeMs;
    }

    public getRecipe(liquidId: string): IPumpRecipe | null {
        const liquid = this.getEnableLiquid(liquidId);

        if (!liquid || !liquid.resourcePoint) {
            return null;
        }

        const outcomes: IItemStack[] = [
            {
                item: liquid.item,
                count: 1
            }
        ];

        return new PumpRecipe(
            [],
            outcomes,
            this,
            this._pumpTimeMs,
            liquid.resourcePoint
        );
    }

    public isLiquidEnable(liquidId: string): boolean {
        return this._enableLiquidMap.has(liquidId);
    }

    public getEnableLiquid(liquidId: string): IEnableLiquid | null {
        return this._enableLiquidMap.get(liquidId) ?? null;
    }
}