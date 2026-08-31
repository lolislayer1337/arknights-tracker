import  { type BuildingModeName } from "$lib/classes/gameData/buildings/BuildingModeName";
import type { IBuildingModeList } from "$lib/classes/gameData/buildings/IBuildingModeList";
import type { CrafterModeData } from "$lib/data/types/buildings/CrafterModeData";

export class BuildingModeList implements IBuildingModeList {
    private readonly _list: readonly CrafterModeData[];

    public constructor(list: readonly CrafterModeData[]) {
        this._list = list;
    }

    public get list(): readonly CrafterModeData[] {
        return this._list;
    }

    public getByFormulaGroupId(formulaGroupId: string): CrafterModeData | null {
        return this._list.find(v => v.formulaGroupId === formulaGroupId) ?? null;
    }

    public getByModeName(modeName: BuildingModeName): CrafterModeData | null {
        return this._list.find(v => v.modeName === modeName) ?? null;
    }

    public hasFormulaGroupId(formulaGroupId: string): boolean {
        return this._list.findIndex(v => v.formulaGroupId === formulaGroupId) > -1;
    }

    public hasMode(modeName: BuildingModeName): boolean {
        return this._list.findIndex(v => v.modeName === modeName) > -1;
    }
}