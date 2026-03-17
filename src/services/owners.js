import api from './api';
export const ownersService = {
    async getMe() {
        const response = await api.get('/owners/me');
        return response.data;
    },
    async getPets(ownerId = 'me') {
        const response = await api.get(`/owners/${ownerId}/pets`);
        return response.data;
    },
    async createPet(petData) {
        const response = await api.post('/owners/me/pets', petData);
        return response.data;
    },
    async updatePet(petId, petData) {
        const response = await api.put(`/owners/me/pets/${petId}`, petData);
        return response.data;
    },
    async deletePet(petId) {
        await api.delete(`/owners/me/pets/${petId}`);
    },
    async getPetHealthRecords(petId) {
        const response = await api.get(`/owners/me/pets/${petId}/health-records`);
        return response.data;
    }
};
