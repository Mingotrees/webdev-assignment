import {BASE_URL, getUser, logOut} from './constants.js';

const logout = $("#logout-btn");


let user = null;

/*
* Check if user exist in localStorage
*/
document.addEventListener("DOMContentLoaded", ()=>{
    if(!getUser()){
        alert("Login First Cousin");
        window.location.replace(`${BASE_URL}/login.html`);
    }else{
        user = JSON.parse(getUser());
    }
});


logout.on('click', ()=>{
    logOut();
    window.location.replace(`${BASE_URL}/login.html`);
})


