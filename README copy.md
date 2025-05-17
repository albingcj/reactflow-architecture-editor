# AWS Architecture Diagram Builder

![GitHub stars](https://img.shields.io/github/stars/albingcj/reactflow-architecture-editor?style=social)
![GitHub forks](https://img.shields.io/github/forks/albingcj/reactflow-architecture-editor?style=social)
![GitHub issues](https://img.shields.io/github/issues/albingcj/reactflow-architecture-editor)

A powerful, interactive tool for creating AWS architecture diagrams with a user-friendly interface, built with React Flow and Redux.

![AWS Architecture Diagram Builder Demo](https://albingcj.com/projects/p2ptchat.png)

## 📋 Features

- [x] Drag-and-drop AWS service icons to create diagrams
- [x] Connect services with smoothly styled edges
- [x] Multi-select and alignment tools for precise layouts
- [x] AI-powered chat assistant for quick service search and actions
- [x] Export diagrams as PNG images
- [x] Import/Export diagram as JSON
- [x] Undo/Redo functionality
- [x] Trash bin for easy node deletion
- [x] Collapsible sidebar panels for maximum workspace
- [x] Service categorization for easy discovery
- [x] Interactive MiniMap with toggle control

## 🔍 Architecture Overview

```mermaid
flowchart TD
    A[User Interface] --> B[React Components]
    B --> C[React Flow]
    B --> D[Redux Store]
    D --> E[Diagram State]
    E --> F[History State]
    B --> G[AWS Services]
    B --> H[Chat Assistant]
    
    subgraph Components
        C --> Canvas[Diagram Canvas]
        C --> Nodes[Service Nodes]
        C --> Edges[Connections]
        G --> Sidebar[Services Sidebar]
        H --> ChatPanel[Chat Panel]
    end
    
    subgraph State Management
        D --> Actions[Redux Actions]
        Actions --> Reducers[Redux Reducers]
        Reducers --> E
    end
```

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/albingcj/reactflow-architecture-editor.git
cd reactflow-architecture-editor

# Install dependencies
npm install

# Start development server
npm start
```

## 📦 Dependencies

```mermaid
graph TD
    A[AWS Architecture Diagram Builder] --> B[React v18.2.0]
    A --> C[React Flow v11.8.3]
    A --> D[Redux Toolkit v1.9.5]
    A --> E[React Redux v8.1.2]
    A --> F[html-to-image v1.11.11]
    A --> G[Tailwind CSS v3.3.3]
    G --> H[PostCSS v8.4.29]
    G --> I[Autoprefixer v10.4.15]
```

## 🛠️ Project Structure

```
reactflow-architecture-editor/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── aws-services.json   # AWS service icons mapping
│   ├── components/
│   │   ├── DiagramCanvas/      # Main diagram area
│   │   ├── NodeTypes/          # Custom node components
│   │   ├── Sidebar/            # AWS services sidebar
│   │   ├── ChatPanel/          # AI assistant panel
│   │   └── Toolbar/            # Action toolbar
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Redux store configuration
│   ├── utils/                  # Helper functions
│   ├── App.jsx                 # Main application component
│   └── index.js                # Application entry point
└── tailwind.config.js          # Tailwind CSS configuration
```

## 🖱️ Usage Guide

### Creating a Diagram

1. Browse AWS services in the left sidebar
2. Drag services onto the canvas
3. Connect services by dragging from one connection point to another
4. Use the alignment tools when multiple nodes are selected

### Using the Chat Assistant

The chat assistant supports commands like:
- `find database` - Search for database services
- `add EC2` - Add an EC2 instance to the diagram
- `undo` - Undo the last action
- `clear` - Clear the entire diagram


### Keyboard Shortcuts

| Shortcut | Action |
|-------------|---------------------------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Remove selected elements |
| Shift+Click | Select multiple nodes |
| Ctrl+A | Select all nodes |

## 🔄 Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant Store as Redux Store
    participant RF as React Flow

    User->>UI: Drags AWS service
    UI->>Store: dispatch(addNode)
    Store->>RF: Update nodes state
    RF->>UI: Render new node

    User->>UI: Connects services
    UI->>Store: dispatch(addEdge)
    Store->>RF: Update edges state
    RF->>UI: Render new connection

    User->>UI: Clicks Undo
    UI->>Store: dispatch(undo)
    Store->>Store: Restore previous state
    Store->>RF: Update nodes/edges
    RF->>UI: Render previous state

    User->>UI: Exports diagram
    UI->>UI: Generate PNG/JSON
    UI->>User: Download file
```

## 🧩 Component Hierarchy

```mermaid
graph TD
    App --> DiagramCanvas
    App --> Sidebar
    App --> ChatPanel
    App --> Toolbar
    
    DiagramCanvas --> ReactFlow
    ReactFlow --> ServiceNode
    ReactFlow --> Edges
    ReactFlow --> Controls
    ReactFlow --> MiniMap
    
    Sidebar --> ServiceCategories
    Sidebar --> ServiceList
    Sidebar --> SearchBar
    
    ChatPanel --> ChatMessages
    ChatPanel --> ChatInput
    
    Toolbar --> UndoRedo
    Toolbar --> AlignmentTools
    Toolbar --> ExportImport
```

## 🔌 State Management

The application uses Redux for state management with the following main slices:

- **Diagram Slice**: Manages nodes, edges, and diagram history
- **UI Slice**: Manages UI state like sidebar collapse, selected tabs, etc.

## 🛣️ Roadmap

- [ ] Responsive design for mobile and tablet devices
- [ ] Custom themes and diagram styling options
- [ ] AWS cost estimation based on selected services
- [ ] Architecture validation based on AWS best practices
- [ ] Presentation mode for clean diagram viewing
- [ ] Accessibility improvements
- [ ] LLM integration with chat assistant

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/feature_Azure`)
3. Commit your changes
4. Push to the Dev branch
5. Open a Pull Request

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the powerful diagram framework
- [Redux Toolkit](https://redux-toolkit.js.org/) for state management
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

Made with ❤️ by [Albin](https://albingcj.com)
