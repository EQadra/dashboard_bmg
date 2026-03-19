<script setup>
import { onMounted, ref } from 'vue'
import { useCompanyStore } from '../../stores/useCompanyStore'

const store = useCompanyStore()

const name = ref('')
const plan = ref('free')

onMounted(() => {
    store.fetchCompanies()
})

const createCompany = async () => {
    await store.createCompany({
        name: name.value,
        plan: plan.value
    })

    name.value = ''
    plan.value = 'free'
}
</script>

<template>
<div class="min-h-screen bg-gray-50 p-10">

    <!-- TITLE -->
    <h1 class="text-3xl font-bold text-gray-800 mb-8">
        Companies
    </h1>

    <!-- FORM -->
    <div class="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">

        <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Create Company
        </h2>

        <div class="flex flex-col md:flex-row gap-4">

            <input
                v-model="name"
                placeholder="Company name"
                class="flex-1 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 rounded-lg transition"
            />

            <select
                v-model="plan"
                class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none p-3 rounded-lg transition"
            >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
            </select>

            <button
                @click="createCompany"
                class="bg-blue-600 hover:bg-blue-700 transition text-white font-medium px-6 py-3 rounded-lg shadow"
            >
                Create
            </button>

        </div>

    </div>

    <!-- TABLE -->
    <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">

        <table class="w-full text-sm text-left">

            <thead class="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                <tr>
                    <th class="p-4">ID</th>
                    <th class="p-4">Name</th>
                    <th class="p-4">Slug</th>
                    <th class="p-4">Plan</th>
                    <th class="p-4">Actions</th>
                </tr>
            </thead>

            <tbody>

                <tr
                    v-for="company in store.companies"
                    :key="company.id"
                    class="border-t hover:bg-gray-50 transition"
                >

                    <td class="p-4 font-medium text-gray-700">
                        {{ company.id }}
                    </td>

                    <td class="p-4 text-gray-700">
                        {{ company.name }}
                    </td>

                    <td class="p-4 text-gray-500">
                        {{ company.slug }}
                    </td>

                    <td class="p-4">
                        <span
                            class="px-3 py-1 text-xs font-semibold rounded-full"
                            :class="company.plan === 'pro'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-700'"
                        >
                            {{ company.plan }}
                        </span>
                    </td>

                    <td class="p-4">

                        <button
                            @click="store.deleteCompany(company.id)"
                            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            </tbody>

        </table>

    </div>

</div>
</template>