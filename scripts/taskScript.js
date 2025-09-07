import { getTasks, addTask, deleteTask } from "./tasks.js";

document.addEventListener("DOMContentLoaded", async () => {
  async function loadTasks() {
    try {
      const response = await getTasks("active");
      console.log("Raw API Response:", response);

      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";

      if (response.status === 200 && response.data && Object.keys(response.data).length > 0) {
        Object.values(response.data).forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${item.item_name}</strong><br>
            ${item.item_description}<br>
            <button data-id="${item.item_id}" class="deleteBtn">Delete</button>
          `;
          taskList.appendChild(li);
        });

        // attach delete handlers
        document.querySelectorAll(".deleteBtn").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const taskId = e.target.getAttribute("data-id");
            if (confirm("Are you sure you want to delete this task?")) {
              try {
                const res = await deleteTask(taskId);
                console.log("Delete response:", res);
                alert(res.message || "Task deleted!");
                loadTasks(); // refresh list
              } catch (error) {
                console.error("Error deleting task:", error);
              }
            }
          });
        });

      } else {
        taskList.innerHTML = "<li>No tasks found.</li>";
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }

  // Initial load
  loadTasks();

  // Add task form
  const addTaskForm = document.getElementById("addTaskForm");
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("taskName").value;
      const description = document.getElementById("taskDescription").value;

      try {
        const res = await addTask(name, description);
        console.log("Add task response:", res);
        alert(res.message || "Task added!");
        loadTasks(); // refresh after adding
      } catch (error) {
        console.error("Error adding task:", error);
      }
    });
  }
});
