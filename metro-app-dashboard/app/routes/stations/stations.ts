import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
});

export const getStations = () => {
    return instance.get("/stations");
};

export const searchStation = (id: string) => {
    return instance.get(`/stations/${id}`);
};

export const searchStations = (query: string) => {
    return instance.get(`/stations/search?q=${encodeURIComponent(query)}`);
};

export const createStation = (station: {
    name: string;
    line: string;
    address: string | null;
    active: boolean;
    lat: number;
    lng: number;
}) => {
    return instance.post("/stations", station);
};

export const updateStation = (id: string, station: {
    name: string;
    line: string;
    address: string | null;
    active: boolean;
    lat: number;
    lng: number;
}) => {
    return instance.patch(`/stations/${id}`, station); 
};

export const deleteStation = (id: string) => {
    return instance.delete(`/stations/${id}`);
};
