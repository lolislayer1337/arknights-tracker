import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface IBuilding extends IGameData, ITextable {
    get icon(): IImageIcon;
    get itemId(): string;
    get type(): BuildingType;
}