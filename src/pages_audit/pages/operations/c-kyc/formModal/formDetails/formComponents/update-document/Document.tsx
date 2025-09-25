import { AppBar, Dialog, Grid, IconButton } from "@mui/material";
import { DocumentGridMetadata } from "./docGridmetadata";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import { useMutation } from "react-query";
import * as API from "../../../../api";
import { AuthContext } from "pages_audit/auth";
import { DocMasterDTLForm } from "./DocMasterDTLForm";
import { enqueueSnackbar } from "notistack";
import {
  PopupMessageAPIWrapper,
  Alert,
  GridWrapper,
  GridMetaDataType,
  RemarksAPIWrapper,
} from "@acuteinfo/common-base";
import { GeneralAPI } from "registry/fns/functions";
import { t } from "i18next";

const UpdateDocument = ({ open, onClose, viewMode, from }) => {
  const navigate = useNavigate();
  const isDataChangedRef = useRef(false);
  const myGridRef = useRef<any>(null);
  const [isDelConfirm, setIsDelConfirm] = useState<boolean>(false);
  const currRowRef = useRef<any>(false);
  const { handleFormModalClosectx } = useContext(CkycContext);
  const [girdData, setGridData] = useState<any>([]);
  const [confirmAction, setConfirmAction] = useState<any>("");
  const [isOpen, setIsOpen] = useState<any>(false);
  const { authState } = useContext(AuthContext);
  const { state } = useLocation();
  const reqCD = state?.CUSTOMER_DATA?.[0]?.data.REQUEST_ID ?? "";
  const custID = state?.CUSTOMER_DATA?.[0]?.data.CUSTOMER_ID ?? "";
  const payload = {
    REQ_CD: reqCD,
    CUSTOMER_ID: custID,
  };

  // get exstinig customer data
  const custDTLMutation: any = useMutation(GeneralAPI.getDocDetails, {
    onSuccess: (data) => {
      if (Array.isArray(data) && data.length > 0) {
        let newData: any[] = data;
        newData = newData.map((doc) => {
          return {
            ...doc,
            TRANSR_CD: `${doc.TRAN_CD}${doc.SR_CD}`,
            SUBMIT: doc.SUBMIT === "Y" ? true : false,
          };
        });
        setGridData([...newData]);
      }
    },
  });

  // update modification
  const mutation: any = useMutation(API.updateExtDocument, {
    onSuccess: (data) => {
      custDTLMutation.mutate(payload);
      setIsDelConfirm(false);
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
    },
    onError: (error: any) => {
      setIsDelConfirm(false);
    },
  });

  const confirmMutation: any = useMutation(API.ConfirmDocument, {
    onSuccess: async (data, variables) => {
      setConfirmAction("");
      setIsOpen(false);
    },
    onError: (error: any) => {
      setConfirmAction("");
      setIsOpen(false);
    },
  });

  const openActionDialog = (state: string) => {
    setIsOpen(true);
    setConfirmAction(state);
  };

  useEffect(() => {
    custDTLMutation.mutate(payload);
  }, []);

  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      // isDataChangedRef.current = true;
      custDTLMutation.mutate(payload);
      isDataChangedRef.current = false;
    }
    navigate(".", { state: { ...state } });
    // handleFormModalClosectx();
    // onClose();
  };

  const actions = [
    {
      actionName: "edit-details",
      actionLabel: "ViewDtl",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];

  const action2 = useMemo(() => {
    let actionArray = [
      {
        actionName: "edit-details",
        actionLabel: "ViewDtl",
        multiple: false,
        rowDoubleClick: true,
      },
      {
        actionName: "add",
        actionLabel: "Add",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
      },
      {
        actionName: "close",
        actionLabel: "Close",
        multiple: undefined,
        rowDoubleClick: false,
        alwaysAvailable: true,
      },
    ];

    if (Boolean(from && from === "ckyc-confirm")) {
      actionArray = [
        {
          actionName: "edit-details",
          actionLabel: "ViewDtl",
          multiple: false,
          rowDoubleClick: true,
        },
        {
          actionName: "confirm",
          actionLabel: "Confirm",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "reject",
          actionLabel: "Reject",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "close",
          actionLabel: "Close",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ];
    }
    return actionArray;
  }, [viewMode]);

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "close") {
        handleFormModalClosectx();
        onClose();
      } else if (data.name === "confirm") {
        openActionDialog("Y");
      } else if (data.name === "reject") {
        openActionDialog("R");
      } else {
        setConfirmAction("");
        navigate(data?.name, {
          state: {
            ...state,
            rows: data?.rows,
            // REQ_CD: reqCD, CUSTOMER_ID: custID
          },
        });
      }
    },
    [navigate]
  );

  const onDeleteDocument = () => {
    const payload = {
      DOC_MST: [
        {
          TRAN_CD: currRowRef.current?.TRAN_CD,
          SR_CD: currRowRef.current?.SR_CD,
          REQ_CD: reqCD,
          _isDeleteRow: true,
          IS_FROM_MAIN: currRowRef.current?.IS_FROM_MAIN ?? "N",
          NEW_FLAG: "N",
          DETAILS_DATA: {
            isDeleteRow: [],
            isNewRow: [],
            isUpdatedRow: [],
          },
          // _isNewRow: false,
        },
      ],
      REQ_CD: reqCD,
      CUSTOMER_ID: custID,
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      REQ_FLAG: "E",
      IsNewRow: Boolean(reqCD) ? false : true,
    };
    mutation.mutate(payload);
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
          // maxWidth: "90%",
        },
      }}
    >
      <Grid container>
        {custDTLMutation.isError ? (
          <Alert
            severity={custDTLMutation.error?.severity ?? "error"}
            errorMsg={
              custDTLMutation.error?.error_msg ?? "Something went to wrong.."
            }
            errorDetail={custDTLMutation.error?.error_detail}
            color="error"
          />
        ) : mutation.isError ? (
          <Alert
            severity={mutation.error?.severity ?? "error"}
            errorMsg={mutation.error?.error_msg ?? "Something went to wrong.."}
            errorDetail={mutation.error?.error_detail}
            color="error"
          />
        ) : confirmMutation.isError ? (
          <Alert
            severity={confirmMutation.error?.severity ?? "error"}
            errorMsg={
              confirmMutation.error?.error_msg ?? "Something went to wrong.."
            }
            errorDetail={confirmMutation.error?.error_detail}
            color="error"
          />
        ) : null}
        <GridWrapper
          key={`operatorMasterGrid` + girdData + setGridData}
          finalMetaData={DocumentGridMetadata as GridMetaDataType}
          data={girdData ?? []}
          setData={setGridData}
          loading={
            custDTLMutation.isLoading ||
            custDTLMutation.isFetching ||
            mutation.isLoading
          }
          actions={action2}
          setAction={setCurrentAction}
          // refetchData={() => refetch()}
          ref={myGridRef}
          onClickActionEvent={(index, id, currentData) => {
            if (id === "_hidden" && !Boolean(from && from === "ckyc-confirm")) {
              setIsDelConfirm(true);
              currRowRef.current = currentData;
              // let newData: any[] = [];
              // newData =
              //   girdData.length > 0 &&
              //   girdData.filter(
              //     (row) => row.TRANSR_CD !== currentData.TRANSR_CD
              //   );
              // setGridData([...newData]);
            } else if (id === "VIEW_DTL") {
              navigate("edit-details", {
                state: {
                  ...state,
                  rows: [{ data: { ...currentData } }],
                  // REQ_CD: reqCD,
                  // CUSTOMER_ID: custID,
                },
              });
            }
          }}
        />
        {Boolean(confirmAction) && (
          <RemarksAPIWrapper
            TitleText={
              confirmAction === "Y"
                ? "Confirm"
                : confirmAction === "R" && "Rejection Reason"
            }
            onActionNo={() => {
              setIsOpen(false);
              setConfirmAction("");
            }}
            onActionYes={(val, rows) => {
              confirmMutation.mutate({
                REQUEST_CD: reqCD,
                COMP_CD: custID,
                CONFIRMED: confirmAction,
                REQ_FROM: "CUST",
                REMARKS: val,
              });
            }}
            defaultValue={`${
              confirmAction === "Y"
                ? t("APPROVED BY")
                : confirmAction === "R"
                ? t("REJECTED BY")
                : ""
            } ${authState?.user?.name?.toUpperCase() ?? ""} ON ${
              authState?.workingDate ?? ""
            }`}
            isLoading={confirmMutation.isLoading || confirmMutation.isFetching}
            isEntertoSubmit={true}
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isOpen}
            rows={{}}
            isRequired={confirmAction === "Y" ? false : true}
            // isRequired={false}
          />
        )}
        <PopupMessageAPIWrapper
          MessageTitle="CONFIRM"
          Message="DoYouWantToDeleteThisDocument"
          onActionYes={(rowVal) => {
            onDeleteDocument();
          }}
          onActionNo={() => {
            setIsDelConfirm(false);
          }}
          rows={{}}
          open={isDelConfirm}
          loading={mutation.isLoading}
        />

        <Routes>
          <Route
            path="edit-details/*"
            element={
              <DocMasterDTLForm
                isDataChangedRef={isDataChangedRef}
                ClosedEventCall={handleDialogClose}
                defaultmode={"view"}
                girdData={girdData}
                preventModify={Boolean(from && from === "ckyc-confirm") ?? true}
              />
            }
          />
          <Route
            path="add/*"
            element={
              <DocMasterDTLForm
                isDataChangedRef={isDataChangedRef}
                ClosedEventCall={handleDialogClose}
                defaultmode={"new"}
                girdData={girdData}
              />
            }
          />
        </Routes>
      </Grid>
    </Dialog>
  );
};

export default UpdateDocument;
