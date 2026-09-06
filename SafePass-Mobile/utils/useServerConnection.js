import { useCallback, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import ApiService from "./ApiService";

export default function useServerConnection() {
  const [connected, setConnected] = useState(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    let offline = false;
    let generation = 0;
    let pending = null;
    const refresh = async () => {
      if (!active || offline || AppState.currentState === "background" || pending !== null) return;
      const request = ++generation;
      pending = request;
      try {
        const result = await ApiService.testConnection();
        if (active && request === generation) setConnected(result);
      } catch {
        if (active && request === generation) setConnected(false);
      } finally {
        if (pending === request) pending = null;
      }
    };
    const unsubscribe = NetInfo.addEventListener((state) => {
      offline = state.isConnected === false || state.isInternetReachable === false;
      if (offline) {
        generation += 1;
        pending = null;
        if (active) setConnected(false);
      } else {
        void refresh();
      }
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    void refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      active = false;
      generation += 1;
      clearInterval(timer);
      unsubscribe();
      subscription.remove();
    };
  }, []));
  return connected;
}
