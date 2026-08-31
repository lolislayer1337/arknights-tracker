import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { BuildingRecipe } from "$lib/classes/gameData/recipes/BuildingRecipe";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";

export class NaturalRecipe extends BuildingRecipe implements INaturalRecipe {
    private readonly _resourcePointId: string;

    public constructor(ingredients: readonly IItemStack[], outcomes: readonly IItemStack[], buildingId: string, processTimeMs: number, resourcePointId: string) {
        super(ingredients, outcomes, buildingId, processTimeMs);
        this._resourcePointId = resourcePointId;
    }

    public get resourcePointId(): string {
        return this._resourcePointId;
    }
}