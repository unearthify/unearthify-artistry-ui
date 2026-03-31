import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  query: "",
  filteredArtists: [],
  filteredArtForms: [],
  filteredEvents: [],
  isSearching: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload;
      state.isSearching = !!action.payload;
    },

    setSearchResults: (state, action) => {
      const { artists, artForms, events } = action.payload;
      state.filteredArtists = artists;
      state.filteredArtForms = artForms;
      state.filteredEvents = events;
    },

    clearSearch: (state) => {
      state.query = "";
      state.filteredArtists = [];
      state.filteredArtForms = [];
      state.filteredEvents = [];
      state.isSearching = false;
    },
  },
});

export const { setSearchQuery, setSearchResults, clearSearch } =
  searchSlice.actions;

export default searchSlice.reducer;
