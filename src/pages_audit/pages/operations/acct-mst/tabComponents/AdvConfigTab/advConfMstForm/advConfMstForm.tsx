import { Dialog } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  GridMetaDataType,
  ActionTypes,
  GridWrapper,
  Alert,
} from "@acuteinfo/common-base";
import { advConfMstFormMetadata } from "./advConfMstFormMetadata";
import { useQuery } from "react-query";
import { advConfDocdtl } from "../../../api";
import { useNavigate } from "react-router-dom";

export const AdvConfMstForm = ({
  closeDialog,
  setGridData,
  initialData,
  acountNum,
  gridData,
}) => {
  const myRef = useRef<any>(null);
  const [formMode, setformMode] = useState<any>("new");
  const navigate = useNavigate();

  const { isError, error, isLoading, data } = useQuery<any, any>(
    ["advConfDocdtl"],
    () =>
      advConfDocdtl({
        COMP_CD: initialData?.COMP_CD,
        BRANCH_CD: initialData?.BRANCH_CD,
        ACCT_TYPE: initialData?.ACCT_TYPE,
        ACCT_CD: initialData?.ACCT_CD,
        SR_CD: initialData?.SR_CD,
      }),

    {
      enabled: Boolean(formMode === "view"),
    }
  );

  useEffect(() => {
    if (
      typeof initialData === "object" &&
      Object.keys(initialData).length &&
      !initialData?._isNewRow
    ) {
      setformMode("view");
    } else {
      setformMode("new");
    }
  }, []);

  const actions: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "close") {
        closeDialog();
      }
    },
    [navigate]
  );

  return isError ? (
    <div style={{ width: "100%", paddingTop: "10px" }}>
      <Alert
        severity={error?.severity ?? "error"}
        errorMsg={error?.error_msg ?? "Error"}
        errorDetail={error?.error_detail ?? ""}
      />
    </div>
  ) : (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "1450px",
          },
        }}
      >
        <>
          <GridWrapper
            key={"adv-conf-mstform" + formMode + data}
            finalMetaData={advConfMstFormMetadata as GridMetaDataType}
            data={data}
            setData={() => null}
            controlsAtBottom
            ref={myRef}
            actions={actions}
            setAction={setCurrentAction}
            loading={isLoading}
          ></GridWrapper>
        </>
      </Dialog>
    </>
  );
};
