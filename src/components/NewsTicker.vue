<template>
<div class="overflow-hidden rounded-md bg-yellow-400 py-2">
<div
ref="track"
class="whitespace-nowrap animate-ticker px-4 font-semibold"
:style="{ display: 'inline-block' }"
>
<span v-for="(item, i) in doubled" :key="i" class="mr-8 text-black">{{ item }} •••</span>
</div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const props = defineProps<{ items: string[] }>()


// We'll duplicate the list so the CSS ticker never shows gap
const doubled = computed(() => [...props.items, ...props.items])
</script>


<style>
@keyframes ticker {
0% { transform: translateX(0%); }
100% { transform: translateX(-50%); }
}
.animate-ticker {
display: inline-block;
animation: ticker 18s linear infinite;
}
</style>