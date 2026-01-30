import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
}

const initialState: ExampleState = {
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
  },
});

export const { } = exampleSlice.actions;
export default exampleSlice.reducer;
