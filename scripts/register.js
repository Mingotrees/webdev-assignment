import { BASE_URL, API } from "./constants.js";

const registerForm = $("#register-form");

registerForm.on('submit', (e)=>{
    e.preventDefault();
    const FName = $("#first-name").val();
    const LName = $("#last-name").val();
    const password = $("#password").val();
    const email = $("#email").val();
    const confirmPassword = $("#confirm-password").val();

    if(password != confirmPassword){
        alert("nope");
        registerForm.trigger("reset");
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
                window.location.href = `${BASE_URL}/login.html`;
            }else{
                console.log("Error ", response.message);
            }
    };

    xhttp.onerror = () => {
        console.error("Network error occurred");
    };

    const payload = JSON.stringify(newAccount);
    xhttp.send(payload);
}