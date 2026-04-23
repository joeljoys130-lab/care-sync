const BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const login = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
};

export const register = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
};

export const getDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctors`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch doctors');
  return json.data;
};

export const createAppointment = async (data) => {
  const res = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create appointment');
  return json.data;
};

export const getAppointments = async () => {
  const res = await fetch(`${BASE_URL}/appointments`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch appointments');
  return json.data;
};

export const cancelAppointment = async (id) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to cancel appointment');
  return json;
};
