import { createSlice } from "@reduxjs/toolkit";

// Initial state with an empty array for teams
const initialState = {
  teams: []
};

// Create slice with reducers for team management
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    // Add a new team
    addTeam: (state, action) => {
      state.teams.push(action.payload);
    },
    // Remove a team by ID
    removeTeam: (state, action) => {
      state.teams = state.teams.filter(team => team._id !== action.payload);
    },
    addProjectToTeam: (state, action) => {
        const { teamId, project } = action.payload;
        const team = state.teams.find(team => team._id === teamId);
        if (team) {
          team.projects.push(project);
        }
      },
      removeProjectFromTeam: (state, action) => {
        const { teamId, projectId } = action.payload;
        const team = state.teams.find(team => team._id === teamId);
        if (team) {
          team.projects = team.projects.filter(project => project._id !== projectId);
        }
      },
      addMemberToTeam: (state, action) => {
        const { teamId, member } = action.payload;
        const team = state.teams.find(team => team._id === teamId);
        if (team) {
          team.members.push(member);
        }
      },
      removeMemberFromTeam: (state, action) => {
        const { teamId, memberId } = action.payload;
        const team = state.teams.find(team => team._id === teamId);
        if (team) {
          team.members = team.members.filter(member => member._id !== memberId);
        }
      },
  },
});

// Export actions for use in components
export const { addTeam, removeTeam ,addProjectToTeam,addMemberToTeam,removeProjectFromTeam,removeMemberFromTeam} = teamSlice.actions;

// Export reducer to be used in the store
export default teamSlice.reducer;
