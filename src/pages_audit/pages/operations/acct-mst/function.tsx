import { usePopupContext } from "@acuteinfo/common-base";
import { useMemo } from "react";

export const useCommonFunctions = () => {
  const { MessageBox } = usePopupContext();

  //Function for display Messages
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
    }
    return true;
  };

  return { showMessageBox };
};

export const useJointDetailByTabName = (
  tabName: string,
  state: { tabsApiResctx?: any[]; jointTypeDtl?: any[] }
): any[] => {
  return useMemo(() => {
    if (!tabName || !state?.tabsApiResctx || !state?.jointTypeDtl) return [];

    const jType = state.tabsApiResctx.find(
      (obj) => obj.TAB_NAME === tabName
    )?.J_TYPE;

    return state.jointTypeDtl.filter((item) => item.J_TYPE === jType);
  }, [tabName, state?.tabsApiResctx, state?.jointTypeDtl]);
};
