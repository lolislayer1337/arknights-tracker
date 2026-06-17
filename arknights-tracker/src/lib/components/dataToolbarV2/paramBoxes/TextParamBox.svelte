<script>
    import ParamBox from "$lib/components/dataToolbarV2/paramBoxes/ParamBox.svelte";

    export let styleMode = "default";
</script>

<ParamBox styleMode={styleMode}>

    <slot name="left"/>

    <span class="text-xs font-bold pointer-events-none">
        <slot />
    </span>

    <slot name="right"/>

</ParamBox>