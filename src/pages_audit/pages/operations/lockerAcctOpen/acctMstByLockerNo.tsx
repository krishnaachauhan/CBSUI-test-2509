import React, { useContext, useEffect } from "react";
import AcctMSTProvider, { AcctMSTContext } from "../acct-mst/AcctMSTContext";
import AcctModal from "../acct-mst/AcctModal";
import { Dialog } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";

type AcctMstByLockerNoProps = {
  open: boolean;
  closeDialog: () => void;
  reqPara: Record<string, any>;
};

export const AcctMstByLockerNo: React.FC<AcctMstByLockerNoProps> = ({
  open,
  closeDialog,
  reqPara,
}) => {
  const navigate = useNavigate();
  const { AcctMSTState, handleAcctTypeValue, handleFormDataonSavectx } =
    useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  useEffect(() => {
    if (reqPara?.ALLOTED === "N") {
      handleAcctTypeValue(reqPara?.ACCT_TYPE);
      let newData = AcctMSTState?.formDatactx;

      newData["MAIN_DETAIL"] = {
        ...newData["MAIN_DETAIL"],
        lf_no: reqPara?.LOCKER_NO ?? "",
        LF_NO: reqPara?.LOCKER_NO ?? "",
        OP_DATE: authState?.workingDate ?? "",
        LOCKER_KEY_NO: reqPara?.LOC_KEY_NO ?? "",
        DAY_BOOK_GRP_CD: reqPara?.LOC_SIZE_CD ?? "",
      };
      handleFormDataonSavectx(newData);
    }
  }, [reqPara]);

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="xl"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            closeDialog();
          }
        }}
      >
        <AcctModal
          key={reqPara?.TRAN_CD}
          onClose={closeDialog}
          asDialog={false}
          rowData={reqPara}
          formmodeState={reqPara?.ALLOTED === "Y" ? "view" : "new"}
          fromState={reqPara?.ALLOTED === "Y" ? "pending-entry" : "new-entry"}
          screenFlag={"AcctMst"}
        />
      </Dialog>
    </>
  );
};
