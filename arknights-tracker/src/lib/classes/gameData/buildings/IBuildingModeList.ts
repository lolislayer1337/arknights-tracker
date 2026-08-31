import type { BuildingModeName } from "$lib/classes/gameData/buildings/BuildingModeName";
import type { CrafterModeData } from "$lib/data/types/buildings/CrafterModeData";

export interface IBuildingModeList {
    get list(): readonly CrafterModeData[];

    hasFormulaGroupId(formulaGroupId: string): boolean;
    hasMode(modeName: BuildingModeName): boolean;

    getByFormulaGroupId(formulaGroupId: string): CrafterModeData | null;
    getByModeName(modeName: BuildingModeName): CrafterModeData | null;
}