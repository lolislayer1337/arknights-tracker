import type { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";

export interface ResourcePointData {
    id: string;
    itemId: string;
    type: `${ResourcePointType}`
}