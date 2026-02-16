import axios from "axios";

const API_BASE=import.meta.env.VITE_API_URL||"http://localhost:5000/api";
console.log("CINE CARNIVAL API:",API_BASE);

const api=axios.create({
baseURL:API_BASE,
headers:{"Content-Type":"application/json"},
timeout:10000,
withCredentials:false
});

api.interceptors.request.use(config=>{
const token=localStorage.getItem("token");
if(token)config.headers.Authorization="Bearer "+token;
return config;
},error=>Promise.reject(error));

api.interceptors.response.use(response=>response,error=>{
if(error.response?.status===401){
localStorage.removeItem("token");
localStorage.removeItem("user");
if(window.location.pathname!=="/login")window.location.replace("/login");
}
return Promise.reject(error);
});

export const authAPI={
register:data=>api.post("/auth/register",data),
login:data=>api.post("/auth/login",data)
};

export const moviesAPI={
getAll:()=>api.get("/movies"),
create:data=>api.post("/movies",data)
};

export const theatresAPI={
getByMovie:movieId=>api.get(`/theatres/${movieId}`),
create:data=>api.post("/theatres",data)
};

export const bookingsAPI={
create:data=>api.post("/bookings",data),
createOrder:data=>api.post("/bookings/create-order",data),
verifyPayment:data=>api.post("/bookings/verify",data),
getByUser:userId=>api.get(`/bookings/user/${userId}`),
getAll:()=>api.get("/bookings/all"),
delete:bookingId=>api.delete(`/bookings/${bookingId}`),
updateSeats:(bookingId,data)=>api.put(`/bookings/${bookingId}/seats`,data)
};

export default api;
