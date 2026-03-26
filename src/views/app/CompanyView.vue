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
<div class="company-page">

    <!-- TITLE -->
    <h1 class="title">
        Companies
    </h1>

    <!-- FORM -->
    <div class="card">

        <h2 class="card-title">
            Create Company
        </h2>

        <div class="form">

            <input
                v-model="name"
                placeholder="Company name"
                class="input"
            />

            <select v-model="plan" class="input">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
            </select>

            <button @click="createCompany" class="btn-primary">
                Create
            </button>

        </div>

    </div>

    <!-- TABLE -->
    <div class="card table-card">

        <table class="table">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>

                <tr v-for="company in store.companies" :key="company.id">

                    <td>{{ company.id }}</td>
                    <td>{{ company.name }}</td>
                    <td class="muted">{{ company.slug }}</td>

                    <td>
                        <span
                            class="badge"
                            :class="company.plan === 'pro' ? 'pro' : 'free'"
                        >
                            {{ company.plan }}
                        </span>
                    </td>

                    <td>
                        <button
                            @click="store.deleteCompany(company.id)"
                            class="btn-danger"
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

<style scoped>
.company-page {
  min-height: 100vh;
  padding: 30px;
  background: linear-gradient(135deg, #0a1a2f, #1e3c72);
  color: #fff;
}

/* TITLE */
.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #FFD700;
}

/* CARD */
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 25px;
}

/* FORM */
.card-title {
  margin-bottom: 15px;
  color: #FFD700;
}

.form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* INPUTS */
.input {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: #fff;
  outline: none;
}

.input::placeholder {
  color: #aaa;
}

.input:focus {
  border-color: #FFD700;
}

/* BUTTONS */
.btn-primary {
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.btn-danger:hover {
  background: #dc2626;
}

/* TABLE */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 12px;
  color: #FFD700;
  font-size: 12px;
  text-transform: uppercase;
}

.table td {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.table tr:hover {
  background: rgba(255,255,255,0.05);
}

/* BADGES */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.badge.free {
  background: rgba(255,255,255,0.1);
}

.badge.pro {
  background: rgba(34,197,94,0.2);
  color: #22c55e;
}

/* TEXT */
.muted {
  color: #aaa;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .form {
    flex-direction: column;
  }
}
</style>