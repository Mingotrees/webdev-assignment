import { getUser, API, logOut, BASE_URL } from "./constants.js";

let currentEditTaskId = null;
const $addTaskForm = $("#addTaskForm");
const $taskList = $("#taskList");
const $editTaskForm = $("#editTaskForm");
const $signOutBtn = $("#signOut-btn");

/**
 * DELETE FUNCTION
 * @param {} taskId 
 */
async function deleteTask(taskId) {
    const response = await $.ajax({
      url: `${API}/deleteItem_action.php?item_id=${taskId}`,
      method: "POST", //gi block nimong DELETE SIR
    });

    const data = JSON.parse(response);
    if(data.status === 200){
      await loadTasks();
    }else{
      alert("Error deleting task.");
    }
}


/**
 * GET TASKS
 * @returns 
 */
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
      }).then(response => {
        if (response && response.status === 200) {
          return response;
        }
        return { status: 200, data: {} };
      }),
      $.ajax({
        url: `${API}/getItems_action.php?user_id=${user.id}&status=inactive`,
        method: "GET",
        dataType: "json"
      }).then(response => {
        if (response && response.status === 200) {
          return response;
        }
        return { status: 200, data: {} };
      })
    ]);

    // Check if at least one request was successful
    if (activeResponse.status === 200 || inactiveResponse.status === 200) {
      // Combine the results using actual item_id as keys
      const combinedData = {
        status: 200,
        data: {}
      };

      // Add active tasks using item_id as key
      if (activeResponse.data && Object.keys(activeResponse.data).length > 0) {
        Object.values(activeResponse.data).forEach(task => {
          combinedData.data[task.item_id] = task;
        });
      }

      // Add inactive tasks using item_id as key
      if (inactiveResponse.data && Object.keys(inactiveResponse.data).length > 0) {
        Object.values(inactiveResponse.data).forEach(task => {
          combinedData.data[task.item_id] = task;
        });
      }

      return combinedData;
    } else {
      throw new Error('Failed to fetch tasks');
    }
  } catch (err) {
     console.error("Error fetching tasks:", err);
    throw err;
  }
}



/**
 * EDIT FUNCTION
 * @param {*} taskId 
 * @param {*} newName 
 * @param {*} newDesc 
 * @returns 
 */

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
      await loadTasks();
      closeEditModal();
    } else {
      alert(data.message || "Error updating task.");
    }
  } catch (err) {
    console.error("Error editing task:", err);
    alert("Error editing task.");
  }
}


/**
 * ADD TASK FUNCTION
 * @param {*} taskName 
 * @param {*} taskDesc 
 * @returns 
 */

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
      await loadTasks();
      closeModal();
  } catch (err) {
    alert("Error adding task.");
  }
}

/**
 * UPDATES TASKS
 * @param {*} taskId 
 * @param {*} status 
 * @returns 
 */

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
    } else {
      console.error("Error updating task:", data.message);
    }
  } catch (err) {
    console.error("Error in updateTaskStatus:", err);
  }
}


/**
 * LOADS TASKS
 */

async function loadTasks() {
    try {
      const response = await getTasks();
      $taskList.empty();
      
      if (response && response.status === 200 && response.data && Object.keys(response.data).length > 0) {
        // Convert to array and sort: active tasks first, then inactive tasks
        const sortedTasks = Object.values(response.data).sort((a, b) => {
          if (a.status === 'active' && b.status === 'inactive') return -1;
          if (a.status === 'inactive' && b.status === 'active') return 1;
          return 0;
        });

        sortedTasks.forEach(item => {
          const $li = $('<li>').html(`
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
          `);
          $taskList.append($li);
        
          $li.find('.task-checkbox').on('change', async function() {
            const taskId = $(this).data('id');
            const $taskLabel = $(this).closest('div').find('.task-label');
            
            if (this.checked) {
              $taskLabel.removeClass('text-paper').addClass('line-through text-gray-400');
              await updateTaskStatus(taskId, 'inactive');
            } else {
              $taskLabel.addClass('text-paper').removeClass('line-through text-gray-400');
              await updateTaskStatus(taskId, 'active');
            }
          });

        });
      } else {
        $taskList.html(`<li class= "text-paper" >No tasks found.</li>`);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      $taskList.html('<li class = text-paper>Error loading tasks.</li>');
    }
}

window.openModal = function() {
  $('#modalOverlay, #taskModal').removeClass('hidden');
  $('#taskName').focus();
};

window.closeModal = function() {
  $('#modalOverlay, #taskModal').addClass('hidden');
  $addTaskForm[0].reset();
};

window.openEditModal = function(taskId, taskName, taskDescription) {
  currentEditTaskId = taskId;
  $('#editModalOverlay, #editTaskModal').removeClass('hidden');
  $('#editTaskId').val(taskId);
  $('#editTaskName').val(taskName);
  $('#editDescription').val(taskDescription);
  $('#editTaskName').focus();
};

window.closeEditModal = function() {
  $('#editModalOverlay, #editTaskModal').addClass('hidden');
  $editTaskForm[0].reset();
  currentEditTaskId = null;
};

// Set up event handlers outside DOMContentLoaded
$signOutBtn.on('click', () => {
  logOut();
  window.location.href = `${BASE_URL}/index.html`;
});

if ($addTaskForm) {
  $addTaskForm.on("submit", function (e) {
    e.preventDefault();
    const taskName = $("#taskName").val().trim();
    const description = $("#description").val().trim();
    if (taskName) {
      addTask(taskName, description);
    }
  });
}

if ($editTaskForm) {
  $editTaskForm.on("submit", function (e) {
    e.preventDefault();
    const taskName = $("#editTaskName").val().trim();
    const description = $("#editDescription").val().trim();
    if (taskName && currentEditTaskId) {
      editTask(currentEditTaskId, taskName, description);
    }
  });
}

if ($taskList) {
  $taskList.on('click', '.delete-btn', function(e) {
    e.preventDefault(); 
    e.stopPropagation();
    const taskId = $(this).data('id');
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
    }
  });

  $taskList.on('click', '.edit-btn', function() {
    const taskId = $(this).data('id');
    const taskName = $(this).data('name');
    const taskDesc = $(this).data('desc');
    openEditModal(taskId, taskName, taskDesc);
  });
}

$(document).on('keydown', function(e) {
  if (e.key === 'Escape') {
    window.closeModal();
    window.closeEditModal();
  }
});

// Keep only essential initialization in DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  if(!getUser()){
    alert("Please Log In First");
    window.location.href = `${BASE_URL}/index.html`;
  }
  
  // Initial load
  loadTasks();
});