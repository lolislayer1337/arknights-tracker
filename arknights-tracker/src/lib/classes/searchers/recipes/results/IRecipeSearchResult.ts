import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export interface IRecipeSearchResult<
    TRecipe extends IRecipe<TIngredient, TOutcome>,
    TIngredient extends IItem = IItem,
    TOutcome extends IItem = IItem
> {
    get list(): readonly TRecipe[];
}