import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './components/Sidebar';
import DiagramCanvas from './components/DiagramCanvas';
import ChatPanel from './components/ChatPanel';
import Toolbar from './components/Toolbar';
import { useDiagramHistory } from './hooks/useDiagramHistory';

const App = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(state => state.diagram.nodes);
  const edges = useSelector(state => state.diagram.edges);
  const { handleUndo, handleRedo, canUndo, canRedo } = useDiagramHistory();
  
  // State for sidebar collapse
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  
  // Save diagram state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('diagram-nodes', JSON.stringify(nodes));
    localStorage.setItem('diagram-edges', JSON.stringify(edges));
  }, [nodes, edges]);
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && canRedo) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo, canUndo, canRedo]);
  
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isCollapsed={leftSidebarCollapsed} 
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)} 
        />
        <ReactFlowProvider>
          <div className="flex-1 h-full">
            <DiagramCanvas />
          </div>
        </ReactFlowProvider>
        <ChatPanel 
          isCollapsed={rightSidebarCollapsed} 
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)} 
        />
      </div>
    </div>
  );
};

export default App;
