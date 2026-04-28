import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the Firebase token
api.interceptors.request.use(
    async (config) => {
        const user = auth?.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        const body = response.data;
        if (
            body &&
            typeof body === 'object' &&
            'data' in body &&
            'statusCode' in body &&
            'timestamp' in body
        ) {
            response.data = body.data;
            if (body.meta !== undefined) {
                response.meta = body.meta;
            }
        }
        return response;
    },
    (error) => Promise.reject(error)
);

export default api;
