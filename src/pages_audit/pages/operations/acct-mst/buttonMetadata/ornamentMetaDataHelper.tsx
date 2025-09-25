import { updateNodeDataAndFocus } from "components/agGridTable/utils/helper";
import * as API from "../api";
import { handleDisplayMessages } from "components/utilFunction/function";

export const getValuerTypeOp = async (authState) => {
  const APIrequest = await API.getValuerTypeOp({
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
  });
  return APIrequest;
};
export const getEmpIdDDW = async (authState) => {
  const APIrequest = await API.getEmpIdDDW({
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
    AS_FLAG: "A",
  });
  return APIrequest;
};
export const getOrnamentType = async (authState) => {
  const APIrequest = await API.getOrnamentTypeddw({
    COMP_CD: authState?.companyID,
    BRANCH_CD: authState?.user?.branchCode,
  });
  return APIrequest;
};
export const getOrnamentValue = async ({
  node,
  api,
  value,
  context,
  authState,
  AcctMSTState,
  field,
}) => {
  if (value) {
    const APIrequest = await API.getOrnamentValue({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: AcctMSTState?.rowBranchCodectx
        ? AcctMSTState?.rowBranchCodectx
        : authState?.user?.branchCode ?? "",
      CALL_FROM: field ?? "",
      MKT_RATE: node?.data?.MKT_RATE ?? "",
      WEIGHT: node?.data?.WEIGHT ?? "",
      ORN_TYPE: node?.data?.ORN_TYPE ?? "",
      NO_OF_ORN: node?.data?.NO_OF_ORN ?? "",
      CARET: node?.data?.CARET ?? "",
      GROSS_WEIGHT: node?.data?.GROSS_WEIGHT ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
    });
    const response = await handleDisplayMessages(
      APIrequest,
      context.MessageBox
    );

    updateNodeDataAndFocus(
      node,
      {
        DISABLE_MKT_RATE_VALUE: APIrequest?.[0]?.DISABLE_MKT_RATE_VALUE,
      },
      api,
      {
        isFieldFocused: field === "MKT_RATE",
        focusedAccessor: field === "MKT_RATE" ? "VALUER_CD" : "",
      }
    );
    setTimeout(() => {
      updateNodeDataAndFocus(node, {
        MKT_VALUE: APIrequest?.[0]?.MKT_VALUE,
        AMOUNT: APIrequest?.[0]?.AMOUNT,
        MKT_RATE: APIrequest?.[0]?.MKT_RATE,
      });
    }, 100);
  }
};
