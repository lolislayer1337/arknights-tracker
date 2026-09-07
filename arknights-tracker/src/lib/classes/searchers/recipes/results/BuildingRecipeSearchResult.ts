import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IBuildingRecipe } from "$lib/classes/gameData/recipes/IBuildingRecipe";
import type { IBuildingRecipeSearchResult } from "$lib/classes/searchers/recipes/results/IBuildingRecipeSearchResult";
import type { IResultBuildingGroup } from "$lib/classes/searchers/recipes/results/IResultBuildingGroup";
import { RecipeSearchResult } from "$lib/classes/searchers/recipes/results/RecipeSearchResult";
import { ResultBuildingGroup } from "$lib/classes/searchers/recipes/results/ResultBuildingGroup";
import { getMap, getMappedList } from "$lib/utils/collectionUtils";

export class BuildingRecipeSearchResult<
    TRecipe extends IBuildingRecipe<TBuilding, TIngredient, TOutcome>,
    TBuilding extends IBuilding,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
>
    extends RecipeSearchResult<TRecipe, TIngredient, TOutcome>
    implements IBuildingRecipeSearchResult<TRecipe, TBuilding, IResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome>, TIngredient, TOutcome> {

    public constructor(list: TRecipe[]) {
        super(list);
    }

    public groupByBuilding(): ReadonlyMap<string, IResultBuildingGroup<TRecipe, TBuilding, TIngredient, TOutcome>> {
        const recipeMap = getMappedList(this.list, r => r.building.gameId);
        const groupList = recipeMap.values()
            .map(list => new ResultBuildingGroup(list[0].building, list));

        return getMap(groupList, item => item.building.gameId);
    }
}