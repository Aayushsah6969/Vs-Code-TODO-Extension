import * as vscode from 'vscode';
import * as path from 'path';

// Interface for TODO item structure
interface TodoItem {
	id: string;
	title: string;
	completed: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('TODO extension activated');

	// Create and register the webview view provider
	const provider = new TodoWebviewViewProvider(context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'todoView',
			provider
		)
	);

	// Initialize the badge with the current todo count
	provider.updateBadge();
}

/**
 * WebviewViewProvider for the TODO sidebar
 * Manages the webview UI and handles communication with the extension
 */
class TodoWebviewViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private todos: TodoItem[] = [];

	constructor(private context: vscode.ExtensionContext) {
		// Load existing TODOs from globalState on initialization
		this.todos = context.globalState.get<TodoItem[]>('todos', []);
	}

	/**
	 * Called when the webview view is first resolved
	 * Sets up the webview content and message handlers
	 */
	resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	): void {
		this._view = webviewView;

		// Enable scripts in the webview
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this.context.extensionUri]
		};

		// Set the HTML content for the webview
		webviewView.webview.html = this.getHtmlContent(webviewView.webview);

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'addTodo':
						this.addTodo(message.title);
						break;
					case 'toggleTodo':
						this.toggleTodo(message.id);
						break;
					case 'deleteTodo':
						this.deleteTodo(message.id);
						break;
					case 'getTodos':
						// Send current TODOs to the webview when requested
						this.sendTodosToWebview();
						break;
				}
			},
			undefined,
			this.context.subscriptions
		);

		// Send initial TODOs to the webview
		this.sendTodosToWebview();
	}

	/**
	 * Add a new TODO item
	 */
	private addTodo(title: string): void {
		if (!title || title.trim() === '') {
			return;
		}

		const newTodo: TodoItem = {
			id: Date.now().toString(),
			title: title.trim(),
			completed: false
		};

		this.todos.push(newTodo);
		this.save();
		this.sendTodosToWebview();
		this.updateBadge();
	}

	/**
	 * Toggle the completed state of a TODO
	 */
	private toggleTodo(id: string): void {
		const todo = this.todos.find(t => t.id === id);
		if (todo) {
			todo.completed = !todo.completed;
			this.save();
			this.updateBadge();
			this.sendTodosToWebview();
		}
	}

	/**
	 * Delete a TODO item
	 */
	private deleteTodo(id: string): void {
		this.todos = this.todos.filter(t => t.id !== id);
		this.updateBadge();
		this.save();
		this.sendTodosToWebview();
	}

	/**
	 * Save TODOs to globalState
	 */
	private save(): void {
		this.context.globalState.update('todos', this.todos);
	}

	/**
	 * Send the current list of TODOs to the webview
	 */
	private sendTodosToWebview(): void {
		if (this._view) {
			this._view.webview.postMessage({
				command: 'updateTodos',
				todos: this.todos
			});
		}
	}

	/**
	 * Update the Activity Bar badge with the count of incomplete TODOs
	 * Badge displays number of incomplete todos with an orange background
	 * Clears badge when count is 0
	 */
	public updateBadge(): void {
		if (this._view) {
			// Calculate the number of incomplete todos
			const incompleteTodos = this.todos.filter(todo => !todo.completed).length;

			if (incompleteTodos > 0) {
				// Set badge with count and orange background
				this._view.badge = {
					value: incompleteTodos,
					tooltip: `${incompleteTodos} incomplete TODO${incompleteTodos === 1 ? '' : 's'}`
				};
			} else {
				// Clear the badge when no incomplete todos
				this._view.badge = undefined;
			}
		}
	}

	/**
	 * Generate the HTML content for the webview
	 */
	private getHtmlContent(webview: vscode.Webview): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<title>TODO Sidebar</title>
	<style>
		body {
			padding: 10px;
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background-color: var(--vscode-sideBar-background);
			margin: 0;
		}

		.input-container {
			display: flex;
			gap: 8px;
			margin-bottom: 16px;
		}

		#todoInput {
			flex: 1;
			padding: 6px 8px;
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border: 1px solid var(--vscode-input-border);
			border-radius: 2px;
			font-size: 13px;
			outline: none;
		}

		#todoInput:focus {
			border-color: var(--vscode-focusBorder);
		}

		#addButton {
			padding: 6px 14px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: none;
			border-radius: 2px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
		}

		#addButton:hover {
			background-color: var(--vscode-button-hoverBackground);
		}

		#addButton:active {
			opacity: 0.9;
		}

		#todoList {
			list-style: none;
			padding: 0;
			margin: 0;
		}

		.todo-item {
			display: flex;
			align-items: center;
			padding: 8px;
			margin-bottom: 4px;
			background-color: var(--vscode-list-inactiveSelectionBackground);
			border-radius: 3px;
			cursor: pointer;
			transition: background-color 0.1s;
			position: relative;
		}

		.todo-item:hover {
			background-color: var(--vscode-list-hoverBackground);
		}

		.todo-item.completed .todo-title {
			text-decoration: line-through;
			opacity: 0.6;
		}

		.todo-icon {
			margin-right: 8px;
			font-size: 16px;
			flex-shrink: 0;
		}

		.todo-title {
			flex: 1;
			word-break: break-word;
		}

		.delete-btn {
			opacity: 0;
			background: none;
			border: none;
			color: var(--vscode-foreground);
			cursor: pointer;
			padding: 4px 6px;
			border-radius: 2px;
			font-size: 16px;
			margin-left: 8px;
			transition: opacity 0.2s;
		}

		.todo-item:hover .delete-btn {
			opacity: 1;
		}

		.delete-btn:hover {
			background-color: var(--vscode-toolbar-hoverBackground);
			color: var(--vscode-errorForeground);
		}

		.empty-state {
			text-align: center;
			padding: 32px 16px;
			color: var(--vscode-descriptionForeground);
			font-size: 13px;
		}
	</style>
