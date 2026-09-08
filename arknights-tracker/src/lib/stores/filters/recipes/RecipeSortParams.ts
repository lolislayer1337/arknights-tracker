import type { RecipeSortFieldParams } from "$lib/stores/filters/recipes/RecipeSortFieldParams";

export interface RecipeSortParams {
    sortFieldOrder: (keyof RecipeSortFieldParams)[];
    sortFieldParams: RecipeSortFieldParams;
}