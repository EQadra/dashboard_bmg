import { defineStore } from 'pinia'
import { useAxios } from '../plugins/axios'

export const useCompanyStore = defineStore('company', {

  state: () => ({
    companies: [],
    pagination: {},
    loading: false
  }),

  actions: {

    async fetchCompanies(page = 1) {

      const api = useAxios()

      this.loading = true

      try {

        const res = await api.get(`/api/companies?page=${page}`)

        this.companies = res.data.data
        this.pagination = res.data

      } catch (error) {

        console.error('Error loading companies', error)

      } finally {

        this.loading = false

      }

    },

    async createCompany(data) {

      const api = useAxios()

      await api.post('/api/companies', data)

      await this.fetchCompanies()

    },

    async updateCompany(id, data) {

      const api = useAxios()

      await api.put(`/api/companies/${id}`, data)

      await this.fetchCompanies()

    },

    async deleteCompany(id) {

      const api = useAxios()

      await api.delete(`/api/companies/${id}`)

      await this.fetchCompanies()

    }

  }

})