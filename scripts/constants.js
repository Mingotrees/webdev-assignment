let USER = JSON.parse(localStorage.getItem('user'));
export const BASE_URL = "http://127.0.0.1:8080";
export const API = "https://todo-list.dcism.org";

export function getUser() {
    return USER;
}

export function setUser(user) {
    USER = user;
    localStorage.setItem('user',  JSON.stringify(user));
}

export function logOut(){
    localStorage.removeItem('user');
    USER = null;
}
