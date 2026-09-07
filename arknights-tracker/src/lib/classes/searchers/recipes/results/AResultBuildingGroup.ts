import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export abstract class AResultBuildingGroup<
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
> implements IResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome> {
    private readonly _building: TBuilding;

    protected constructor(building: TBuilding) {
        this._building = building;
    }

    public get building(): TBuilding {
        return this._building;
    }

    public abstract get list(): readonly TRecipe[];
}