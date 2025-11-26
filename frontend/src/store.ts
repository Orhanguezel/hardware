import { configureStore } from "@reduxjs/toolkit";
import { hardwareApi } from "@/integrations/hardware/rtk/baseApi";

export const store = configureStore({
  reducer: {
    [hardwareApi.reducerPath]: hardwareApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hardwareApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
