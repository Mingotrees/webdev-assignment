function openModal() {
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("taskModal").classList.remove("hidden");
  document.getElementById("taskName").focus();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  document.getElementById("taskModal").classList.add("hidden");
  document.getElementById("addTaskForm").reset();
}

function addTask(taskName) {
  const taskList = document.getElementById("taskList");
  const newTask = document.createElement("li");
  newTask.innerHTML = `
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center">
              <input
                type="checkbox"
                class="appearance-none text-asphalt border border-paper form-checkbox checked:after:content-['×'] checked:after:text-xs checked:after:bg-paper checked:after:flex checked:after:items-center checked:after:justify-center h-4 w-4"
              />
              <label class="text-md text-paper ms-3">${taskName}</label>
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
              <button class="cursor-pointer delete-btn">
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
  taskList.appendChild(newTask);
}

document.getElementById("addTaskForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const taskName = document.getElementById("taskName").value.trim();
  if (taskName) {
    addTask(taskName);
    closeModal();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

function editTask(label) {
  const currentText = label.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className =
    "w-full text-md text-paper px-2 py-1 rounded ms-3 focus:outline-none focus:ring-1 focus:ring-paper";

  label.parentNode.replaceChild(input, label);
  input.focus();
  input.select();

  function saveEdit() {
    const newText = input.value.trim();
    if (newText && newText !== currentText) {
      label.textContent = newText;
    } else {
      label.textContent = currentText;
    }
    input.parentNode.replaceChild(label, input);
  }

  function cancelEdit() {
    label.textContent = currentText;
    input.parentNode.replaceChild(label, input);
  }

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  });
}

document.getElementById("taskList").addEventListener("click", function (e) {
  if (e.target.closest(".edit-btn")) {
    const label = e.target.closest("li").querySelector("label");
    editTask(label);
  } else if (e.target.closest(".delete-btn")) {
    e.target.closest("li").remove();
  }
});
