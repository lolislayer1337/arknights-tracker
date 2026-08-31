import { Building } from "$lib/classes/gameData/buildings/Building";
import type { IPump } from "$lib/classes/gameData/buildings/IPump";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";
import { NaturalRecipe } from "$lib/classes/gameData/recipes/NaturalRecipe";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";
import type { PumpData } from "$lib/data/types/buildings/PumpData";

export class Pump extends Building implements IPump {
    private readonly _pumpData: PumpData;

    public constructor(buildingData: BuildingData, pumpData: PumpData) {
        super(buildingData);

        this._pumpData = pumpData;
    }

    public get enableLiquidIds(): readonly string[] {
        return this._pumpData.enableLiquidIds;
    }

    public get pumpTimeMs(): number {
        return this._pumpData.pumpTimeMs;
    }

    public getRecipe(liquidId: string): INaturalRecipe | null {
        if (!this.isLiquidEnable(liquidId)) {
            return null;
        }

        const outcomes: IItemStack[] = [
            {
                itemId: liquidId,
                count: 1
            }
        ];

        return new NaturalRecipe(
            [],
            outcomes,
            this.gameId,
            this.pumpTimeMs,
            liquidId
        );
    }

    public isLiquidEnable(liquidId: string): boolean {
        return this.enableLiquidIds.includes(liquidId);
    }
}