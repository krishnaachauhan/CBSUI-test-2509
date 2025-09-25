import { usePopupContext } from "@acuteinfo/common-base";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface DialogContextType {
  dialogClassNames: string;
  commonClass: string | null;
  trackDialogClass: (className: string) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogClassNames, setDialogClassNames] = useState<string>("");
  const { isMessageBoxOpen } = usePopupContext();
  const [commonClass, setCommonClass] = useState<string | null>(
    localStorage.getItem("commonClass")
  );
  const trackDialogClass = (className: string) => {
    setDialogClassNames(className);
  };
  useEffect(() => {
    if (isMessageBoxOpen)
      localStorage.setItem("commonClass", "message__box__base");
    else localStorage.removeItem("commonClass");
  }, [isMessageBoxOpen]);
  setTimeout(() => {
    setCommonClass(localStorage.getItem("commonClass"));
  }, 50);

  return (
    <DialogContext.Provider
      value={{ commonClass, dialogClassNames, trackDialogClass }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within a DialogProvider");
  }
  return context;
};
