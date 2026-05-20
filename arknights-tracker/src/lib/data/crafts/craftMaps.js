import {machineCrafts} from "$lib/data/crafts/machineCrafts.js";
import {manualCrafts} from "$lib/data/crafts/manualCrafts.js";
import {hubCrafts} from "$lib/data/crafts/hubCrafts.js";
import {miners} from "$lib/data/buildings/miners.js";
import {pumps} from "$lib/data/buildings/pumps.js";

export const machineCraftItemAsIncome = getCraftItemAs("ingredients", machineCrafts);
export const machineCraftItemAsOutcome = getCraftItemAs("outcomes", machineCrafts);

export const manualCraftItemAsIncome = getCraftItemAs("ingredients", manualCrafts);
export const manualCraftItemAsOutcome = getCraftItemAs("outcomes", manualCrafts);

export const hubCraftItemAsIncome = getCraftItemAs("ingredients", hubCrafts);
export const hubCraftItemAsOutcome = getCraftItemAs("outcomes", hubCrafts);

export const miningItemId2MinerId = getMiningItemId2MinerId();

export const pumpingItemId2PumpId = getPumpingItemId2PumpId();

function getCraftItemAs(fieldName, table) {
    let map = {};

    for (let obj of Object.values(table)) {
        let formulaId = obj.id;

        for (let item of obj[fieldName]) {
            let itemId = item.itemId;

            if (!map.hasOwnProperty(itemId)) map[itemId] = [];

            map[itemId].push(formulaId);
        }
    }

    return map;
}

function getMiningItemId2MinerId() {
    let map = {};

    for (let obj of Object.values(miners)) {
        let minerId = obj.id;

        for (let mineable of Object.values(obj.mineable)) {
            let itemId = mineable.miningItemId;

            if (!map.hasOwnProperty(itemId)) map[itemId] = [];

            map[itemId].push(minerId);
        }
    }

    return map;
}

function getPumpingItemId2PumpId() {
    let map = {};

    for (let obj of Object.values(pumps)) {
        let pumpId = obj.id;

        for (let itemId of obj.enableLiquidIds) {
            if (!map.hasOwnProperty(itemId)) map[itemId] = [];

            map[itemId].push(pumpId);
        }
    }

    return map;
}