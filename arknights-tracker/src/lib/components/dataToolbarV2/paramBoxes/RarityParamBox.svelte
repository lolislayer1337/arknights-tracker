<script>
    import ParamBox from "$lib/components/dataToolbarV2/paramBoxes/ParamBox.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let styleMode = "default";
</script>

<ParamBox styleMode={styleMode}>

    <span class="font-bold pointer-events-none">
        <slot />
    </span>

    <Icon
        name="star"
        class="w-3 h-3 text-current pointer-events-none"
    />

</ParamBox>