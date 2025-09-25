import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { siExecuteDetailViewGridMetaData } from "./metaData/gridMetaData";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { Dialog } from "@mui/material";
import { StandingInstructionEditData } from "./editData";
import AuditData from "./auditdatadisplay";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import {
  ActionTypes,
  GridWrapper,
  usePopupContext,
  queryClient,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { format } from "date-fns";

type SiExecuteDetailViewProps = {
  open: any;
  lineId: any;
  srCd: any;
  tran_cd: any;
  onClose: any;
  screenFlag?: any;
  branch_cd?: any;
};
const SiExecuteDetailView: React.FC<SiExecuteDetailViewProps> = ({
  open,
  lineId,
  srCd,
  tran_cd,
  onClose,
  screenFlag,
  branch_cd,
}) => {
  const authController = useContext(AuthContext);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [opens, setOpens] = useState(false);
  const [opensAuditDialog, setOpensAuditDialog] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentRowData, setCurrentRowData] = useState<any>({});
  const [rows, setrows] = useState([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const isDeleteDataRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const actions: ActionTypes[] = [
    ...(screenFlag !== "SIDTL_TRN"
      ? [
          {
            actionName: "edit",
            actionLabel: "Edit",
            rowDoubleClick: false,
            alwaysAvailable: false,
            multiple: false,
          },
        ]
      : []),
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    {
      actionName: "delete",
      actionLabel: "Delete",
      rowDoubleClick: true,
      alwaysAvailable: false,
      multiple: undefined,
    },
  ];

  const setCurrentAction = useCallback(
    async (data) => {
      isDeleteDataRef.current = data?.rows?.[0];
      const { name, rows } = data;
      if (name === "close") {
        onClose();
        setData(null);
      } else if (name === "edit") {
        if (rows && rows.length > 0) {
          setOpens(true);
          setEditData(rows[0]);
          setCurrentRowData(rows[0]);
        }
      } else if (name === "delete") {
        if (rows && rows.length > 0) {
          setCurrentRowData(rows[0].data);
        }

        deleteValidationMutation.mutate({
          reqData: {
            ENT_COMP_CD: data?.rows[0].data?.ENT_COMP_CD ?? "",
            ENT_BRANCH_CD: data?.rows[0].data?.ENT_BRANCH_CD ?? "",
            TRAN_CD: data?.rows[0].data?.TRAN_CD ?? "",
            SR_CD: data?.rows[0].data?.SR_CD ?? "",
            LINE_ID: data?.rows[0].data?.LINE_ID ?? "",
            SUB_LINE_ID: data?.rows[0].data?.SUB_LINE_ID ?? "",
            REF_TRAN_CD: data?.rows[0].data?.REF_TRAN_CD ?? "",
            PROCESS_DT: data?.rows[0].data?.PROCESS_DT
              ? format(new Date(data?.rows[0].data?.PROCESS_DT), "dd/MMM/yyyy")
              : "",
            SI_EXECUTE_FLG: data?.rows[0].data?.SI_EXECUTE_FLG ?? "",
            SCREEN_REF: docCD ?? "",
            BASE_BRANCH_CD: authState?.user?.baseBranchCode ?? "",
            WORKING_DATE: authState?.workingDate ?? "",
            USERNAME: authState?.user?.id ?? "",
            USERROLE: authState?.role ?? "",
          },
        });
      } else {
        navigate(name, {
          state: rows,
        });
      }
    },
    [navigate, onClose]
  );
  const {
    refetch: siRefetch,
    isLoading,
    isFetching,
  } = useQuery(
    ["getSiExecuteDetailViewData", lineId, srCd],
    () =>
      API.getSiExecuteDetailViewData({
        companyID: authController?.authState?.companyID ?? "",
        branchCode: branch_cd
          ? branch_cd
          : authController?.authState?.user?.branchCode ?? "",
        Tran_cd: tran_cd ?? "",
        Line_id: lineId ?? "",
        Sr_cd: srCd ?? "",
      }),
    {
      enabled: open === true ? true : false,
      onSuccess: (data) => {
        setData(data);
      },
    }
  );

  let populatedata: any = [];
  if (currentRowData && currentRowData.id !== undefined) {
    for (let i = currentRowData.id - 1; i < data?.length; i++) {
      if (data[i].SI_EXECUTE_FLG === "N") {
        populatedata.push(data[i]);
      }
    }
  }
  const deleteValidationMutation = useMutation(API.deleteSIDetailData, {
    onSuccess: async (data) => {
      if (data?.[0]?.O_STATUS === "0") {
        enqueueSnackbar(t("deleteSuccessfully"), {
          variant: "success",
        });
      } else if (data?.[0]?.O_STATUS === "999") {
        MessageBox({
          messageTitle: data?.[0]?.O_MSG_TITLE || "ValidationFailed",
          message: data?.[0]?.O_MESSAGE,
          icon: "ERROR",
        });
      } else if (data?.[0]?.O_STATUS === "99") {
        const buttonName = await MessageBox({
          messageTitle: data?.[0]?.O_MSG_TITLE || "Confirmation",
          message: data?.[0]?.O_MESSAGE,
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          deleteMutation.mutate({
            reqdata: {
              ENT_COMP_CD: isDeleteDataRef.current?.data?.ENT_COMP_CD ?? "",
              ENT_BRANCH_CD: isDeleteDataRef.current?.data?.ENT_BRANCH_CD ?? "",
              TRAN_CD: isDeleteDataRef.current?.data?.TRAN_CD ?? "",
              SR_CD: isDeleteDataRef.current?.data?.SR_CD ?? "",
              LINE_ID: isDeleteDataRef.current?.data?.LINE_ID ?? "",
              SUB_LINE_ID: isDeleteDataRef.current?.data?.SUB_LINE_ID ?? "",
              REF_TRAN_CD: isDeleteDataRef.current?.data?.REF_TRAN_CD ?? "",
            },
          });
        }
      }
    },
    onError: async (error: any) => {
      const btnName = await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const deleteMutation = useMutation(API.deleteSIExecuteDetail, {
    onSuccess: async (data) => {
      enqueueSnackbar(t("deleteSuccessfully"), {
        variant: "success",
      });
      if (data?.[0]?.O_STATUS === "0") {
        const buttonName = await MessageBox({
          messageTitle: t("Alert"),
          message: data?.[0]?.O_MESSAGE,
          icon: "CONFIRM",
          buttonNames: ["Yes", "No"],
        });
        if (buttonName === "Yes") {
          if (open) {
            siRefetch();
          }
        }
      } else if (data?.[0]?.STATUS === "999") {
        MessageBox({
          messageTitle: t("ValidationFailed"),
          message: data?.[0]?.O_MESSAGE,
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {
      MessageBox({
        messageTitle: t("ERROR"),
        message: error?.error_detail,
        icon: "ERROR",
      });
    },
  });
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getSiExecuteDetailViewData"]);
    };
  }, []);
  if (screenFlag === "SIDTL_TRN") {
    siExecuteDetailViewGridMetaData.gridConfig.footerNote =
      "DeleteTheTransactionTRN";
  } else {
    siExecuteDetailViewGridMetaData.gridConfig.footerNote =
      "DeletetheTransaction";
  }
  return (
    <Fragment>
      <Dialog
        open={open}
        PaperProps={{ style: { width: "100%", overflow: "auto" } }}
        maxWidth="lg"
      >
        <GridWrapper
          key={"standingInsructionGridMetaData"}
          finalMetaData={siExecuteDetailViewGridMetaData as GridMetaDataType}
          loading={
            isLoading ||
            isFetching ||
            deleteValidationMutation?.isLoading ||
            deleteMutation?.isLoading
          }
          data={data ?? []}
          setData={() => null}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => siRefetch()}
          onClickActionEvent={(index, id, currentData) => {
            if (id === "_hidden2") {
              setOpensAuditDialog(true);
            }
            setrows(currentData);
          }}
        />
      </Dialog>
      <StandingInstructionEditData
        open={opens}
        onClose={() => setOpens(false)}
        allData={populatedata}
        currentData={currentRowData}
        siRefetch={siRefetch}
      />
      <AuditData
        open={opensAuditDialog}
        onClose={() => setOpensAuditDialog(false)}
        griddata={rows}
      />
    </Fragment>
  );
};

export default SiExecuteDetailView;
