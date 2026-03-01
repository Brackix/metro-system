import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
});

// ✅ GET /api/users - Obtener todos los usuarios
export const getUsers = () => {
    return instance.get("/users");
};

// ✅ POST /api/users/register - Crear usuario
export const createUser = (user: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    passwordhash: string;
}) => {
    return instance.post("/users", user); // ✅ CAMBIADO: /users en lugar de /users/register
};

// ✅ PATCH /api/users/:userid - Actualizar usuario
export const updateUser = (userid: number, user: {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    passwordhash: string;
}) => {
    return instance.patch(`/users/${userid}`, user);
};

// ✅ DELETE /api/users/:userid - Eliminar usuario
export const deleteUser = (userid: number) => {
    return instance.delete(`/users/${userid}`);
};
