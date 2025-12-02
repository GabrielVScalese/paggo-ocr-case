import axios from "axios";
import Cookies from "js-cookie";

// Lembre-se: se mudou o backend para porta 3001, ajuste aqui!
const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("paggo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
