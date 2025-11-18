import { createSlice } from "@reduxjs/toolkit";

export interface IUser{
    email:string;
    password:string;
    name:string;
}


type TAuthState = {
  currentUser: null | IUser;
  accessToken: null | string;
  refreshToken?: null | string;
};

const initialState: TAuthState = {
  currentUser: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
    name:"users",
    initialState,
    reducers:{
        signInSuccess:(state,action)=>{
            state.currentUser=action.payload.currentUser
            state.accessToken=action.payload.accessToken
            state.refreshToken=action.payload.refreshToken
        },
        signInFailure:(state)=>{
            state.currentUser=null
            state.accessToken=null
            state.refreshToken=null
            
        },
        signOut_user:(state)=>{
            state.currentUser=null
            state.accessToken=null
            state.refreshToken=null
            localStorage.removeItem("persist:users")
            
        }
    }
})

export const {signInSuccess,signInFailure,signOut_user}=authSlice.actions;
export default authSlice.reducer
