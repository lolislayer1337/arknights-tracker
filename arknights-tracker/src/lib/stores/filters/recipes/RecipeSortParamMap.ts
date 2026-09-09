import type { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
import type { RecipeFilterGroup, RecipeFilterValue } from "$lib/stores/filters/recipes/RecipeFilterValueMap";

export type RecipeSortParamMap = {
    [K in RecipeFilterGroup]: RecipeFilterValue<K>[];
} & {
    localeName: LocaleOrder;
}

export type RecipeSortFieldParamGroup = keyof RecipeSortParamMap;