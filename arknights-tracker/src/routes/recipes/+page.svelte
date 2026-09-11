<script lang="ts">
    import { goto } from "$app/navigation";
    import type { IItemComparator } from "$lib/classes/comparators/items/IItemComparator";
    import { ItemComparator } from "$lib/classes/comparators/items/ItemComparator";
    import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
    import { LocaleOrder } from "$lib/classes/comparators/LocaleOrder";
    import type { IFactoryEvent } from "$lib/classes/events/IFactoryEvent";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { ItemGroup } from "$lib/classes/gameData/items/ItemGroup";
    import type { ItemMaterial } from "$lib/classes/gameData/items/ItemMaterial";
    import type { ItemType } from "$lib/classes/gameData/items/ItemType";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import DataToolbar from "$lib/components/dataToolbarV2/DataToolbar.svelte";
    import RecipesFilterDropdown from "$lib/components/dataToolbarV2/filterDropdowns/RecipesFilterDropdown.svelte";
    import RecipesSortDropdown from "$lib/components/dataToolbarV2/sortDropdowns/RecipesSortDropdown.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { craftableItemsList } from "$lib/data/crafts/craftableItemsList";
    import { factoryEventStorage } from "$lib/dataStorages/events/factoryEventStorage";
    import { fullBottleStorage } from "$lib/dataStorages/items/fullBottleStorage";
    import { fullJarStorage } from "$lib/dataStorages/items/fullJarStorage";
    import { itemStorage } from "$lib/dataStorages/items/itemStorage";
    import { t } from "$lib/i18n";
    import type { RecipeFilterGroup, RecipeFilterValue } from "$lib/stores/filters/recipes/RecipeFilterValueMap";
    import type { RecipeSelectedFilterMap } from "$lib/stores/filters/recipes/RecipeSelectedFilterMap";
    import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
    import {
        getDefaultItemSortParams,
        itemFilters,
        itemGroupMode,
        itemSearch,
        itemSortParams
    } from "$lib/stores/filterStore";
    import { getMapByList } from "$lib/utils/collectionUtils";
    import { filterCheck } from "$lib/utils/filterUtils";

    export let data;

    const craftableItems: readonly IItem[] = craftableItemsList.values()
        .map(itemId => itemStorage.byGameId.get(itemId))
        .filter(item => item !== undefined)
        .toArray();

    const itemEventMap = getEventByItemIdMap(factoryEventStorage.list);

    const comparator: IItemComparator = new ItemComparator(factoryEventStorage, fullBottleStorage, fullJarStorage, item => $t(item.i18nKey));

    let sortDirection: SortDirection = "asc";

    let filteredItems: IItem[];

    $: filteredItems = getFilteredItems(craftableItems, $itemSortParams, sortDirection, $itemFilters, $itemSearch);

    function getFilteredItems(items: readonly IItem[], sortParams: RecipeSortParams, sortDirection: SortDirection, filters: RecipeSelectedFilterMap, searchQuery: string): IItem[] {
        comparator.setComparatorsOrder(sortParams.sortFieldOrder);
        comparator.rarityComparator.setValueOrder(sortParams.sortFieldParams.rarity);
        comparator.eventComparator.setValueOrder(sortParams.sortFieldParams.events);
        comparator.groupComparator.setValueOrder(sortParams.sortFieldParams.itemGroups as ItemGroup[]);
        comparator.typeComparator.setValueOrder(sortParams.sortFieldParams.itemTypes as ItemType[]);
        comparator.materialComparator.setValueOrder(sortParams.sortFieldParams.itemMaterials as ItemMaterial[]);
        comparator.localeComparator.isReversed = sortParams.sortFieldParams.localeName === LocaleOrder.Z_A;

        const result: IItem[] = items.filter(item => {

            return filterCheck(filters.rarity, item.rarity)
                && filterCheck(filters.events, itemEventMap.get(item.gameId)?.id ?? "nonEvent")
                && filterCheck(filters.itemGroups, item.groupId)
                && filterCheck(filters.itemTypes, item.type)
                && filterCheck(filters.itemMaterials, item.material)
                && (!searchQuery
                    || item.gameId.includes(searchQuery)
                    || $t(item.i18nKey).includes(searchQuery));
        });

        const reverseMultiplier = sortDirection === "desc" ? -1 : 1;

        result.sort((a, b) => comparator.compare(a, b) * reverseMultiplier);

        return result;
    }

    function getEventByItemIdMap(events: Iterable<IFactoryEvent>): Map<string, IFactoryEvent> {
        return getMapByList(events, event => event.eventItemIds);
    }

    function resetSort() {
        $itemSortParams = getDefaultItemSortParams();
    }

    function checkSortParams(currentSortParams: RecipeSortParams, defaultSortParams: RecipeSortParams) {
        if (!currentSortParams || !currentSortParams.sortFieldOrder || !currentSortParams.sortFieldParams) {
            return false;
        }

        const fieldOrder = checkList(currentSortParams.sortFieldOrder, defaultSortParams.sortFieldOrder);

        if (!fieldOrder) {
            return false;
        }

        const { localeName, ...rest } = defaultSortParams.sortFieldParams;
        const keys = Object.keys(rest) as RecipeFilterGroup[];

        for (const key of keys) {
            const check = checkList(currentSortParams.sortFieldParams[key] as RecipeFilterValue<typeof key>[], defaultSortParams.sortFieldParams[key] as RecipeFilterValue<typeof key>[]);

            if (!check) {
                return false;
            }
        }

        return true;
    }

    function checkList<T>(currentList: readonly T[], defaultList: readonly T[]): boolean {
        if (!currentList) {
            return false;
        }

        let set = new Set(defaultList);

        for (let item of currentList) {
            let isDeleted = set.delete(item);

            if (!isDeleted) {
                return false;
            }
        }

        return set.size === 0;
    }

    const defaultSortParams = getDefaultItemSortParams();
    $: {
        let isSortParamsCorrect = $itemSortParams ? checkSortParams($itemSortParams, defaultSortParams) : true;

        if (!isSortParamsCorrect) {
            console.log("Incorrect item sort params");
            resetSort();
        }
    }

    let isFilterActive = false;
    $: isFilterActive = Object.values($itemFilters)
        .some((set) => set.size > 0);

    let groupField: RecipeFilterGroup;
    let groupedItems: DisplayedItemGroup[];

    $: groupField = getGroupField($itemSortParams);

    $: groupedItems = $itemGroupMode ? getDisplayedItemGroups(groupField, filteredItems) : [];

    function getGroupField(sortParams: RecipeSortParams): RecipeFilterGroup {
        let sortFieldName = sortParams.sortFieldOrder[0];

        if (sortFieldName === ItemFieldComparatorName.LOCALE_NAME) {
            sortFieldName = sortParams.sortFieldOrder[1];
        }

        return sortFieldName as RecipeFilterGroup;
    }

    interface GroupedItemList<T> {
        order: T[];
        map: Map<T, IItem[]>;
    }

    interface DisplayedItemGroup {
        title: string;
        list: IItem[];
    }

    function groupItems<T extends RecipeFilterGroup>(items: Iterable<IItem>, getValueFn: (item: IItem) => RecipeFilterValue<T>): GroupedItemList<RecipeFilterValue<T>> {
        const order: RecipeFilterValue<T>[] = [];
        const map: Map<RecipeFilterValue<T>, IItem[]> = new Map();

        for (const item of items) {
            const value = getValueFn(item);

            let list = map.get(value);

            if (!list) {
                order.push(value);
                list = [];
                map.set(value, list);
            }

            list.push(item);
        }

        return {
            order,
            map
        };
    }

    function getGroupValue<K extends RecipeFilterGroup>(group: K, item: IItem): RecipeFilterValue<K> {
        switch (group) {
            case ItemFieldComparatorName.RARITY: return item.rarity as RecipeFilterValue<K>;
            case ItemFieldComparatorName.ITEM_MATERIAL: return (item.material ?? "nonMaterial") as RecipeFilterValue<K>;
            case ItemFieldComparatorName.ITEM_TYPE: return item.type as RecipeFilterValue<K>;
            case ItemFieldComparatorName.ITEM_GROUP: return item.groupId as RecipeFilterValue<K>;
            case ItemFieldComparatorName.EVENT: return (itemEventMap.get(item.gameId)?.id ?? "nonEvent") as RecipeFilterValue<K>;
        }
    }

    function getGroupTitle<K extends RecipeFilterGroup>(group: K, value: RecipeFilterValue<K>): string {
        switch (group) {
            case ItemFieldComparatorName.RARITY: return String(value);
            case ItemFieldComparatorName.ITEM_MATERIAL: return $t(`sort.itemMaterials.${value}`);
            case ItemFieldComparatorName.ITEM_TYPE: return $t(`sort.itemTypes.${value}`);
            case ItemFieldComparatorName.ITEM_GROUP: return $t(`sort.itemGroups.${value}`);
            case ItemFieldComparatorName.EVENT:
                if (value === "nonEvent") {
                    return $t("sort.events.nonEvent");
                }

                const eventKey = factoryEventStorage.byId.get(value as string)?.i18nKey;

                return $t(eventKey ?? `events.${value}`);
        }
    }

    function getDisplayedItemGroups(groupField: RecipeFilterGroup, items: Iterable<IItem>): DisplayedItemGroup[] {
        const displayedItemGroups: DisplayedItemGroup[] = [];
        const getValueFn = (item: IItem) => getGroupValue(groupField, item);

        const groupedItems = groupItems(items, getValueFn);

        const groupList: DisplayedItemGroup[] = [];

        for (const groupId of groupedItems.order) {
            const items = groupedItems.map.get(groupId)!;
            const title = getGroupTitle(groupField, groupId);

            groupList.push({
                title,
                list: items
            });
        }

        return groupList;
    }


    let groupDisplayLimit = 2;
    let flatDisplayLimit = 40;

    let displayedGroups: DisplayedItemGroup[] = [];
    let displayedItems: IItem[] = [];

    $: displayedGroups = $itemGroupMode ? groupedItems.slice(0, groupDisplayLimit) : [];
    $: displayedItems = !$itemGroupMode ? filteredItems.slice(0, flatDisplayLimit) : [];

    $: {
        const _trigger = [
            $itemSearch,
            $itemFilters,
            $itemSortParams,
            sortDirection,
            $itemGroupMode
        ];

        groupDisplayLimit = 2;
        flatDisplayLimit = 40;
        setTimeout(checkScroll, 50);
    }

    function loadMore() {
        let changed = false;

        if ($itemGroupMode && groupDisplayLimit < groupedItems.length) {
            groupDisplayLimit += 2;
            changed = true;
        } else if (!$itemGroupMode && flatDisplayLimit < filteredItems.length) {
            flatDisplayLimit += 40;
            changed = true;
        }

        if (changed) {
            setTimeout(checkScroll, 50);
        }
    }

    function checkScroll() {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return;
        }

        const currentScroll = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;

        if (totalHeight - currentScroll < 1000) {
            loadMore();
        }
    }

    function selectItem(item: IItem) {
        if (data.itemId === item.gameId) {
            goto("/recipes", {
                replaceState: true,
                noScroll: true
            });

            return;
        }

        goto(`/recipes?id=${item.gameId}`, {
            replaceState: true,
            noScroll: true
        });
    }

    let isBottomSheetOpen: boolean = false;

