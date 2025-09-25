import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as API from "../api";
import { useMutation, useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { format, parse } from "date-fns";
import { releaseSubGridMetaData } from "./metadata";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";

const releaseSubActions: ActionTypes[] = [
  {
    actionName: "cancle",
    actionLabel: "Cancel",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "release",
    actionLabel: "Release",
    multiple: true,
    rowDoubleClick: undefined,
    alwaysAvailable: false,
  },
];

const ReleaseSubGrid = ({ handleRlsSubClose, refetchMainGrid }) => {
  const [releaseSubData, setReleaseSubData] = useState<any>([]);
  const [releaseSubAction, setReleaseSubAction] =
    useState<any>(releaseSubActions);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: stateData }: any = useLocation();
  const releaseSubRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation()?.pathname, authState?.menulistdata);

  const reqObject = {
    ENTERED_BRANCH_CD: stateData?.ENTERED_BRANCH_CD,
    ENTERED_COMP_CD: stateData?.ENTERED_COMP_CD,
    MCT_TRAN_CD: stateData?.MCT_TRAN_CD,
  };

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["releaseSubData", { ...reqObject }], () =>
    API?.getReleaseSubGridData({ ...reqObject })
  );

  useEffect(() => {
    if (data?.length > 0) {
      setReleaseSubData(data);
    }
  }, [data]);

  const releaseRecords: any = useMutation(API?.releaseRecords, {
    onSuccess: async (data: any, variables?: any) => {
      if (data?.length > 0) {
        const getBtnName = async (msgObj) => {
          let btnNm = await MessageBox(msgObj);
          return { btnNm, msgObj };
        };
        const handleMessages = async (status, message, title) => {
          if (status === "999") {
            await getBtnName({
              messageTitle: title ?? "ValidationFailed",
              message,
              icon: "ERROR",
            });
          } else if (status === "99") {
            const { btnNm } = await getBtnName({
              messageTitle: title ?? "Confirmation",
              message,
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });

            if (btnNm === "No") {
              return;
            }
          } else if (status === "9") {
            await getBtnName({
              messageTitle: title ?? "Alert",
              message,
              icon: "WARNING",
            });
          } else if (status === "0") {
            await getBtnName({
              messageTitle: title ?? "Success",
              message,
              icon: "SUCCESS",
            });
          }
        };
        for (let i = 0; i < data?.length; i++) {
          const status: any = data?.[i]?.O_STATUS;
          const message = data?.[i]?.O_MESSAGE;
          const title = data?.[i]?.O_MSG_TITLE;
          setTimeout(() => {
            handleMessages(status, message, title);
          }, 50);
        }
        CloseMessageBox();
        handleRlsSubClose();
        refetchMainGrid();
      }
    },
    onError: (error: any, variables?: any) => {
      CloseMessageBox();
    },
  });

  const rlsSubCurrentAction = useCallback(
    async (data) => {
      const row = data?.rows;
      if (data?.name === "cancle") {
        handleRlsSubClose();
      } else if (data?.name === "release") {
        const gridData = releaseSubRef?.current?.cleanData?.();
        const msgBoxRes = await MessageBox({
          messageTitle: "Confirmation",
          message: `${t("ReleaseConfirmationMsg")}${
            gridData?.[0]?.MCT_TRAN_CD ?? ""
          }?`,
          defFocusBtnName: "Yes",
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
        });

        if (msgBoxRes === "Yes") {
          const parsedDate = parse(
            gridData?.[0]?.TRAN_DT,
            "yyyy-MM-dd HH:mm:ss.S",
            new Date()
          );

          const formattedDate = format(parsedDate, "dd/MMM/yyyy");
          const requestPara = {
            TRAN_DT: formattedDate ?? "",
            ENTERED_COMP_CD: gridData?.[0]?.ENTERED_COMP_CD ?? "",
            ENTERED_BRANCH_CD: gridData?.[0]?.ENTERED_BRANCH_CD ?? "",
            SCREEN_REF: docCD,
            TRANSACTION_DTL: data?.rows?.map((record) => {
              return {
                DAILY_TRN_CD: record?.data?.DAILY_TRN_CD ?? "",
                MCT_TRAN_CD: record?.data?.MCT_TRAN_CD ?? "",
                DELETE_FLAG: "Y",
              };
            }),
          };
          releaseRecords?.mutate(requestPara);
        } else {
          CloseMessageBox();
        }
      }
    },
    [releaseSubAction]
  );

  useEffect(() => {
    return () => {
      queryClient?.removeQueries(["releaseSubData", { ...reqObject }]);
    };
  }, []);

  return (
    <Dialog open={true} className="ReleaseGrid" maxWidth={"xl"}>
      <>
        {isError ? (
          <Fragment>
            <Alert
              severity={error?.severity ?? "error"}
              errorMsg={error?.error_msg ?? "Error"}
              errorDetail={error?.error_detail ?? ""}
            />
          </Fragment>
        ) : releaseRecords?.isError ? (
          <Fragment>
            <Alert
              severity={releaseRecords?.error?.severity ?? "error"}
              errorMsg={releaseRecords?.error?.error_msg ?? "Error"}
              errorDetail={releaseRecords?.error?.error_detail ?? ""}
            />
          </Fragment>
        ) : null}
        <GridWrapper
          key={`releaseGridMetaData` + releaseSubAction}
          finalMetaData={releaseSubGridMetaData as GridMetaDataType}
          data={releaseSubData ?? []}
          loading={isLoading || isFetching}
          setData={setReleaseSubData}
          actions={releaseSubAction}
          setAction={rlsSubCurrentAction}
          hideHeader={false}
          refetchData={() => refetch()}
          ref={releaseSubRef}
        />
      </>
    </Dialog>
  );
};

export default ReleaseSubGrid;
