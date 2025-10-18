import axios from "axios";


export const BASE_URL = "https://connect-ybbm.onrender.com";

export const clientServer=axios.create({
    baseURL:BASE_URL,
});