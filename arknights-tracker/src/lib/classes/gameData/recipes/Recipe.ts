import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IRecipe } from "$lib/classes/gameData/recipes/IRecipe";

export class Recipe implements IRecipe {
    private readonly _ingredients: readonly IItemStack[];
    private readonly _outcomes: readonly IItemStack[];

    public constructor(ingredients: readonly IItemStack[], outcomes: readonly IItemStack[]) {
        this._ingredients = ingredients;
        this._outcomes = outcomes;
    }

    public get ingredients(): readonly IItemStack[] {
        return this._ingredients;
    }

    public get outcomes(): readonly IItemStack[] {
        return this._outcomes;
    }
}