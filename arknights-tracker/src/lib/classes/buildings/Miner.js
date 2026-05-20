import {Building} from "$lib/classes/buildings/Building.js";
import {miners} from "$lib/data/buildings/miners.js";

export class Miner extends Building {
    _minerObj;

    constructor(building, minerObj) {
        super(building);

        this._minerObj = minerObj;
    }

    // todo сделать свойства

    static getMiner(buildingId) {
        let building = Building.getBuilding(buildingId);

        if (!building) return null;

        return Miner.getMinerFromBuilding(building);
    }

    static getMinerFromBuilding(building) {
        let minerObj = miners[building.id];

        if (!minerObj) return null;

        return new Miner(building, minerObj);
    }

    static isMiner(buildingId) {
        return miners.hasOwnProperty(buildingId);
    }
}