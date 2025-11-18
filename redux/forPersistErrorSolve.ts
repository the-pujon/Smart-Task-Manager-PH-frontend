"use client";

// Solved this NextJs redux persist error
// Error name = "redux-persist failed to create sync storage. falling back to noop storage."

import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storageEngine =
  typeof window === 'undefined'
    ? createNoopStorage()
    : createWebStorage('local');

export default storageEngine;

// use this storageEngine into persistConfig --> storage

