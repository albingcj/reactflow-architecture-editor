import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDiagramHistory } from '../../hooks/useDiagramHistory';
import { toPng } from 'html-to-image';
import { importDiagram } from '../../store/diagramSlice';

const Toolbar = () => {
  const dispatch = useDispatch();
  const { canUndo, canRedo, handleUndo, handleRedo } = useDiagramHistory();
  const nodes = useSelector(state => state.diagram.nodes);
  const edges = useSelector(state => state.diagram.edges);
  
  const handleSave = () => {
    const diagramState = {
      nodes: nodes,
      edges: edges
    };
    
    const blob = new Blob([JSON.stringify(diagramState, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `architecture-diagram-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportImage = useCallback(() => {
    const diagramElement = document.querySelector('.react-flow__viewport');
    if (!diagramElement) {
      alert('No diagram to export');
      return;
    }
    
    // Add padding and white background
    const originalTransform = diagramElement.style.transform;
    const originalWidth = diagramElement.style.width;
    const originalHeight = diagramElement.style.height;
    
    // Prepare for screenshot
    diagramElement.style.background = 'white';
    
    toPng(diagramElement, { 
      backgroundColor: '#ffffff',
      width: diagramElement.scrollWidth + 40, 
      height: diagramElement.scrollHeight + 40,
      style: {
        padding: '20px'
      },
      pixelRatio: 2
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `architecture-diagram-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
        
        // Restore original styles
        diagramElement.style.transform = originalTransform;
        diagramElement.style.width = originalWidth;
        diagramElement.style.height = originalHeight;
        diagramElement.style.background = '';
      })
      .catch((error) => {
        console.error('Error exporting image:', error);
        alert('Failed to export image');
      });
  }, []);
  
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (importedData.nodes && importedData.edges) {
          dispatch(importDiagram(importedData));
        }
      } catch (error) {
        console.error('Error importing diagram:', error);
        alert('Invalid diagram file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    e.target.value = null;
  };
  
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault();
        if (canUndo) handleUndo();
      } else if (e.key === 'y') {
        e.preventDefault();
        if (canRedo) handleRedo();
      }
    }
  }, [canUndo, canRedo, handleUndo, handleRedo]);
  
  // Add keyboard shortcuts
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  return (
    <div className="flex justify-between items-center px-5 py-2 bg-white border-b border-gray-200 h-14 shadow-sm">
      <div className="flex gap-2">
        <button 
          className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${canUndo 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Undo
        </button>
        <button 
          className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${canRedo 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          Redo
        </button>
      </div>
      
      <div className="text-lg font-semibold text-gray-700">Architecture Diagram Builder</div>
      
      <div className="flex gap-2">
        <button 
          className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors ${
            nodes.length === 0 
              ? 'bg-blue-50 text-blue-300 cursor-not-allowed' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
          }`}
          onClick={handleSave}
          title="Save Diagram"
          disabled={nodes.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
        <button 
          className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors ${
            nodes.length === 0 
              ? 'bg-blue-50 text-blue-300 cursor-not-allowed' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
          }`}
          onClick={handleExportImage}
          title="Export as Image"
          disabled={nodes.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Export
        </button>
        <label className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 transition-colors ${
          'bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import
          <input 
            type="file" 
            accept=".json" 
            onChange={handleImport} 
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default Toolbar;
