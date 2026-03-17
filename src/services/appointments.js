import api from './api';
export const appointmentsService = {
    async getAppointments(params) {
        const response = await api.get('/appointments', { params });
        return response.data;
    },
    async createAppointment(appointment) {
        const response = await api.post('/appointments', appointment);
        return response.data;
    },
    async updateAppointment(id, appointment) {
        const response = await api.put(`/appointments/${id}`, appointment);
        return response.data;
    },
    async cancelAppointment(id) {
        const response = await api.patch(`/appointments/${id}/cancel`);
        return response.data;
    },
    async getAppointmentById(id) {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },
    async getVisit(id) {
        const response = await api.get(`/visits/${id}`);
        return response.data;
    },
    async completeVisit(id, data) {
        const response = await api.patch(`/visits/${id}/complete`, data);
        return response.data;
    },
    async getInvoice(visitId) {
        const response = await api.get(`/visits/${visitId}/invoice`);
        return response.data;
    },
    async payInvoice(invoiceId) {
        const response = await api.post(`/invoices/${invoiceId}/pay`);
        return response.data;
    }
};
