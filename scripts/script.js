import {BASE_URL, getUser, setUser} from './constants.js';

let user = null;
document.addEventListener("DOMContentLoaded", ()=>{
    if(!getUser()){
        alert("Login First Cousin");
        window.location.replace(`${BASE_URL}login.html`);
    }else{
        user = JSON.parse(getUser());
    }
});
