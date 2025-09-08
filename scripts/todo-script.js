import { getUser, API, logOut, BASE_URL } from "./constants.js";

let currentEditTaskId = null;

document.addEventListener("DOMContentLoaded", () => {
  const addTaskForm = document.getElementById("addTaskForm");
  const taskList = document.getElementById("taskList");
  const editTaskForm = document.getElementById("editTaskForm");
  const signOutBtn = $("#signOut-btn");

  if(!getUser()){
    alert("Please Log In First");
    window.location.href = `${BASE_URL}/index.html`;
  }


  signOutBtn.on('click', ()=>{
      logOut();
      window.location.href = `${BASE_URL}/index.html`;
  });

  // Load tasks from API
  async function loadTasks() {
    try {
      const response = await getTasks();
      taskList.innerHTML = "";
      if (response && response.status === 200 && response.data && Object.keys(response.data).length > 0) {
        Object.values(response.data).forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
              <div class="flex items-center justify-between">
                <div class="inline-flex items-center">
                  <input
                    type="checkbox"
                    class="task-checkbox appearance-none text-asphalt border border-paper form-checkbox  checked:after:content-['×'] checked:after:text-xs checked:after:bg-paper checked:after:flex checked:after:items-center checked:after:justify-center h-4 w-4"
                    data-id="${item.item_id}"
                    ${item.status === 'inactive' ? 'checked' : ''}
                  />
                  <div class="flex flex-col">
                    <label class="task-label text-md ${item.status === 'inactive' ? 'line-through  text-gray-400' : 'text-paper'} ms-3">${item.item_name}</label>
                    <label class="task-desc text-sm text-[#f9f6ef]/70 mt-1 ms-3">${item.item_description}</label>
                  </div>
                </div>
                <div class="text-paper space-x-8">
                  <button class="cursor-pointer edit-btn" data-id="${item.item_id}" data-name="${item.item_name}" data-desc="${item.item_description}">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-pencil-icon lucide-pencil"
                    >
                      <path
                        d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a .5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                      />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                  <button class="cursor-pointer delete-btn" data-id="${item.item_id}">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-trash2-icon lucide-trash-2"
                    >
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
          `;
          taskList.appendChild(li);

          const checkBox = li.querySelector(".task-checkbox");
          const taskLabel = li.querySelector(".task-label");

          checkBox.addEventListener("change", () => {
            const taskId = checkBox.getAttribute("data-id");
            if (checkBox.checked) {
              taskLabel.classList.remove("text-paper");
              taskLabel.classList.add("line-through", "text-gray-400");
              updateTaskStatus(taskId, 'inactive');
            } else {
              taskLabel.classList.add("text-paper");
              taskLabel.classList.remove("line-through", "text-gray-400");
              updateTaskStatus(taskId, 'active');
            }
          });

        });
      } else {
        taskList.innerHTML = `<li class= "text-paper" >No tasks found.</li>`;
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      taskList.innerHTML = "<li class = text-paper>Error loading tasks.</li>";
    }
  }

  async function editTask(taskId, newName, newDesc) {
    const user = getUser();
    if (!user || !user.id) {
      alert("User not logged in.");
      return;
    }
    try {
      const response = await $.ajax({
        url: `${API}/editItem_action.php`,
        method: "POST",
        data: JSON.stringify({
          item_id: taskId,
          item_name: newName,
          item_description: newDesc,
          status: "active"
        }),
        
      });
      console.log("Task ID: ", taskId);
      const data = JSON.parse(response);
      
      if (data.status === 200) {
        loadTasks();
      } else {
        alert(data.message || "Error updating task.");
      }
    } catch (err) {
      console.error("Error editing task:", err);
      alert("Error editing task.");
    }
  }

  // Add task via API
  async function addTask(taskName, taskDesc) {
    const user = getUser();
    if (!user || !user.id) {
      alert("User not logged in.");
      return;
    }
    try {
      const response = await $.ajax({
        url: `${API}/addItem_action.php`,
        method: "POST",
        data: JSON.stringify({
          user_id: user.id,
          item_description: taskDesc,
          item_name: taskName,
        }),
      });
        loadTasks();
        closeModal();
    } catch (err) {
      alert("Error adding task.");
    }
  }


  async function deleteTask(taskId) {
    try {
      const response = await $.ajax({
        url: `${API}/deleteItem_action.php?item_id=${taskId}`,
        method: "POST", //gi block nimong DELETE SIR
      });

      const data = JSON.parse(response);
      if(data.status === 200){
        loadTasks();
      }else{
        alert("Error deleting task.");
      }
    } catch (err) {
      alert("Error deleting task.");
    }
  }
  
// --- NEW FUNCTION: update task status ---

async function updateTaskStatus(taskId, status) {
  const user = getUser();
  if (!user || !user.id) {
    alert("User not logged in.");
    return;
  }
  try {
    const response = await $.ajax({
      url: `${API}/statusItem_action.php`,
      method: "POST",
      data: JSON.stringify({
        user_id: user.id,
        item_id: taskId,
        status: status   // only ever mark inactive
      }),
    });

    const data = typeof response === "string" ? JSON.parse(response) : response;
    if (data.status === 200) {
      console.log(`Task ${taskId} marked inactive`);
       // refresh task list
    } else {
      console.error("Error updating task:", data.message);
    }
  } catch (err) {
    console.error("Error in updateTaskStatus:", err);
  }
}

  // Handle add task form submit
   if (addTaskForm) {
    addTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const taskName = document.getElementById("taskName").value.trim();
      const description = document.getElementById("description").value.trim();
      if (taskName) {
        addTask(taskName, description);
      }
    });
  }

  if (editTaskForm) {
    editTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const taskName = document.getElementById("editTaskName").value.trim();
      const description = document
        .getElementById("editDescription")
        .value.trim();
      if (taskName && currentEditTaskId) {
        editTask(currentEditTaskId, taskName, description);
      }
    });
  }

if (taskList) {
    taskList.addEventListener("click", function (e) {
      const deleteBtn = e.target.closest(".delete-btn");
      const editBtn = e.target.closest(".edit-btn");

      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this task?")) {
          deleteTask(taskId);
        }
      }

      if (editBtn) {
        const taskId = editBtn.getAttribute("data-id");
        const taskName = editBtn.getAttribute("data-name");
        const taskDesc = editBtn.getAttribute("data-desc");

        openEditModal(taskId, taskName, taskDesc);
      }
    });
  }

  // Modal functions
    window.openModal = function () {
    document.getElementById("modalOverlay").classList.remove("hidden");
    document.getElementById("taskModal").classList.remove("hidden");
    document.getElementById("taskName").focus();
  };

  window.closeModal = function () {
    document.getElementById("modalOverlay").classList.add("hidden");
    document.getElementById("taskModal").classList.add("hidden");
    if (addTaskForm) addTaskForm.reset();
  };

  window.openEditModal = function (taskId, taskName, taskDescription) {
    currentEditTaskId = taskId;
    document.getElementById("editModalOverlay").classList.remove("hidden");
    document.getElementById("editTaskModal").classList.remove("hidden");

    document.getElementById("editTaskId").value = taskId;
    document.getElementById("editTaskName").value = taskName;
    document.getElementById("editDescription").value = taskDescription;

    document.getElementById("editTaskName").focus();
  };

  window.closeEditModal = function () {
    document.getElementById("editModalOverlay").classList.add("hidden");
    document.getElementById("editTaskModal").classList.add("hidden");
    if (editTaskForm) editTaskForm.reset();
    currentEditTaskId = null;
  };

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeModal();
      window.closeEditModal();
    }
  });

  // Initial load
  loadTasks();
});

// Helper: get tasks from API

async function getTasks() {
  const user = getUser();
  if (!user || !user.id) {
    return Promise.reject("No user logged in.");
  }

  try {
    // Make both requests in parallel
    const [activeResponse, inactiveResponse] = await Promise.all([
      $.ajax({
        url: `${API}/getItems_action.php?user_id=${user.id}&status=active`,
        method: "GET",
        dataType: "json"
      }),
      $.ajax({
        url: `${API}/getItems_action.php?user_id=${user.id}&status=inactive`,
        method: "GET",
        dataType: "json"
      })
    ]);

    // Combine the results
    const combinedData = {
      status: 200,
      data: {
        ...activeResponse.data,
        ...inactiveResponse.data
      }
    };

    return combinedData;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    throw err;
  }
}
