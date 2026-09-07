import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import { AResultBuildingGroup } from "$lib/classes/searchers/recipes/results/AResultBuildingGroup";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";

export class ResultBuildingGroup<
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
>
    extends AResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome>
    implements IResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome> {

    private readonly _list: readonly TRecipe[];

    public constructor(building: TBuilding, list: readonly TRecipe[]) {
        super(building);

        this._list = list;
    }

    public get list(): readonly TRecipe[] {
        return this._list;
    }
}