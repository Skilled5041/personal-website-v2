<script lang="ts">
    export let currentPath: string = "/";
    // Normalize path to remove trailing slash except for root
    $: normalizedPath =
        currentPath.length > 1 && currentPath.endsWith("/")
            ? currentPath.slice(0, -1)
            : currentPath;
</script>

<div class="flex gap-6">
    <a
        class="font-medium hover:text-ctp-mauve-100 duration-200"
        class:text-ctp-mauve={normalizedPath === "/"}
        href="/">About</a
    >
    <a
        class="font-medium hover:text-ctp-mauve-100 duration-200"
        class:text-ctp-mauve={normalizedPath === "/projects"}
        href="/projects">Projects</a
    >
    <a
        class="font-medium hover:text-ctp-mauve-100 duration-200"
        class:text-ctp-mauve={normalizedPath === "/writing"}
        href="/writing">Writing</a
    >
    <a
        class="font-medium hover:text-ctp-mauve-100 duration-200"
        class:text-ctp-mauve={normalizedPath === "/guestbook"}
        href="/guestbook">Guestbook</a
    >
</div>
