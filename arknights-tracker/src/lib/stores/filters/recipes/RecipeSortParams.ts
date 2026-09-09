import type { RecipeSortParamMap } from "$lib/stores/filters/recipes/RecipeSortParamMap";

export interface RecipeSortParams {
    sortFieldOrder: (keyof RecipeSortParamMap)[];
    sortFieldParams: RecipeSortParamMap;
}