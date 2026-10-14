import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sms_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Expired / invalid token on a protected call -> back to login
    const isAuthCall = err.config?.url?.startsWith("/auth/login");
    if (err.response?.status === 401 && !isAuthCall && typeof window !== "undefined") {
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/** Turns an axios error into { message, fields } for display. */
export function parseError(err) {
  const data = err.response?.data;
  if (data) return { message: data.message || "Request failed", fields: data.errors || {} };
  return { message: "Cannot reach the server. Is the backend running?", fields: {} };
}

export default api;
