import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000/api/v1" });

// request interceptor

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // check token validity and set request Header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