</script>

<svelte:head>

    <title>
        {$t("pages.recipes")} - Goyfield
    </title>

    <meta
        name="description"
        content={$t("seo.descriptions.recipes")}
    />

    <meta
        property="og:title"
        content={`${$t("pages.recipes")} - Goyfield`}
    />

    <meta
        property="og:description"
        content={$t("seo.descriptions.recipes")}
    />

</svelte:head>

<svelte:window
    on:scroll={checkScroll}
    on:resize={checkScroll}
/>

<div class="max-w-[100%] max-h-[100%] min-h-screen h-full flex flex-col xl:flex-row">

    <div class="w-full xl:w-[calc(100%-max(470px,30%))] mr-6">

        <div class="flex items-baseline flex-wrap gap-2 md:gap-3 mb-8 font-sdk">

            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("pages.recipes")}
            </h2>

            <span class="text-gray-400 text-xl md:text-3xl font-normal">
                / {filteredItems.length}
            </span>

        </div>

        <div class="w-full xl:w-[70%] mb-4">

            <DataToolbar
                showSortDropdownButton={true}
                showSortDirectionButton={true}
                showFilterDropdownButton={true}
                showSearchInput={true}
                showGroupButton={true}
                isFilterActive={isFilterActive}
                onFilterReset={() => $itemFilters = {}}
                bind:isGrouped={$itemGroupMode}
                bind:searchString={$itemSearch}
                bind:sortDirection={sortDirection}
            >

                <RecipesSortDropdown
                    slot="sortDropdown"
                    onSortReset={resetSort}
                    bind:sortParams={$itemSortParams}
                />

                <RecipesFilterDropdown
                    slot="filterDropdown"
                    filters={$itemSortParams.sortFieldParams}
                    bind:selectedFilters={$itemFilters}
                />

            </DataToolbar>

        </div>

        <div class="w-full pb-8">

            {#if $itemGroupMode}

                {#each displayedGroups as group}

                    {@const title = group.title}

                    <div class="flex flex-col gap-1 animate-fadeIn pb-5">

                        <div class="flex items-center gap-2 mb-2">

                            <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] font-sdk pl-0.5">
                                {title}
                            </h3>

                            {#if groupField === "rarity"}

                                <Icon
                                    name="star"
                                    class="h-5 w-5 text-[#21272C] dark:text-[#E4E4E4]"
                                />

                            {/if}

                        </div>

                        <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                            {#each group.list as item}

                                <button
                                    tabindex="0"
                                    class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                                    on:click|preventDefault|stopPropagation={() => selectItem(item)}
                                >

                                    <ItemStackCard
                                        item={item}
                                        highlight={item.gameId === data.itemId}
                                        event={itemEventMap.get(item.gameId)}
                                        showHoverEffect={true}
                                    />

                                </button>

                            {/each}

                        </div>

                    </div>

                {/each}

            {:else}

                <div class="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] md:grid-cols-[repeat(auto-fill,110px)] gap-3 justify-start">

                    {#each displayedItems as item}

                        <button
                            tabindex="0"
                            class="relative w-[110px] h-[110px] rounded-[6px] cursor-pointer text-left aspect-square transition-all duration-300"
                            on:click|preventDefault|stopPropagation={() => selectItem(item)}
                        >

                            <ItemStackCard
                                item={item}
                                highlight={item.gameId === data.itemId}
                                event={itemEventMap.get(item.gameId)}
                                showHoverEffect={true}
                            />

                        </button>

                    {/each}

                </div>

            {/if}

            {#if ($itemGroupMode && groupDisplayLimit < groupedItems.length) || (!$itemGroupMode && flatDisplayLimit < filteredItems.length)}

                <div class="h-10 w-full mt-4 flex items-center justify-center opacity-50">

                    <div class="w-8 h-8 animate-spin dark:text-white">

                        <Icon
                            name="loading"
                            class="w-8 h-8 opacity-100"
                        />

                    </div>

                </div>

            {/if}

        </div>

    </div>

</div>

{#if isBottomSheetOpen && data.itemId}

    <button
        type="button"
        class="xl:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#F9B90C] hover:bg-[#FFC01E] text-black rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 border border-white dark:border-[#1A1A1A] cursor-pointer"
        on:click={() => (isBottomSheetOpen = true)}
        title="Results"
    >

        <Icon
            name="inbox"
            class="w-6 h-6 text-black"
        />

    </button>

{/if}