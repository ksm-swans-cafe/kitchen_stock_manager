import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    withCredentials: true, // Always send cookies with requests
})