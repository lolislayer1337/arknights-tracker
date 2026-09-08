import type { RecipeSortFieldParams } from "$lib/stores/filters/recipes/RecipeSortFieldParams";

export interface RecipeFilterList {
    sortFieldOrder?: (keyof RecipeSortFieldParams)[];
    sortFieldParams?: Partial<RecipeSortFieldParams>;
}