import { configureStore } from '@reduxjs/toolkit';
import diagramReducer from './diagramSlice';

export const store = configureStore({
  reducer: {
    diagram: diagramReducer,
  },
});
