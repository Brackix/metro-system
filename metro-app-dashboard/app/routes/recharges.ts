import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const getRecharges = () => {
  return axios.get(`${API_URL}/recharges`);
};

export const getRecharge = (id: string) => {
  return axios.get(`${API_URL}/recharges/${id}`);
};

export const createRecharge = (data: {
  userid: number;
  cardid: number;
  amount: number;
  previousbalance?: number;
  newbalance?: number;
  paymentmethod: string;
  deviceip?: string;
  devicemodel?: string;
}) => {
  return axios.post(`${API_URL}/recharges`, data);
};

export const deleteRecharge = (id: string) => {
  return axios.delete(`${API_URL}/recharges/${id}`);
};
