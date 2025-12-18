<script lang="ts">
    export let currentPath: string = "/";
</script>

<a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/'}
   href="/">About</a>
<a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/projects'}
   href="/projects">Projects</a>
<a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/blog'}
   href="/blog">Blog</a>
<a class="font-medium hover:text-ctp-mauve-100 duration-200" class:text-ctp-mauve={currentPath === '/guestbook'}
   href="/guestbook">Guestbook</a>
