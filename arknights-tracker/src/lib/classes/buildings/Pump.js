import {Building} from "$lib/classes/buildings/Building.js";
import {pumps} from "$lib/data/buildings/pumps.js";

export class Pump extends Building {
    _pumpObj;

    constructor(building, pumpObj) {
        super(building);

        this._pumpObj = pumpObj;
    }

    // todo сделать свойства

    static getPump(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return Pump.getPumpFromBuilding(building);
    }

    static getPumpFromBuilding(building) {
        let pumpObj = pumps[building.id];

        if (!pumpObj) return null;

        return new Pump(building, pumpObj);
    }

    static isPump(buildingId) {
        return pumps.hasOwnProperty(buildingId);
    }
}