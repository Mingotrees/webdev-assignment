import {BASE_URL, API, getUser, setUser } from './constants.js';


const signInForm = $("#signInForm");
const signUpForm = $("#signUpForm");
const showSignUpBtn = $("#showSignUp");
const showSignInBtn = $("#showSignIn");

document.addEventListener("DOMContentLoaded", function () {
        if(getUser()){
            window.location.href = `${BASE_URL}/todo.html`;
        }

        showSignUpBtn.on("click", function (e) {
          e.preventDefault();
          signInForm.hide();
          signUpForm.show();
        });

        showSignInBtn.on("click", function (e) {
          e.preventDefault();
          signUpForm.hide();
          signInForm.show();
        });
});

signInForm.on('submit', (e) =>{
    e.preventDefault();
    const email = $("#signin-email").val(); 
    const password = $("#signin-password").val();
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
            window.location.href = `${BASE_URL}/todo.html`;
        }else{
            alert(response.message);
        }
    };

    xhttp.onerror = function () {
        console.error("Network error occurred");
    };

    xhttp.send();
}

signUpForm.on('submit', (e)=>{
    e.preventDefault();
    const FName = $("#signup-fname").val();
    const LName = $("#signup-lname").val();
    const password = $("#signup-password").val();
    const email = $("#signup-email").val();
    const confirmPassword = $("#signup-confirm-password").val();

    if(password != confirmPassword){
        alert("Password does not match");
        signUpForm.trigger("reset");
        return;
    }

    const newAccount = {
        'first_name': FName, 
        'last_name': LName,
        'email': email,
        'password': password,
        'confirm_password': confirmPassword
    }

    register(newAccount);
})

function register(newAccount){
    const xhttp = new XMLHttpRequest();
    const url = `${API}/signup_action.php`
    xhttp.open("POST", url, true);
    

    xhttp.onload = () => {
            const response = JSON.parse(xhttp.responseText);
            if(response.status === 200){
                alert("resgistered succesfully, login again");
                window.location.href = `${BASE_URL}/index.html`;
            }else{
                alert(response.message);
            }
    };

    xhttp.onerror = () => {
        console.error("Network error occurred");
    };

    const payload = JSON.stringify(newAccount);
    xhttp.send(payload); 
}