import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import { Recipe } from "$lib/classes/gameData/recipes/Recipe";

export class BuildingRecipe extends Recipe implements IBuildingRecipe {
    private readonly _buildingId: string;
    private readonly _processTimeMs: number;

    public constructor(ingredients: readonly IItemStack[], outcomes: readonly IItemStack[], buildingId: string, processTimeMs: number) {
        super(ingredients, outcomes);

        this._buildingId = buildingId;
        this._processTimeMs = processTimeMs;
    }

    public get buildingId(): string {
        return this._buildingId;
    }

    public get processTimeMs(): number {
        return this._processTimeMs;
    }
}