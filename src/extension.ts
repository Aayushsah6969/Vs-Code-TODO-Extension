import * as vscode from 'vscode';

interface TodoItem {
	id: string;
	title: string;
	completed: boolean;
}

export function activate(context: vscode.ExtensionContext) {

	vscode.window.showInformationMessage('TODO extension activated');

	const provider = new TodoViewProvider(context);


	context.subscriptions.push(
		vscode.window.registerTreeDataProvider(
			'todoView',
			provider
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('todoSidebar.addTodo', async () => {
			const title = await vscode.window.showInputBox({
				placeHolder: 'Enter TODO'
			});
			if (title) {
				provider.addTodo(title);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'todoSidebar.toggleTodo',
			(id: string) => provider.toggleTodo(id)
		)
	);
	context.subscriptions.push(
	vscode.commands.registerCommand(
		'todoSidebar.deleteTodo',
		(item: TodoTreeItem) => {
			if (item?.todo?.id) {
				provider.deleteTodo(item.todo.id);
			}
		}
	)
);


}

class TodoViewProvider implements vscode.TreeDataProvider<TodoTreeItem> {

	private _onDidChangeTreeData = new vscode.EventEmitter<void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private todos: TodoItem[] = [];

	getTreeItem(element: TodoTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(): Thenable<TodoTreeItem[]> {
		if (this.todos.length === 0) {
	const item = new vscode.TreeItem(
		'No TODOs yet',
		vscode.TreeItemCollapsibleState.None
	);
	item.iconPath = new vscode.ThemeIcon('info');
	item.contextValue = 'empty';
	return Promise.resolve([item as any]);
}

		return Promise.resolve(
			this.todos.map(todo => new TodoTreeItem(todo))
		);
	}

	addTodo(title: string) {
	this.todos.push({
		id: Date.now().toString(),
		title,
		completed: false
	});
	this.save();
	this._onDidChangeTreeData.fire();
}

toggleTodo(id: string) {
	const todo = this.todos.find(t => t.id === id);
	if (todo) {
		todo.completed = !todo.completed;
		this.save();
		this._onDidChangeTreeData.fire();
	}
}

	constructor(private context: vscode.ExtensionContext) {
	this.todos = context.globalState.get<TodoItem[]>('todos', []);
}

private save() {
	this.context.globalState.update('todos', this.todos);
}
deleteTodo(id: string) {
	this.todos = this.todos.filter(t => t.id !== id);
	this.save();
	this._onDidChangeTreeData.fire();
}

}

class TodoTreeItem extends vscode.TreeItem {
	constructor(public readonly todo: TodoItem) {
		super(todo.title, vscode.TreeItemCollapsibleState.None);

		this.command = {
			command: 'todoSidebar.toggleTodo',
			title: 'Toggle TODO',
			arguments: [todo.id]
		};

		this.iconPath = new vscode.ThemeIcon(
			todo.completed ? 'check' : 'circle-large-outline'
		);

		// REQUIRED for context menu
		this.contextValue = 'todoItem';

		// REQUIRED so menu commands get the item
		this.id = todo.id;
	}
}



export function deactivate() {}
