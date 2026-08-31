import { type BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { BuildingData } from "$lib/data/types/buildings/BuildingData";

export class Building implements IBuilding {
    private readonly _buildingData: BuildingData;
    private readonly _icon: IImageIcon;

    public constructor(buildingData: BuildingData) {
        this._buildingData = buildingData;

        this._icon = {
            iconId: buildingData.id,
            imageVariant: ImageVariant.BUILDING_ICON
        };
    }

    public get gameId(): string {
        return this._buildingData.id;
    }

    public get i18nKey(): string {
        return `buildingNames.${this.gameId}`;
    }

    public get icon(): IImageIcon {
        return this._icon;
    }

    public get id(): string {
        return this._buildingData.id;
    }

    public get itemId(): string {
        return this._buildingData.itemId;
    }

    public get type(): BuildingType {
        return this._buildingData.type as BuildingType;
    }
}