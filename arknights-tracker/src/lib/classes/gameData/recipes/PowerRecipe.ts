import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { IPowerRecipe } from "$lib/classes/gameData/recipes/IPowerRecipe";

export class PowerRecipe extends BuildingRecipe implements IPowerRecipe {
    private readonly _powerProvide: number;

    public get processTimeMs(): number {
        return super.processTimeMs;
    }

    constructor(ingredients: readonly IItemStack[], buildingId: string, processTimeMs: number, powerProvide: number) {
        super(ingredients, [], buildingId, processTimeMs);

        this._powerProvide = powerProvide;
    }

    public get powerProvide(): number {
        return 0;
    }
}