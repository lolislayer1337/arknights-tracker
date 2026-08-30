import type { IItem } from "$lib/classes/gameData/items/IItem";
import { type ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
import { type ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
import { type ItemType } from "$lib/classes/gameData/items/ItemType";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { ImageVariant } from "$lib/classes/icons/ImageVariant";
import type { Rarity } from "$lib/classes/Rarity";
import type { ItemData } from "$lib/data/types/items/ItemData";

export class Item implements IItem {
    private readonly _itemData: ItemData;
    private readonly _icon: IImageIcon;
    private readonly _eventIds: string[];

    public constructor(itemData: ItemData, eventIds: string[], icon?: IImageIcon) {
        this._itemData = itemData;
        this._eventIds = eventIds;

        this._icon = icon
            ? icon
            : {
                iconId: itemData.iconId,
                imageVariant: ImageVariant.ITEM_ICON
            };
    }

    public get id(): string {
        return this._itemData.id;
    }

    public get gameId(): string {
        return this.id;
    }

    public get groupId(): ItemGroup {
        return this._itemData.groupId as ItemGroup;
    }

    public get icon(): IImageIcon {
        return this._icon;
    }

    public get material(): ItemMaterial | null {
        return this._itemData.material as ItemMaterial | null;
    }

    public get rarity(): Rarity {
        return this._itemData.rarity;
    }

    public get type(): ItemType {
        return this._itemData.type as ItemType;
    }

    public get i18nKey(): string {
        return `itemNames.${this.gameId}`;
    }

    public getEventIds(): string[] {
        return this._eventIds;
    }
}