</head>
<body>
	<div class="input-container">
		<input type="text" id="todoInput" placeholder="Enter a TODO..." />
		<button id="addButton">Add</button>
	</div>

	<ul id="todoList"></ul>

	<script>
		(function() {
			// Get VS Code API
			const vscode = acquireVsCodeApi();

			const todoInput = document.getElementById('todoInput');
			const addButton = document.getElementById('addButton');
			const todoList = document.getElementById('todoList');

			// Request initial TODOs when webview loads
			vscode.postMessage({ command: 'getTodos' });

			// Add TODO on button click
			addButton.addEventListener('click', () => {
				const title = todoInput.value.trim();
				if (title) {
					vscode.postMessage({
						command: 'addTodo',
						title: title
					});
					todoInput.value = '';
				}
			});

			// Add TODO on Enter key
			todoInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					addButton.click();
				}
			});

			// Handle messages from the extension
			window.addEventListener('message', (event) => {
				const message = event.data;
				if (message.command === 'updateTodos') {
					renderTodos(message.todos);
				}
			});

			// Render the TODO list
			function renderTodos(todos) {
				todoList.innerHTML = '';

				if (todos.length === 0) {
					todoList.innerHTML = '<div class="empty-state">No TODOs yet. Add one above!</div>';
					return;
				}

				todos.forEach(todo => {
					const li = document.createElement('li');
					li.className = 'todo-item' + (todo.completed ? ' completed' : '');
					li.dataset.id = todo.id;

					// Icon
					const icon = document.createElement('span');
					icon.className = 'todo-icon';
					icon.textContent = todo.completed ? '✓' : '○';

					// Title
					const title = document.createElement('span');
					title.className = 'todo-title';
					title.textContent = todo.title;

					// Delete button
					const deleteBtn = document.createElement('button');
					deleteBtn.className = 'delete-btn';
					deleteBtn.textContent = '✕';
					deleteBtn.title = 'Delete';
					deleteBtn.addEventListener('click', (e) => {
						e.stopPropagation();
						vscode.postMessage({
							command: 'deleteTodo',
							id: todo.id
						});
					});

					// Toggle on click
					li.addEventListener('click', (e) => {
						if (e.target !== deleteBtn) {
							vscode.postMessage({
								command: 'toggleTodo',
								id: todo.id
							});
						}
					});

					li.appendChild(icon);
					li.appendChild(title);
					li.appendChild(deleteBtn);
					todoList.appendChild(li);
				});
			}
		})();
	</script>
</body>
</html>`;
	}
}

export function deactivate() {}
