import { persistStore } from 'redux-persist';
import { baseApi } from './api/baseApi';
import { configureStore } from "@reduxjs/toolkit";
import { persistedReducer } from './rootReducer';
// import { persistedReducer } from './rootReducer';

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({serializableCheck:false}).concat(baseApi.middleware),
});

export const persistor =persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
