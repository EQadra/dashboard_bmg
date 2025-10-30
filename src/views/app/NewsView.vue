<template>
  <div class="container">
    <h2 class="title">📰 Gestión de Noticias</h2>

    <!-- Botón para crear -->
    <button @click="openCreate" class="btn-primary">Agregar noticia</button>

    <!-- Listado -->
    <div v-if="store.news.length === 0" class="empty">No hay noticias registradas.</div>

    <div v-else class="news-grid">
      <div v-for="item in store.news" :key="item.id" class="news-card">
        <div>
          <h3 class="news-title">{{ item.titulo }}</h3>
          <p class="news-desc">{{ item.descripcion }}</p>
          <p class="news-meta">
            📅 {{ formatDate(item.fecha_publicacion) }} |
            🔗 <a :href="item.url" target="_blank" class="news-link">{{ item.url }}</a>
          </p>
        </div>

        <div class="card-actions">
          <button @click="edit(item)" class="link edit">Editar</button>
          <button @click="del(item.id)" class="link delete">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal
      v-if="showModal"
      @close="closeModal"
      :title="editMode ? 'Editar noticia' : 'Crear noticia'"
    >
      <form @submit.prevent="submit">
        <input v-model="form.titulo" placeholder="Título" required class="input" />
        <textarea
          v-model="form.descripcion"
          placeholder="Descripción"
          rows="3"
          required
          class="input"
        ></textarea>
        <input v-model="form.url" placeholder="URL" type="url" class="input" />
        <input v-model="form.fecha_publicacion" type="date" class="input" />

        <button class="btn-primary" type="submit">
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
