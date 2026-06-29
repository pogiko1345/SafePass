import React from "react";

export const AviationTransitionContext = React.createContext(null);

export const useAviationTransition = () => React.useContext(AviationTransitionContext);
