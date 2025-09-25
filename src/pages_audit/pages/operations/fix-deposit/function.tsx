import { usePopupContext } from "@acuteinfo/common-base";
import { useRef, useEffect, useCallback } from "react";

// Custom hook to manage focus functionality
const useFocus = () => {
  const focusRef = useRef<any>(null);
  const setFocusRef = useRef<any>(null);

  useEffect(() => {
    if (setFocusRef.current && focusRef.current) {
      focusRef.current.focus();
      setFocusRef.current = false;
    }
  }, [setFocusRef.current]);

  const setFocus = () => {
    setFocusRef.current = true;
  };

  return { focusRef, setFocus };
};

// Custom hook to manage showing message box functionality
const useMessageBox = () => {
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const showMessageBox = async (obj) => {
    if (
      obj?.O_STATUS === "999" ||
      obj?.O_STATUS === "99" ||
      obj?.O_STATUS === "9"
    ) {
      const buttonName = await MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : obj?.O_STATUS === "9"
          ? "Alert"
          : obj?.O_STATUS === "99"
          ? "Confirmation"
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
        loadingBtnName: ["Yes"],
        icon:
          obj?.O_STATUS === "999"
            ? "ERROR"
            : obj?.O_STATUS === "99"
            ? "CONFIRM"
            : obj?.O_STATUS === "9"
            ? "WARNING"
            : "INFO",
      });

      if (obj?.O_STATUS === "99" && buttonName === "No") {
        return false;
      }
      return true;
    }
    if (obj?.O_STATUS === "0") {
      CloseMessageBox();
      return true;
    }
  };
  return { showMessageBox };
};

// Main hook combining both focus and message box functionalities
export const useCommonFunctions = () => {
  const { focusRef, setFocus } = useFocus();
  const { showMessageBox } = useMessageBox();

  // Return all the necessary functions from the hook
  return { showMessageBox, focusRef, setFocus };
};
