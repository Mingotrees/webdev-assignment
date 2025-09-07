let USER = localStorage.getItem('user');
export const BASE_URL = "http://127.0.0.1:3000/";
export const API = "https://todo-list.dcism.org";

export function getUser() {
    return USER;
}

export function setUser(user) {
    USER = user;
    localStorage.setItem('user',  JSON.stringify(user));
}