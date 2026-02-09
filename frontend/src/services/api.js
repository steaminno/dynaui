import axios from 'axios';

const API_URL = 'http://localhost:8080/api/forms';

export const getForms = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getFormById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const submitForm = async (id, data) => {
    try {
        await axios.post(`${API_URL}/${id}/data`, data);
        return { success: true };
    } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
    }
};

export const searchFormData = async (id, filters, page = 0, size = 10) => {
    const params = { ...filters, page, size };
    const response = await axios.get(`${API_URL}/${id}/data`, { params });
    return response.data;
};
