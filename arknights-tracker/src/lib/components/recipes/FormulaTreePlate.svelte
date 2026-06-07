<script>
    import { FormulaTree } from "$lib/classes/formulaTree/FormulaTree.js";
    import { Item } from "$lib/classes/items/Item.js";
    import DragPlate from "$lib/components/DragPlate.svelte";
    import ItemStackCard from "$lib/components/ItemStackCard.svelte";
    import ResourcePointCard from "$lib/components/recipes/ResourcePointCard.svelte";

    export let startItemId = "item_activity_xiranite_enr_hulu";
    export let startFormula;

    let tree = new FormulaTree();

    let startItem;
    let nodes = [];

    $: startItem = Item.getItem(startItemId);

    $: if (
        startItem
        && (startItem.id !== tree.startNode?.itemId
            || startFormula && startFormula !== tree.startNode?.formula)
    ) {
        tree.setStartNode(startItem.id, startFormula);
        forceTreeUpdate();
    }

    $: nodes = [...tree.getIterator()];

    function getXpx(stage) {
        return 100 + stage * 200;
    }

    function getYpx(layer) {
        return 100 + layer * 200;
    }

    function forceTreeUpdate() {
        tree = tree;
    }

</script>

<DragPlate>
    <div class="relative shrink-0 bg-gray-600"
         style="width: {getXpx(tree.maxStage) + 200}px; height: {getYpx(tree.maxLayer) + 200}px;">

        {#each nodes as node}

            <div class="absolute top-[{getYpx(node.layer)}px] right-[{getXpx(node.stage)}px] top-0"
                 style="top: {getYpx(node.layer)}px; right:{getXpx(node.stage)}px">
                {#if node.type === "itemNode"}

                    <ItemStackCard
                        itemId={node.itemId}
                    />

                {:else if node.type === "resourcePointNode"}

                    <ResourcePointCard
                        itemId={node.itemId}
                    />

                {/if}
            </div>

        {/each}

    </div>
</DragPlate>