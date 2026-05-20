import {machineCrafts} from "$lib/data/crafts/machineCrafts.js";
import {Crafter} from "$lib/classes/buildings/Crafter.js";

export class MachineCraft {
    _craftObj;

    constructor(craftObj) {
        this._craftObj = craftObj;
    }

    get id() {
        return this._craftObj.id;
    }

    get crafterId() {
        return this._craftObj.buildingId;
    }

    get formulaGroupId() {
        return this._craftObj.formulaGroupId;
    }

    get craftTimeMs() {
        return this._craftObj.craftTimeMs;
    }

    get ingredients() {
        return this._craftObj.ingredients;
    }

    get outcomes() {
        return this._craftObj.outcomes;
    }

    getCrafter() {
        return Crafter.getCrafter(this.crafterId);
    }

    static getMachineCraft(formulaId) {
        let machineCraftObj = machineCrafts[formulaId];

        if (!machineCraftObj) return null;

        return new MachineCraft(machineCraftObj);
    }

    static isMachineCraft(formulaId) {
        return machineCrafts.hasOwnProperty(formulaId);
    }
}