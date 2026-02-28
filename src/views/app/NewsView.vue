<template>
  <div class="min-h-screen bg-[#0b1a33] text-slate-100 font-[Inter] p-8">
    <div class="max-w-7xl mx-auto">

      <h2 class="text-2xl font-bold text-blue-300 tracking-tight mb-4">
        📰 Gestión de Noticias
      </h2>

      <!-- Botón crear -->
      <button
        @click="openCreate"
        class="mb-6 bg-blue-600 hover:bg-blue-700 transition
               text-white px-5 py-2 rounded-lg font-semibold shadow"
      >
        Agregar noticia
      </button>

      <!-- Vacío -->
      <div
        v-if="store.news.length === 0"
        class="text-slate-400 italic mt-6"
      >
        No hay noticias registradas.
      </div>

      <!-- Grid -->
      <div v-else class="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="item in store.news"
          :key="item.id"
          class="bg-[#12244a] border border-white/10 rounded-2xl shadow-lg
                 p-5 flex flex-col justify-between transition hover:shadow-xl"
        >
          <div>
            <h3 class="text-lg font-bold text-slate-100 mb-1">
              {{ item.titulo }}
            </h3>

            <p class="text-slate-300 text-sm mt-2">
              {{ item.descripcion }}
            </p>

            <p class="text-slate-400 text-xs mt-3 break-all">
              📅 {{ formatDate(item.fecha_publicacion) }}
              <br />
              🔗
              <a
                :href="item.url"
                target="_blank"
                class="text-blue-400 hover:text-blue-300 underline"
              >
                {{ item.url }}
              </a>
            </p>
          </div>

          <!-- Acciones -->
          <div class="flex justify-between items-center mt-4 text-sm">
            <button
              @click="edit(item)"
              class="text-blue-400 hover:text-blue-300 underline"
            >
              Editar
            </button>
            <button
              @click="del(item.id)"
              class="text-red-400 hover:text-red-300 underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal
      v-if="showModal"
      @close="closeModal"
      :title="editMode ? 'Editar noticia' : 'Crear noticia'"
    >
      <form @submit.prevent="submit" class="space-y-3">
        <input
          v-model="form.titulo"
          placeholder="Título"
          required
          class="w-full bg-[#0b1a33] border border-white/10 rounded-lg
                 p-2 text-slate-100 placeholder:text-slate-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          v-model="form.descripcion"
          placeholder="Descripción"
          rows="3"
          required
          class="w-full bg-[#0b1a33] border border-white/10 rounded-lg
                 p-2 text-slate-100 placeholder:text-slate-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>

        <input
          v-model="form.url"
          placeholder="URL"
          type="url"
          class="w-full bg-[#0b1a33] border border-white/10 rounded-lg
                 p-2 text-slate-100 placeholder:text-slate-500
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          v-model="form.fecha_publicacion"
          type="date"
          class="w-full bg-[#0b1a33] border border-white/10 rounded-lg
                 p-2 text-slate-100
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 transition
                 text-white py-2 rounded-lg font-semibold mt-2"
        >
          {{ editMode ? 'Actualizar' : 'Crear' }}
        </button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNewsStore } from '../../stores/useNewsStore'
import { storeToRefs } from 'pinia'
import Modal from '../../components/Modal.vue'

const store = useNewsStore()
const { news } = storeToRefs(store)

const showModal = ref(false)
const editMode = ref(false)
const selectedId = ref(null)

const form = ref({
  titulo: '',
  descripcion: '',
  url: '',
  fecha_publicacion: '',
})

function openCreate() {
  resetForm()
  editMode.value = false
  showModal.value = true
}

function edit(item) {
  form.value = { ...item }
  selectedId.value = item.id
  editMode.value = true
  showModal.value = true
}

function resetForm() {
  form.value = {
    titulo: '',
    descripcion: '',
    url: '',
    fecha_publicacion: '',
  }
  selectedId.value = null
}

function closeModal() {
  showModal.value = false
}

async function submit() {
  if (!form.value.titulo.trim() || !form.value.descripcion.trim()) {
    alert('El título y la descripción son obligatorios.')
    return
  }

  if (editMode.value) {
    await store.update(selectedId.value, form.value)
  } else {
    await store.create(form.value)
  }
  closeModal()
}

async function del(id) {
  if (confirm('¿Eliminar esta noticia?')) {
    await store.remove(id)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha'
  return new Date(dateStr).toLocaleDateString()
}

onMounted(() => store.fetchAll())
</script>


<style scoped>
.container {
  padding: 24px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 16px;
}
.btn-primary:hover {
  background-color: #1d4ed8;
}

.news-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.news-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.news-title {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.news-desc {
  margin-top: 8px;
  color: #374151;
  font-size: 14px;
}

.news-meta {
  margin-top: 10px;
  font-size: 13px;
  color: #6b7280;
}

.news-link {
  color: #2563eb;
  text-decoration: underline;
  word-break: break-all;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}

.link {
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  border: none;
  background: none;
}
.link.edit {
  color: #2563eb;
}
.link.delete {
  color: #dc2626;
}

.input {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.empty {
  color: #6b7280;
  font-style: italic;
  margin-top: 16px;
}
</style>
