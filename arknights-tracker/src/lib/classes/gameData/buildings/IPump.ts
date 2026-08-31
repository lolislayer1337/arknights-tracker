import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { INaturalRecipe } from "$lib/classes/gameData/recipes/INaturalRecipe";

export interface IPump extends IBuilding {
    get pumpTimeMs(): number;
    get enableLiquidIds(): readonly string[];

    isLiquidEnable(liquidId: string): boolean;

    getRecipe(liquidId: string): INaturalRecipe | null;
}