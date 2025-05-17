import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nodes: [],
  edges: [],
  history: [],
  currentStep: -1,
  chatMessages: []
};

export const diagramSlice = createSlice({
  name: 'diagram',
  initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
      // Add to history
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push({
        type: 'ADD_NODE',
        payload: action.payload,
        snapshot: {
          nodes: [...state.nodes.map(node => ({...node}))],
          edges: [...state.edges.map(edge => ({...edge}))]
        }
      });
      state.currentStep++;
    },
    updateNodePosition: (state, action) => {
      const { id, position } = action.payload;
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        // Store previous position in history before updating
        state.history = state.history.slice(0, state.currentStep + 1);
        state.history.push({
          type: 'UPDATE_NODE_POSITION',
          payload: { id, previousPosition: { ...node.position } },
          snapshot: {
            nodes: [...state.nodes.map(n => ({...n}))],
            edges: [...state.edges.map(edge => ({...edge}))]
          }
        });
        state.currentStep++;
        
        // Update position
        node.position = position;
      }
    },
    addEdge: (state, action) => {
      state.edges.push(action.payload);
      // Add to history
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push({
        type: 'ADD_EDGE',
        payload: action.payload,
        snapshot: {
          nodes: [...state.nodes.map(node => ({...node}))],
          edges: [...state.edges.map(edge => ({...edge}))]
        }
      });
      state.currentStep++;
    },
    removeNode: (state, action) => {
      const nodeId = action.payload;
      
      // Add to history before removing
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push({
        type: 'REMOVE_NODE',
        payload: nodeId,
        snapshot: {
          nodes: [...state.nodes.map(node => ({...node}))],
          edges: [...state.edges.map(edge => ({...edge}))]
        }
      });
      state.currentStep++;
      
      // Update state
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      state.edges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
    },
    removeEdge: (state, action) => {
      const edgeId = action.payload;
      
      // Add to history before removing
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push({
        type: 'REMOVE_EDGE',
        payload: edgeId,
        snapshot: {
          nodes: [...state.nodes.map(node => ({...node}))],
          edges: [...state.edges.map(edge => ({...edge}))]
        }
      });
      state.currentStep++;
      
      // Update state
      state.edges = state.edges.filter(edge => edge.id !== edgeId);
    },
    undo: (state) => {
      if (state.currentStep >= 0) {
        const action = state.history[state.currentStep];
        
        if (action && action.snapshot) {
          // Handle different action types
          switch (action.type) {
            case 'ADD_NODE':
              // Remove the node that was added
              state.nodes = state.nodes.filter(node => node.id !== action.payload.id);
              break;
              
            case 'ADD_EDGE':
              // Remove the edge that was added
              state.edges = state.edges.filter(edge => edge.id !== action.payload.id);
              break;
              
            case 'REMOVE_NODE':
            case 'REMOVE_EDGE':
            case 'UPDATE_NODE_POSITION':
              // For these actions, restore the entire previous state
              state.nodes = action.snapshot.nodes.map(node => ({...node}));
              state.edges = action.snapshot.edges.map(edge => ({...edge}));
              break;
              
            default:
              console.warn('Unknown action type in undo:', action.type);
          }
        }
        
        state.currentStep--;
      }
    },
    redo: (state) => {
      if (state.currentStep < state.history.length - 1) {
        state.currentStep++;
        const action = state.history[state.currentStep];
        
        if (action) {
          switch (action.type) {
            case 'ADD_NODE':
              state.nodes.push({...action.payload});
              break;
              
            case 'ADD_EDGE':
              state.edges.push({...action.payload});
              break;
              
            case 'REMOVE_NODE':
              // Remove the node again
              state.nodes = state.nodes.filter(node => node.id !== action.payload);
              // Also remove connected edges
              state.edges = state.edges.filter(
                edge => edge.source !== action.payload && edge.target !== action.payload
              );
              break;
              
            case 'REMOVE_EDGE':
              // Remove the edge again
              state.edges = state.edges.filter(edge => edge.id !== action.payload);
              break;
              
            case 'UPDATE_NODE_POSITION':
              // Move node to the position it was moved to
              const node = state.nodes.find(n => n.id === action.payload.id);
              if (node && action.payload.position) {
                node.position = {...action.payload.position};
              }
              break;
              
            default:
              console.warn('Unknown action type in redo:', action.type);
          }
        }
      }
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChat: (state) => {
      state.chatMessages = [];
    },
    importDiagram: (state, action) => {
      // Deep copy the imported data to ensure no reference issues
      const nodes = action.payload.nodes.map(node => ({...node}));
      const edges = action.payload.edges.map(edge => ({...edge}));
      
      // Add to history before importing
      state.history = state.history.slice(0, state.currentStep + 1);
      state.history.push({
        type: 'IMPORT_DIAGRAM',
        payload: { nodes: [...state.nodes], edges: [...state.edges] },
        snapshot: {
          nodes: [...state.nodes.map(node => ({...node}))],
          edges: [...state.edges.map(edge => ({...edge}))]
        }
      });
      state.currentStep++;
      
      // Update state
      state.nodes = nodes;
      state.edges = edges;
    }
  },
});

export const { 
  setNodes, 
  setEdges, 
  addNode, 
  updateNodePosition, 
  addEdge, 
  removeNode, 
  removeEdge,
  undo,
  redo,
  addChatMessage,
  clearChat,
  importDiagram
} = diagramSlice.actions;

export default diagramSlice.reducer;
