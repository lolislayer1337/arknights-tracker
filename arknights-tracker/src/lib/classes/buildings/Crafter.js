import {Building} from "$lib/classes/buildings/Building.js";
import {crafters} from "$lib/data/buildings/crafters.js";

export class Crafter extends Building {
    _crafterObj;

    constructor(building, crafterObj) {
        super(building);

        this._crafterObj = crafterObj;
    }

    // todo сделать свойства

    static getCrafter(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return this.getCrafterFromBuilding(building);
    }

    static getCrafterFromBuilding(building) {
        let crafterObj = crafters[building.id];

        if (!crafterObj) return null;

        return new Crafter(building._buildingObj)
    }

    static isCrafter(buildingId) {
        return crafters.hasOwnProperty(buildingId);
    }
}