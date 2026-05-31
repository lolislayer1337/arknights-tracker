import {BuildingSearcher} from "$lib/classes/crafts/searchers/BuildingSearcher.js";
import {fuelItemId2PowerStationId} from "$lib/data/crafts/craftMaps.js";

export class PowerStationSearcher extends BuildingSearcher {

    constructor({ itemId2BuildingIdMap = fuelItemId2PowerStationId } = {}) {
        super({itemId2BuildingIdMap});
    }

    searchByItemAsIncome(itemId) {
        return this.searchByItem(itemId);
    }
}