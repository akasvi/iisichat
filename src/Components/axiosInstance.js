import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3007",
});

export default axiosInstance;
