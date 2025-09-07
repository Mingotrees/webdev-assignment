import { API, getUser } from "./constants.js";

export function getTasks(status = "active") {
    const user = getUser();

    if (!user || !user.id) {
        console.warn("No user logged in.");
        return;
    }
    console.log(user.id);

    return $.ajax({
        url: `${API}/getItems_action.php?status=${status}&user_id=${user.id}`,
        method: "GET",
        data: {
            status: status,
            user_id: user.id
        },
        dataType: "json"
    });
}

export function addTask(name, description, status = "active") {
  
  return new Promise((resolve, reject) => {
    
    const user = getUser();
    if (!user || !user.id) {
      reject("User not logged in");
      return;
    }

    const task = {
    "item_name": name,
    "item_description": description,
    "user_id": user.id 
    }

    console.log(user.id);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/addItem_action.php`, true);
    

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // Handle possible warnings before JSON
          const jsonMatch = xhr.responseText.match(/\{.*\}$/s);
          const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
          resolve(data);
        } catch (e) {
          reject("Invalid JSON: " + xhr.responseText);
        }
      } else {
        reject(xhr.statusText);
        console.log("error");
      }
    };

    xhr.onerror = function () {
      reject("Network error");
    };

    const params = JSON.stringify(task)
    xhr.send(params);
  });
}



export async function deleteTask(taskId) {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error("User not logged in");
  }

  const formData = new FormData();
  formData.append("item_id", taskId);   // ✅ API usually expects task id
  formData.append("user_id", user.id);  // ✅ keep user id for validation

  const response = await fetch(`${API}/deleteItem_action.php`, {
    method: "POST",
    body: formData
  });

  const text = await response.text();
  const jsonMatch = text.match(/\{.*\}$/s);
  const data = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return data;
}
