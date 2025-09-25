import { usePopupContext } from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { AcctMSTContext } from "pages_audit/pages/operations/acct-mst/AcctMSTContext";
import { useCommonFunctions } from "pages_audit/pages/operations/acct-mst/function";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const useTransferTable = ({ CUSTOMER_ID, formRef, ref }) => {
  const { AcctMSTState, handleCurrFormctx, tabFormRefs } =
    useContext(AcctMSTContext);
  const { MessageBox } = usePopupContext();

  const { authState } = useContext(AuthContext);
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { showMessageBox } = useCommonFunctions();
  const [openPhotoSign, setOpenPhotoSign] = useState<boolean>(false);

  const photoSignReqRef = useRef({});

  const handleSignViewClick = async ({ id, dependentFields }) => {
    if (dependentFields?.["RECPAYTRANS.ACCT_TYPE"]?.value) {
      photoSignReqRef.current = {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: dependentFields?.["RECPAYTRANS.ACCT_TYPE"]?.value ?? "",
        ACCT_CD: dependentFields?.["RECPAYTRANS.ACCT_CD"]?.value ?? "",
        CUSTOMER_ID: "",
      };
    }
    setOpenPhotoSign(true);
  };

  useEffect(() => {
    handleCurrFormctx({
      currentFormRefctx: [formRef, ref],
      colTabValuectx: AcctMSTState?.colTabValuectx,
      currentFormSubmitted: null,
      isLoading: false,
    });
    const tabIndex = AcctMSTState?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "APPLICATION_DETAIL"
    );

    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = [formRef.current, ref?.current];
    }
  }, []);

  const initialVal = useMemo(() => {
    if (AcctMSTState?.formDatactx["TRANSFER_DTL"]?.length > 0) {
      return { RECPAYTRANS: AcctMSTState?.formDatactx["TRANSFER_DTL"] };
    } else {
      return {
        RECPAYTRANS: [
          {
            TRAN_DT: authState?.workingDate ?? "",
            COMP_CD: authState?.companyID ?? "",
            VALUE_DT: authState?.workingDate ?? "",
          },
        ],
      };
    }
  }, []);
  return {
    initialVal,
    MessageBox,
    docCD,
    showMessageBox,
    handleSignViewClick,
    openPhotoSign,
    photoSignReqRef,
    setOpenPhotoSign,
  };
};

export default useTransferTable;
