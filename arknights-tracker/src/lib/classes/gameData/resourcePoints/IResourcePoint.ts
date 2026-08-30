import type { IGameData } from "$lib/classes/gameData/IGameData";
import type { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import type { ITextable } from "$lib/classes/ITextable";

export interface IResourcePoint extends IGameData, ITextable {
    get itemId(): string;
    get bgIcon(): IImageIcon;
    get type(): ResourcePointType;
}