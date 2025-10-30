

// FILE: src/components/InputField.vue
<template>
<div>
<label class="block mb-1 font-semibold text-sm">{{ label }}</label>
<input :placeholder="placeholder" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
class="w-full rounded-md p-2 bg-black text-green-400 border border-green-600" />
</div>
</template>


<script setup>
const props = defineProps({ label: String, modelValue: String, placeholder: String })
const emit = defineEmits(['update:modelValue'])
</script>