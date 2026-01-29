import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  // Add your state properties here
}

const initialState: ExampleState = {
  // Initialize your state here
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    // Add your reducers here
  },
});

export const { } = exampleSlice.actions;
export default exampleSlice.reducer;
