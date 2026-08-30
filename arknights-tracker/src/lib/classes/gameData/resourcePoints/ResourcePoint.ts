import type { IResourcePoint } from "$lib/classes/gameData/resourcePoints/IResourcePoint";
import { ResourcePointType } from "$lib/classes/gameData/resourcePoints/ResourcePointType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { ResourcePointData } from "$lib/data/types/items/ResourcePointData";

export class ResourcePoint implements IResourcePoint {
    private readonly _data: ResourcePointData;
    private readonly _icon: IImageIcon;

    public constructor(data: ResourcePointData) {
        this._data = data;

        this._icon = {
            iconId: ResourcePoint.getBgIconId(data.type as ResourcePointType),
            imageVariant: ImageVariant.ITEM_ICON_BG
        }
    }

    private static getBgIconId(type: ResourcePointType): string {
        switch (type) {
            case ResourcePointType.MINE: return "item_icon_bg_miner";
            case ResourcePointType.LIQUID: return "item_icon_bg_liquid";
            case ResourcePointType.GAS: return "item_icon_bg_gas";
        }
    }

    public get bgIcon(): IImageIcon {
        return this._icon;
    }

    public get gameId(): string {
        return this.id;
    }

    public get i18nKey(): string {
        return `resourcePointNames.${this.id}`;
    }

    public get id(): string {
        return this._data.id;
    }

    public get itemId(): string {
        return this._data.itemId;
    }

    public get type(): ResourcePointType {
        return this._data.type as ResourcePointType;
    }
}