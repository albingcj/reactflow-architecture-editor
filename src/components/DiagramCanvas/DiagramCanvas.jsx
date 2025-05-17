import React, { useCallback, useRef, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
} from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import "reactflow/dist/style.css";
import ServiceNode from "../NodeTypes/ServiceNode";
import {
  setNodes,
  setEdges,
  addEdge as addEdgeAction,
  removeNode,
} from "../../store/diagramSlice";

// Define nodeTypes outside the component to prevent unnecessary re-renders
const nodeTypes = {
  service: ServiceNode,
};

const DiagramCanvas = () => {
  const dispatch = useDispatch();
  const storeNodes = useSelector((state) => state.diagram.nodes);
  const storeEdges = useSelector((state) => state.diagram.edges);
  const historyCurrentStep = useSelector((state) => state.diagram.currentStep);
  const reactFlowWrapper = useRef(null);
  // const [draggedNode, setDraggedNode] = useState(null);
  const [trashVisible, setTrashVisible] = useState(false);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);

  // Add state for MiniMap visibility
  const [minimapVisible, setMinimapVisible] = useState(true);

  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);

  // Existing code for tracking history, etc...
  const lastHistoryStepRef = useRef(historyCurrentStep);

  // Initialize from Redux store
  useEffect(() => {
    setNodesState(storeNodes || []);
    setEdgesState(storeEdges || []);
  }, []);

  // Sync with Redux store when nodes change in local state
  useEffect(() => {
    console.log("Nodes changed in DiagramCanvas:", nodes);
    dispatch(setNodes(nodes));
  }, [nodes, dispatch]);

  // Sync with Redux store when edges change in local state
  useEffect(() => {
    console.log("Edges changed in DiagramCanvas:", edges);
    dispatch(setEdges(edges));
  }, [edges, dispatch]);

  // Critical: Sync from Redux store when undo/redo happens
  useEffect(() => {
    // Check if historyCurrentStep changed, indicating undo/redo
    if (historyCurrentStep !== lastHistoryStepRef.current) {
      console.log(
        "History step changed from",
        lastHistoryStepRef.current,
        "to",
        historyCurrentStep
      );
      console.log("Syncing React Flow state with Redux store after undo/redo");

      // Update React Flow state from Redux store
      setNodesState(storeNodes || []);
      setEdgesState(storeEdges || []);

      // Update ref
      lastHistoryStepRef.current = historyCurrentStep;
    }
  }, [
    historyCurrentStep,
    storeNodes,
    storeEdges,
    setNodesState,
    setEdgesState,
  ]);

  const onConnect = useCallback(
    (params) => {
      console.log("Connection created with params:", params);
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        animated: false,
        type: "smoothstep",
        style: { stroke: "#555", strokeWidth: 2 },
      };

      console.log("Creating new edge:", newEdge);
      setEdgesState((eds) => addEdge(newEdge, eds));
      dispatch(addEdgeAction(newEdge));
    },
    [setEdgesState, dispatch]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      try {
        const serviceData = JSON.parse(
          event.dataTransfer.getData("application/json")
        );

        // Get canvas position where node is dropped
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        const newNode = {
          id: `node-${Date.now()}`,
          type: "service",
          position,
          data: {
            label: serviceData.name,
            icon: serviceData.icon,
          },
        };

        console.log("Adding new node:", newNode);
        setNodesState((nds) => nds.concat(newNode));
        dispatch({ type: "diagram/addNode", payload: newNode });
      } catch (error) {
        console.error("Error adding node:", error);
      }
    },
    [setNodesState, dispatch]
  );

  const onNodeDragStart = useCallback((event, node) => {
    // setDraggedNode(node);
    setTrashVisible(true);
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    // Check if node is being dragged over the trash bin
    const trashElement = document.getElementById("trash-bin");
    if (trashElement) {
      const trashRect = trashElement.getBoundingClientRect();
      const isDraggingOver =
        event.clientX > trashRect.left &&
        event.clientX < trashRect.right &&
        event.clientY > trashRect.top &&
        event.clientY < trashRect.bottom;

      setIsDraggingOverTrash(isDraggingOver);
    }
  }, []);

  const onNodeDragStop = useCallback(
    (event, node) => {
      setTrashVisible(false);
      // setDraggedNode(null);

      // Check if node is dropped on trash bin
      const trashElement = document.getElementById("trash-bin");
      if (trashElement) {
        const trashRect = trashElement.getBoundingClientRect();
        const isDroppedOnTrash =
          event.clientX > trashRect.left &&
          event.clientX < trashRect.right &&
          event.clientY > trashRect.top &&
          event.clientY < trashRect.bottom;

        if (isDroppedOnTrash) {
          console.log("Node dropped on trash, removing:", node.id);
          dispatch(removeNode(node.id));
        }
      }

      setIsDraggingOverTrash(false);
    },
    [dispatch]
  );

  // Simple toggle function for the MiniMap
  const toggleMiniMap = () => {
    setMinimapVisible(!minimapVisible);
  };

  return (
    <div ref={reactFlowWrapper} className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ type: "smoothstep" }}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode="Delete"
      >
        <Background color="#aaa" gap={16} />
        <Controls />

        {/* Toggle button for MiniMap */}
        <Panel
          position="bottom-right"
          className="mr-14 mb-1 rounded"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "-35px",
            zIndex: 10,
            boxShadow: "1px 2px 5px rgba(0, 0, 0, .5)",
          }}
        >
          <button
            onClick={toggleMiniMap}
            className="bg-white p-1 rounded shadow-md hover:bg-gray-100 transition-colors relative z-10"
            title={minimapVisible ? "Hide minimap" : "Show minimap"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  minimapVisible
                    ? "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    : "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"
                }
              />
            </svg>
          </button>
        </Panel>

        {/* Conditionally render MiniMap */}
        {minimapVisible && (
          <MiniMap
            nodeColor={(node) => {
              return "#3182ce";
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white shadow-md rounded"
            style={{ zIndex: 5 }} // Lower z-index value
          />
        )}

        <Panel
          position="top-left"
          className="bg-white p-2 rounded shadow-md m-2 text-xs text-gray-500"
        >
          Drag services from the sidebar onto the canvas
        </Panel>

        {trashVisible && (
          <div
            id="trash-bin"
            className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 p-4 rounded-full ${
              isDraggingOverTrash
                ? "bg-red-500 text-white scale-125"
                : "bg-white text-red-500"
            } shadow-lg transition-all duration-200 flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas;
