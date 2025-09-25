import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  extractMetaData,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AcctMSTContext } from "../../acct-mst/AcctMSTContext";
import { AuthContext } from "pages_audit/auth";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import _ from "lodash";
import { format } from "date-fns";
import { Grid } from "@mui/material";
import { AppDetailMetaData } from "./AppDetailMetaData";
import { AddNewBankMasterForm } from "../../ctsOutwardNew/addNewBank";
import { TransferTable } from "./TransferTable";
import useAppDetail from "./Hooks/useAppDetail";

const ApplicationDetail = () => {
  const {
    formRef,
    onSubmitAppHandler,
    initialVal,
    AcctMSTState,
    bankName,
    MessageBox,
    setBankData,
    setOpenAddBankForm,
    docCD,
    setDisplayTransferTable,
    handleCurrFormctx,
    tabFormRefs,
    isOpenAddBankForm,
    displayTransferTable,
    transferRef,
    onSubmitTransTableHandler,
    bankData,
    setBankName,
  } = useAppDetail();

  return (
    <Grid>
      <FormWrapper
        ref={formRef}
        onSubmitHandler={onSubmitAppHandler}
        initialValues={initialVal}
        key={"acct-mst-main-tab-form"}
        metaData={
          extractMetaData(
            AppDetailMetaData,
            AcctMSTState?.formmodectx
          ) as MetaDataType
        }
        formStyle={{}}
        formState={{
          bankName: bankName,
          MessageBox: MessageBox,
          setBankData,
          setOpenAddBankForm,
          docCD: docCD,
          parameter: [
            {
              SHARE_AMT: AcctMSTState?.SHARE_AMT,
            },
          ],
          CUSTOMER_ID: AcctMSTState?.customerIDctx,
          acctDtlReqPara: {
            MEM_CD: {
              ACCT_TYPE: "MEM_TYPE",
              BRANCH_CD: "MEM_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            SHARE_ACCT_CD: {
              ACCT_TYPE: "SHARE_TYPE",
              BRANCH_CD: "SHARE_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            FEES_ACCT_CD: {
              ACCT_TYPE: "FEES_TYPE",
              BRANCH_CD: "FEES_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            STNRY_ACCT_CD: {
              ACCT_TYPE: "STNRY_ACCT_TYPE",
              BRANCH_CD: "STNRY_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
            DIV_CR_ACCT_CD: {
              ACCT_TYPE: "DIV_CR_ACCT_TYPE",
              BRANCH_CD: "DIV_CR_BRANCH_CD",
              SCREEN_REF: docCD ?? "",
            },
          },
        }}
        hideHeader={true}
        displayMode={AcctMSTState?.formmodectx}
        controlsAtBottom={false}
        setDataOnFieldChange={async (action, payload, ...data) => {
          if (action === "MODE_OF_PAY") {
            if (payload?.value === "T") {
              setDisplayTransferTable(true);
            } else {
              setDisplayTransferTable(false);
              handleCurrFormctx({
                currentFormRefctx: [formRef],
                colTabValuectx: AcctMSTState?.colTabValuectx,
                currentFormSubmitted: null,
                isLoading: false,
              });
              const tabIndex = AcctMSTState?.tabNameList?.findIndex(
                (tab) => tab.tabNameFlag === "APPLICATION_DETAIL"
              );

              if (tabFormRefs && tabIndex !== -1) {
                tabFormRefs.current[tabIndex] = formRef.current;
              }
            }
          }
        }}
      ></FormWrapper>
      {displayTransferTable && (
        <TransferTable
          ref={transferRef}
          defaultView={AcctMSTState?.formmodectx}
          formRef={formRef}
          CUSTOMER_ID={AcctMSTState?.customerIDctx}
          onSubmitTransTableHandler={onSubmitTransTableHandler}
          SHARE_AMT={AcctMSTState?.SHARE_AMT}
        />
      )}

      {isOpenAddBankForm ? (
        <AddNewBankMasterForm
          docCD={docCD}
          isOpen={isOpenAddBankForm}
          bankData={bankData}
          onClose={(flag, rowsData) => {
            if (flag === "save") {
              setOpenAddBankForm(false);
              setBankName({ BANK_CD: rowsData?.[0]?.BANK_NM ?? "" });
            }
            setOpenAddBankForm(false);
          }}
        />
      ) : null}
    </Grid>
  );
};

export default ApplicationDetail;
