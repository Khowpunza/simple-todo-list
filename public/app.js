// API endpoints
const API_BASE = '/api/todos';

// DOM elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// State
let todos = [];

// Fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch(API_BASE);
        todos = await response.json();
        renderTodos();
    } catch (error) {
        console.error('Error fetching todos:', error);
        alert('Failed to load todos');
    }
}

// Add a new todo
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Please enter a todo');
        return;
    }
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        
        if (response.ok) {
            const newTodo = await response.json();
            todos.push(newTodo);
            todoInput.value = '';
            renderTodos();
        } else {
            alert('Failed to add todo');
        }
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: !todo.completed }),
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        alert('Failed to update todo');
    }
}

// Delete a todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } else {
            alert('Failed to delete todo');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
}

// Start editing a todo
function startEdit(id) {
    document.getElementById(`text-${id}`).style.display = 'none';
    document.getElementById(`edit-${id}`).style.display = 'inline';
    document.getElementById(`edit-btn-${id}`).style.display = 'none';
    document.getElementById(`save-btn-${id}`).style.display = 'inline';
    document.getElementById(`cancel-btn-${id}`).style.display = 'inline';
    document.getElementById(`edit-${id}`).focus();
}

// Save edited todo
async function saveEdit(id) {
    const newText = document.getElementById(`edit-${id}`).value.trim();
    
    if (!newText) {
        alert('Todo text cannot be empty');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: newText }),
        });
        
        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTodos();
            }
        } else {
            alert('Failed to update todo');
        }
    } catch (error) {
        console.error('Error updating todo:', error);
        alert('Failed to update todo');
    }
}

// Cancel editing a todo
function cancelEdit(id) {
    document.getElementById(`edit-${id}`).value = todos.find(t => t.id === id).text;
    document.getElementById(`text-${id}`).style.display = 'inline';
    document.getElementById(`edit-${id}`).style.display = 'none';
    document.getElementById(`edit-btn-${id}`).style.display = 'inline';
    document.getElementById(`save-btn-${id}`).style.display = 'none';
    document.getElementById(`cancel-btn-${id}`).style.display = 'none';
}

// Render todos to the DOM
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">No todos yet. Add one above!</div>';
    } else {
        todoList.innerHTML = todos.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="toggleTodo(${todo.id})"
                />
                <span class="todo-text" id="text-${todo.id}">${escapeHtml(todo.text)}</span>
                <input type="text" class="edit-input" id="edit-${todo.id}" value="${escapeHtml(todo.text)}" style="display: none;" />
                <button class="edit-btn" id="edit-btn-${todo.id}" onclick="startEdit(${todo.id})">Edit</button>
                <button class="save-btn" id="save-btn-${todo.id}" onclick="saveEdit(${todo.id})" style="display: none;">Save</button>
                <button class="cancel-btn" id="cancel-btn-${todo.id}" onclick="cancelEdit(${todo.id})" style="display: none;">Cancel</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `).join('');
    }
    
    updateStats();
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    totalCount.textContent = `Total: ${total}`;
    completedCount.textContent = `Completed: ${completed}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize
fetchTodos();
