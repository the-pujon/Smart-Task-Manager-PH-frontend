import { configureStore } from '@reduxjs/toolkit'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface TeamMember {
  id: string
  name: string
  role: string
  capacity: number
}

export interface Project {
  id: string
  name: string
  teamId: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  assignedMemberId: string | null
  priority: 'Low' | 'Medium' | 'High'
  status: 'Pending' | 'In Progress' | 'Done'
  createdAt: string
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
}

export interface User {
  id: string
  email: string
  password: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  taskName: string
  oldAssignee: string | null
  newAssignee: string | null
  userId: string
}

// Slices
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUserId: null as string | null,
    users: [] as User[],
  },
  reducers: {
    registerUser: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const newUser: User = {
        id: Date.now().toString(),
        email: action.payload.email,
        password: action.payload.password,
      }
      state.users.push(newUser)
      localStorage.setItem('users', JSON.stringify(state.users))
    },
    loginUser: (state, action: PayloadAction<string>) => {
      state.currentUserId = action.payload
      localStorage.setItem('currentUserId', action.payload)
    },
    logoutUser: (state) => {
      state.currentUserId = null
      localStorage.removeItem('currentUserId')
    },
    initializeAuth: (state) => {
      const users = localStorage.getItem('users')
      if (users) state.users = JSON.parse(users)
      const currentUserId = localStorage.getItem('currentUserId')
      if (currentUserId) state.currentUserId = currentUserId
    },
  },
})

const teamsSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [] as Team[],
  },
  reducers: {
    createTeam: (state, action: PayloadAction<{ name: string; userId: string }>) => {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: action.payload.name,
        members: [],
      }
      state.teams.push(newTeam)
      localStorage.setItem('teams', JSON.stringify(state.teams))
    },
    addTeamMember: (state, action: PayloadAction<{ teamId: string; member: TeamMember }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId)
      if (team) {
        team.members.push(action.payload.member)
        localStorage.setItem('teams', JSON.stringify(state.teams))
      }
    },
    editTeamMember: (state, action: PayloadAction<{ teamId: string; memberId: string; updates: Partial<TeamMember> }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId)
      if (team) {
        const member = team.members.find(m => m.id === action.payload.memberId)
        if (member) {
          Object.assign(member, action.payload.updates)
          localStorage.setItem('teams', JSON.stringify(state.teams))
        }
      }
    },
    deleteTeamMember: (state, action: PayloadAction<{ teamId: string; memberId: string }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId)
      if (team) {
        team.members = team.members.filter(m => m.id !== action.payload.memberId)
        localStorage.setItem('teams', JSON.stringify(state.teams))
      }
    },
    initializeTeams: (state) => {
      const teams = localStorage.getItem('teams')
      if (teams) state.teams = JSON.parse(teams)
    },
  },
})

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [] as Project[],
  },
  reducers: {
    createProject: (state, action: PayloadAction<{ name: string; teamId: string }>) => {
      const newProject: Project = {
        id: Date.now().toString(),
        name: action.payload.name,
        teamId: action.payload.teamId,
        createdAt: new Date().toISOString(),
      }
      state.projects.push(newProject)
      localStorage.setItem('projects', JSON.stringify(state.projects))
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      localStorage.setItem('projects', JSON.stringify(state.projects))
    },
    initializeProjects: (state) => {
      const projects = localStorage.getItem('projects')
      if (projects) state.projects = JSON.parse(projects)
    },
  },
})

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [] as Task[],
  },
  reducers: {
    createTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      state.tasks.push(newTask)
      localStorage.setItem('tasks', JSON.stringify(state.tasks))
    },
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        Object.assign(task, action.payload.updates)
        localStorage.setItem('tasks', JSON.stringify(state.tasks))
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
      localStorage.setItem('tasks', JSON.stringify(state.tasks))
    },
    reassignTask: (state, action: PayloadAction<{ id: string; newAssigneeId: string | null }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.assignedMemberId = action.payload.newAssigneeId
        localStorage.setItem('tasks', JSON.stringify(state.tasks))
      }
    },
    initializeTasks: (state) => {
      const tasks = localStorage.getItem('tasks')
      if (tasks) state.tasks = JSON.parse(tasks)
    },
  },
})

const activitySlice = createSlice({
  name: 'activity',
  initialState: {
    logs: [] as ActivityLog[],
  },
  reducers: {
    addActivityLog: (state, action: PayloadAction<Omit<ActivityLog, 'id'>>) => {
      const newLog: ActivityLog = {
        ...action.payload,
        id: Date.now().toString(),
      }
      state.logs.unshift(newLog)
      if (state.logs.length > 50) {
        state.logs = state.logs.slice(0, 50)
      }
      localStorage.setItem('activityLogs', JSON.stringify(state.logs))
    },
    initializeActivity: (state) => {
      const logs = localStorage.getItem('activityLogs')
      if (logs) state.logs = JSON.parse(logs)
    },
  },
})

export const { registerUser, loginUser, logoutUser, initializeAuth } = authSlice.actions
export const { createTeam, addTeamMember, editTeamMember, deleteTeamMember, initializeTeams } = teamsSlice.actions
export const { createProject, deleteProject, initializeProjects } = projectsSlice.actions
export const { createTask, updateTask, deleteTask, reassignTask, initializeTasks } = tasksSlice.actions
export const { addActivityLog, initializeActivity } = activitySlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    teams: teamsSlice.reducer,
    projects: projectsSlice.reducer,
    tasks: tasksSlice.reducer,
    activity: activitySlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
