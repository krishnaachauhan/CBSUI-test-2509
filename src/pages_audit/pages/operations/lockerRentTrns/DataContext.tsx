import React, { createContext, useState, ReactNode, useContext } from "react";

interface DataContextType {
  data: {
    reqData: object | null;
    formData: any;
    activeView: string;
    isSubmit: Boolean;
    retrievalPara: object | null;
    screenFlag: string;
  };
  setContextState: (newData: Partial<DataContextType["data"]>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DataContextType["data"]>({
    reqData: {},
    formData: [],
    activeView: "master",
    retrievalPara: {},
    isSubmit: false,
    screenFlag: "",
  });

  const setContextState = (newData: Partial<DataContextType["data"]>) => {
    setData((prevState) => ({
      ...prevState,
      ...newData,
    }));
  };

  return (
    <DataContext.Provider value={{ data, setContextState }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);

  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }

  return context;
};

export default DataContext;
