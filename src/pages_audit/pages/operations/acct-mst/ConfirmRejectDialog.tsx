import React from "react";
import { RemarksAPIWrapper } from "@acuteinfo/common-base";

/**
 * Shared Confirm/Reject Dialog for account confirmation
 * Props:
 * - isOpen: boolean
 * - confirmAction: "Y" | "R" | null
 * - onActionNo: () => void
 * - onActionYes: (val: string, rows: any) => void
 * - isLoading: boolean
 * - authState: object
 * - row: object
 * - t: function (i18n translation)
 */
const ConfirmRejectDialog = ({
  isOpen,
  confirmAction,
  onActionNo,
  onActionYes,
  isLoading,
  authState,
  row,
  t,
}) => {
  return (
    <RemarksAPIWrapper
      key={confirmAction}
      TitleText={
        row?.REQUEST_ID
          ? `${confirmAction === "Y" ? t("Confirm") : t("Reject")} ${
              row?.REQ_FLAG_DISP
            } Account ${t("Req Code")} - ${row?.REQUEST_ID}`
          : `${confirmAction === "Y" ? t("Confirm") : t("Reject")}`
      }
      onActionNo={onActionNo}
      defaultValue={`${
        confirmAction === "Y" ? t("APPROVED BY") : t("REJECTED BY")
      } ${authState?.user?.name?.toUpperCase() ?? ""} ON ${
        authState?.workingDate
      }`}
      onActionYes={onActionYes}
      isLoading={isLoading}
      isEntertoSubmit={true}
      AcceptbuttonLabelText={`${
        confirmAction === "Y" ? t("Confirm") : t("Reject")
      }`}
      CanceltbuttonLabelText="Cancel"
      open={isOpen}
      rows={{}}
      isRequired={confirmAction === "Y" ? false : true}
    />
  );
};

export default ConfirmRejectDialog;
