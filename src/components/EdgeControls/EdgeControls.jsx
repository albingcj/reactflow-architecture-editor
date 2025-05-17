// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setEdges } from '../../store/diagramSlice';

// const EdgeControls = () => {
//   const dispatch = useDispatch();
//   const edges = useSelector(state => state.diagram.edges);
//   const [edgeType, setEdgeType] = React.useState('smoothstep');
//   const [edgeColor, setEdgeColor] = React.useState('#555555');
  
//   const handleEdgeTypeChange = (type) => {
//     setEdgeType(type);
    
//     // Update all edges with the new type
//     const updatedEdges = edges.map(edge => ({
//       ...edge,
//       type
//     }));
    
//     dispatch(setEdges(updatedEdges));
//   };
  
//   const handleEdgeColorChange = (event) => {
//     const color = event.target.value;
//     setEdgeColor(color);
    
//     // Update all edges with the new color
//     const updatedEdges = edges.map(edge => ({
//       ...edge,
//       style: { ...edge.style, stroke: color }
//     }));
    
//     dispatch(setEdges(updatedEdges));
//   };
  
//   if (edges.length === 0) return null;
  
//   return (
//     <div className="absolute top-20 right-5 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-10">
//       <h3 className="text-sm font-medium mb-2 text-gray-700">Edge Style</h3>
      
//       <div className="flex flex-col gap-2">
//         <div className="flex gap-2">
//           <button 
//             className={`px-2 py-1 text-xs rounded ${edgeType === 'straight' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//             onClick={() => handleEdgeTypeChange('straight')}
//           >
//             Straight
//           </button>
//           <button 
//             className={`px-2 py-1 text-xs rounded ${edgeType === 'step' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//             onClick={() => handleEdgeTypeChange('step')}
//           >
//             Step
//           </button>
//           <button 
//             className={`px-2 py-1 text-xs rounded ${edgeType === 'smoothstep' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
//             onClick={() => handleEdgeTypeChange('smoothstep')}
//           >
//             Smooth
//           </button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <label className="text-xs text-gray-600">Color:</label>
//           <input 
//             type="color" 
//             value={edgeColor} 
//             onChange={handleEdgeColorChange}
//             className="w-6 h-6 p-0 border-0"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EdgeControls;
