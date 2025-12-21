<script lang="ts">
    export let currentPath: string = "/";
</script>
<div class="flex gap-6">
    <a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/'}
       href="/">About</a>
    <a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/projects'}
       href="/projects">Projects</a>
    <a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/blog'}
       href="/writing">Writing</a>
    <a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/guestbook'}
       href="/guestbook">Guestbook</a>
</div>
