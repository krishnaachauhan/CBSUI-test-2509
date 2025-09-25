import React, { useState } from "react";

const useTableContext = (props) => {
  const [state, setState] = useState({});

  const updateState = React.useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return { ...props, state, updateState };
};

export default useTableContext;
