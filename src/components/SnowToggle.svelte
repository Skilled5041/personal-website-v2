<script lang="ts">
    import { onMount } from "svelte";
    import snowflakeIcon from "../assets/snowflake.svg?raw";

    let enabled = true;

    onMount(() => {
        const stored = localStorage.getItem("snow-enabled");
        if (stored !== null) {
            enabled = stored === "true";
        }
        updateSnowVisibility();
    });

    function toggle() {
        enabled = !enabled;
        localStorage.setItem("snow-enabled", String(enabled));
        updateSnowVisibility();
    }

    function updateSnowVisibility() {
        // Dispatch a custom event that the Snow component can listen to
        window.dispatchEvent(new CustomEvent("snow-toggle", { detail: { enabled } }));
    }
</script>

<button
    on:click={toggle}
    class="cursor-pointer flex items-center justify-center text-ctp-subtext0 hover:text-ctp-text transition-all duration-200"
    title={enabled ? "Disable snow" : "Enable snow"}
    aria-label={enabled ? "Disable snow" : "Enable snow"}
>
    <span class="mt-0.5 duration-200" class:opacity-50={!enabled}>
        {@html snowflakeIcon}
    </span>
</button>
