import { getUser, API } from "./constants.js";
document.addEventListener("DOMContentLoaded", () => {
  const addTaskForm = document.getElementById("addTaskForm");
  const taskList = document.getElementById("taskList");

  // Load tasks from API
  async function loadTasks() {
    try {
      const response = await getTasks("active");
      console.log(response);
      taskList.innerHTML = "";
      if (response && response.status === 200 && response.data && Object.keys(response.data).length > 0) {
        Object.values(response.data).forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
              <div class="flex items-center justify-between">
                <div class="inline-flex items-center">
                  <input
                    type="checkbox"
                    class="appearance-none text-asphalt border border-paper form-checkbox checked:after:content-['×'] checked:after:text-xs checked:after:bg-paper checked:after:flex checked:after:items-center checked:after:justify-center h-4 w-4"
                  />
                  <label class="text-md text-paper ms-3">${item.item_name}</label>
                </div>
                <div class="text-paper space-x-8">
                  <button class="cursor-pointer edit-btn">
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
                        d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
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
        });
      } else {
        taskList.innerHTML = `<li class= "text-paper" >No tasks found.</li>`;
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      taskList.innerHTML = "<li>Error loading tasks.</li>";
    }
  }

  // Add task via API
  async function addTask(taskName) {
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
          item_description: "charles butngi ni please",
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

  // Handle add task form submit
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const taskName = document.getElementById("taskName").value.trim();
      if (taskName) {
        addTask(taskName);
      }
    });
  }

  if (taskList) {
    taskList.addEventListener("click", function (e) {
    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      const taskId = deleteBtn.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this task?")) {
        deleteTask(taskId);
      }
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

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      window.closeModal();
    }
  });

  // Initial load
  loadTasks();
});

// Helper: get tasks from API
function getTasks(status = "active") {
  const user = getUser();
  if (!user || !user.id) {
    return Promise.reject("No user logged in.");
  }
  return $.ajax({
    url: `${API}/getItems_action.php?status=${status}&user_id=${user.id}`,
    method: "GET",
    dataType: "json"
  });
}