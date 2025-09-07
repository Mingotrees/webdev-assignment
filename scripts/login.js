import {BASE_URL, API, getUser, setUser } from './constants.js';

const loginForm = $("#login-form");

loginForm.on('submit', (e) =>{
    e.preventDefault();
    const email = $("#email").val(); 
    const password = $("#password").val();
    const account = {
        email,
        password
    };
    login(account);
});

function login(account){
    const xhttp = new XMLHttpRequest();
    const url = `${API}/signin_action.php?email=${account['email']}&password=${account['password']}`;
    xhttp.open("GET", url , true);
    
    xhttp.onload = () => {
        const response = JSON.parse(xhttp.responseText);
        if(response.status === 200){
            setUser(response.data);
            window.location.href = `${BASE_URL}/index.html`;
        }else{
            console.log("Error ", response.message);
        }
    };

    xhttp.onerror = function () {
        console.error("Network error occurred");
    };

    xhttp.send();
}