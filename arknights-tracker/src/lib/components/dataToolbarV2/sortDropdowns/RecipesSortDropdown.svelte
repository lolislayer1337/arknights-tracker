<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { getDefaultItemSortParams } from "$lib/stores/filterStore.js";

    export let sortParams = {};

    export let onSortReset = () => {
        sortParams = getDefaultItemSortParams();
    };

    function sortReset() {
        onSortReset();
    }

    function switchLocaleSort() {
        let current = sortParams.sortFieldParams.localeName;
        sortParams.sortFieldParams.localeName = current === "a-z" ? "z-a" : "a-z";
    }

    function getSortFieldLocale(sortFieldName) {
        switch (sortFieldName) {
            case "itemGroups":
                return $t("sort.itemGroup");
            case "events":
                return $t("sort.eventsTitle");
            case "itemTypes":
                return $t("sort.itemTypesTitle");
            case "itemMaterials":
                return $t("sort.itemMaterialsTitle");
            case "localeName":
                return $t("sort.localeNameTitle");
            default:
                return $t(`sort.${sortFieldName}`);
        }
    }

    function getFilterNameLocale(sortFieldName, filterName) {
        if (sortFieldName === "rarity") {
            return filterName;
        }

        if (sortFieldName === "events") {
            if (filterName === "nonEvent") {
                return $t("sort.events.nonEvent");
            }

            return $t(FactoryEvent.getEvent(filterName)?.title);
        }

        return $t(`sort.${sortFieldName}.${filterName}`);
    }

    let openedSortField = null;

    $: isSortFieldOpen = (sortFieldName) => sortFieldName === openedSortField;

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={sortReset}
>

    <DraggableSortGroups
        openableGroups={true}
        getLocaleFunc={getSortFieldLocale}
        bind:groupList={sortParams.sortFieldOrder}
        bind:openedGroup={openedSortField}
    >


        {#if openedSortField === "rarity"}

            <DraggableParamList
                paramBox={RarityParamBox}
                getLocaleFunc={(rarity) => rarity}
                bind:paramList={sortParams.sortFieldParams.rarity}
            />

        {:else if openedSortField === "localeName"}

            <button
                class="flex flex-row justify-between gap-2 px-2 min-w-full rounded-md h-8 bg-gray-300 dark:bg-[#2a2a2a] border border-gray-400 dark:border-[#444444]"
                on:click={switchLocaleSort}
            >

                <span class="font-bold text-xs text-gray-800 dark:text-gray-300 pl-2 pt-1.5 pointer-events-none">
                    {$t(`sort.localeName.${sortParams.sortFieldParams[openedSortField]}`)}
                </span>

                <div class="relative flex flex-col h-full w-4 items-center justify-center">

                    <Icon
                        name="arrowDown"
                        class="absolute top-1/2 -translate-y-[85%] w-3 h-3 text-gray-500 rotate-180"
                    />

                    <Icon
                        name="arrowDown"
                        class="absolute top-1/2 -translate-y-[15%] w-3 h-3 text-gray-500"
                    />

                </div>

            </button>

        {:else}

            <DraggableParamList
                paramBox={TextParamBox}
                getLocaleFunc={(param) => getFilterNameLocale(openedSortField, param)}
                bind:paramList={sortParams.sortFieldParams[openedSortField]}
            />

        {/if}


    </DraggableSortGroups>

</DropdownTemplate>