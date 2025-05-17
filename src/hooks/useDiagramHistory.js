import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { undo, redo } from '../store/diagramSlice';

export const useDiagramHistory = () => {
  const dispatch = useDispatch();
  const currentStep = useSelector((state) => state.diagram.currentStep);
  const historyLength = useSelector((state) => state.diagram.history.length);
  
  const canUndo = currentStep >= 0;
  const canRedo = currentStep < historyLength - 1;
  
  const handleUndo = useCallback(() => {
    if (canUndo) {
      dispatch(undo());
    }
  }, [canUndo, dispatch]);
  
  const handleRedo = useCallback(() => {
    if (canRedo) {
      dispatch(redo());
    }
  }, [canRedo, dispatch]);
  
  return { canUndo, canRedo, handleUndo, handleRedo };
};
