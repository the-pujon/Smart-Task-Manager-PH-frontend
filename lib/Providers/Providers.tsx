"use client";
import {persistor, store} from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const providers = ({ children }: { children: React.ReactNode }) => {

  return (
    <PersistGate persistor={persistor} loading={null}>
      {() => <Provider store={store}>{children}</Provider>}
    </PersistGate>
  );
};

export default providers;
