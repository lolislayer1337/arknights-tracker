import type { RecipeFilterList } from "$lib/stores/filters/recipes/RecipeFilterList";
import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
import type { Writable } from "svelte/store";

declare function getDefaultItemSortParams(): RecipeFilterList;

declare const itemFilters: Writable<RecipeFilterList>;
declare const itemSearch: Writable<string>;
declare const itemSortParams: Writable<RecipeSortParams>;
declare const itemGroupMode: Writable<boolean>;