# 📝 TODO Sidebar – VS Code Extension

A modern and lightweight **VS Code sidebar TODO manager** built with **TypeScript** and **Webview API**, designed to provide a clean, interactive, and persistent TODO experience directly inside the editor.

This extension avoids Command Palette dependency and offers a smooth UI for managing tasks efficiently.

---

## ✨ Features

- 📌 Interactive sidebar UI (Webview-based)
- ➕ Add TODOs using an input field
- ✔ Toggle TODO completion with a single click
- 🗑 Delete TODOs using hover actions
- 💾 Persistent storage (TODOs survive reloads & restarts)
- 🎨 Clean, VS Code theme–friendly design
- ⚡ Fast and lightweight
- 🧩 Built with TypeScript

---

## 🖥️ Preview

The extension provides a sidebar UI with:
- Input box at the top
- Add button
- List of TODO items
- Hover-based delete buttons
- Visual distinction between completed and pending tasks

---

## 🚀 Usage

1. Install the extension
2. Open VS Code
3. Click the **TODOs** icon in the Activity Bar
4. Start adding and managing your TODOs directly from the sidebar

No Command Palette required.

---

## 🛠️ Tech Stack

- **TypeScript**
- **VS Code Extension API**
- **Webview View**
- **HTML / CSS / Vanilla JavaScript**
- **VS Code globalState for persistence**

---

## 🧠 Architecture Overview

- Uses a **Webview View** instead of TreeView for richer UI
- Communication between UI and extension via `postMessage`
- Centralized state management using `context.globalState`
- Clean separation of extension logic and UI logic

---

## 🧪 Development Setup

```bash
git clone https://github.com/<your-username>/todo-sidebar.git
cd todo-sidebar
npm install


Run the extension:

1. Open the project in VS Code
2. Press `F5`
3. A new Extension Development Host window will open

---

## 🤝 Open Source & Contributions

This project is open to open-source contributions.

Contributions are welcome in the form of:

- 🐛 Bug fixes
- ✨ New features
- 🎨 UI/UX improvements
- 📚 Documentation improvements

### How to contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

Feel free to open issues for suggestions or bugs.

---

## 📌 Roadmap (Planned Enhancements)

- Task grouping / categories
- Drag-and-drop reordering
- Workspace-specific TODOs
- Export / import TODOs
- Keyboard shortcuts
- Optional cloud sync

---

## 📄 License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute it.

---

## 🙌 Author

Built with ❤️ by **Aayush Kumar Sah**

If you find this useful, consider giving it a ⭐ on GitHub.