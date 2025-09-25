import { AppBar, Button, Dialog, IconButton } from "@mui/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { DocMasterDTLMetadata } from "./docMasterDTLMetadata";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import * as API from "../../../../api";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import { useSnackbar } from "notistack";
import FilePreviewUpload from "./FilePreviewUpload";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import _ from "lodash";
import {
  PopupMessageAPIWrapper,
  Alert,
  MasterDetailsMetaData,
  MasterDetailsForm,
  useDialogStyles,
  Transition,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import { t } from "i18next";

interface updateExtDocumentDataType {
  data: object;
  displayData?: object;
  endSubmit?: any;
  setFieldError?: any;
  setLoading?: any;
}
const updateExtDocumentDetailsDataWrapperFn =
  (updateMasterData) =>
  async ({ data }: updateExtDocumentDataType) => {
    return updateMasterData(data);
  };
export const DocMasterDTLForm = ({
  ClosedEventCall,
  isDataChangedRef,
  defaultmode = "view",
  girdData,
  preventModify = false,
}) => {
  const navigate = useNavigate();
  // const ClosedEventCall = () => {
  //   navigate(".");
  // }
  const classes = useDialogStyles();
  const myRef = useRef<any>(null);
  const mysubdtlRef = useRef<any>({});
  const [isLoading, setLoading] = useState(false);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const [formMode, setFormMode] = useState(defaultmode);
  const { state }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [openAccept, setopenAccept] = useState(false);
  const isErrorFuncRef = useRef<any>(null);
  const reqPayloadRef = useRef<any>(null);
  const fileRowRef = useRef<any>(null);
  const { rows, CUSTOMER_DATA } = state;
  // console.log("stateeeeeeee2", state);
  const reqCD = state?.CUSTOMER_DATA?.[0]?.data.REQUEST_ID ?? "";
  const custID = state?.CUSTOMER_DATA?.[0]?.data.CUSTOMER_ID ?? "";
  const IS_FROM_MAIN = Boolean(
    Array.isArray(state?.rows) && state?.rows?.length > 0
  )
    ? state?.rows?.[0]?.data?.IS_FROM_MAIN
    : "Y";
  let newFlag = "";
  DocMasterDTLMetadata.masterForm.form.label = `${t("KYCDocumentView")}${
    custID ? `${t("CustomerId")} - ${custID}` : null
  } ${
    rows?.[0]?.data?.TEMPLATE_CD
      ? `${t("Document")} -  ${rows?.[0]?.data?.TEMPLATE_CD}`
      : null
  } `;
  useEffect(() => {
    if (Boolean(preventModify)) {
      setFormMode("edit");
    }
  }, []);
  // get sub grid data
  const mutationRet: any = useMutation(
    updateExtDocumentDetailsDataWrapperFn(API.getDocumentImagesList)
  );
  // const mutationRet: any = useMutation(API.getDocumentImagesList, {
  //   onSuccess: (data) => {},
  //   onError: (error: any) => {},
  // });

  // console.log("wkejfnhiwuefe", rows, REQ_CD, CUSTOMER_ID);

  // update modification
  const mutation = useMutation(
    updateExtDocumentDetailsDataWrapperFn(API.updateExtDocument),
    {
      onError: (error: any, { endSubmit, setLoading }) => {
        // setLoading(false);
        endSubmit(true, error?.error_msg, error?.error_detail);
        onActionCancel();
      },
      onSuccess: (data, { endSubmit, setLoading }) => {
        // setLoading(false);
        // endSubmit(true);
        // mutationRet.mutate({
        //   data: {
        //     TRAN_CD: rows[0]?.data?.TRAN_CD,
        //     SR_CD: rows[0]?.data?.SR_CD,
        //     REQ_CD: reqCD,
        //   },
        // });
        // mysubdtlRef.current = {
        //   ...mysubdtlRef.current,
        //   TRAN_CD: rows[0]?.data?.TRAN_CD,
        //   SR_CD: rows[0]?.data?.SR_CD,
        //   REQ_CD: reqCD,
        // };

        enqueueSnackbar(t("RecordUpdatedMsg"), {
          variant: "success",
        });
        isDataChangedRef.current = true;
        ClosedEventCall();
      },
    }
  );
  // const mutation: any = useMutation(API.updateExtDocument, {
  //   onSuccess: (data) => {
  //     enqueueSnackbar("Record Updated successfully.", {
  //       variant: "success",
  //     });
  //     isDataChangedRef.current = true;
  //     ClosedEventCall();
  //   },
  //   onError: (error: any, { endSubmit, setLoading }) => {
  //     endSubmit(true, error?.error_msg, error?.error_detail);
  //     onActionCancel();
  //   },
  // });

  // useEffect(() => {
  //   if(!mutationRet.isLoading && mutationRet.data) {
  //     console.log(girdData, "weoifjjweof", mutationRet.data)
  //     newFlag = mutationRet.data?.[0]?.NEW_FLAG ?? "";
  //   }
  // }, [mutationRet.isLoading, mutationRet.data])

  const AddNewRow = async () => {
    if (!Boolean(preventModify)) {
      myRef.current?.addNewRow(true);
    }
  };
  const onPopupYesAccept = (rows) => {
    // console.log("rowvalll", rows)
    mutation.mutate({
      ...isErrorFuncRef.current,
    });
  };
  const onActionCancel = () => {
    setopenAccept(false);
  };

  const onSubmitHandler = ({
    data,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
    setFieldErrors,
    actionFlag,
    displayData,
    setFieldError,
  }) => {
    endSubmit(true);
    if (Boolean(preventModify)) {
    } else {
      // console.log(data, formMode, "wefqwdqwdqwdqwdq onsubkmkimtttt"
      // ,data?.DETAILS_DATA, mysubdtlRef.current
      // );
      if (
        formMode !== "new" &&
        data?._UPDATEDCOLUMNS?.length === 0 &&
        data?.DETAILS_DATA?.isDeleteRow?.length === 0 &&
        data?.DETAILS_DATA?.isNewRow?.length === 0 &&
        data?.DETAILS_DATA?.isUpdatedRow?.length === 0
      ) {
        setFormMode("view");
      } else {
        let newData: any = data;
        if (Boolean(newData._isNewRow)) {
          newData = _.omit(newData, ["SR_CD", "TRAN_CD"]);
        }
        // newData["_isNewRow"] = data._isNewRow;
        // newData["_UPDATEDCOLUMNS"] = data._UPDATEDCOLUMNS;
        // newData["_OLDROWVALUE"] = data._OLDROWVALUE;
        // newData["TRAN_CD"] = data.TRAN_CD;
        // newData["SR_CD"] = data.SR_CD;
        // if(Array.isArray(data?._UPDATEDCOLUMNS) && data?._UPDATEDCOLUMNS?.length>0) {
        //   data?._UPDATEDCOLUMNS.forEach(fieldName => {
        //     if(fieldName === "SUBMIT") {
        //       if(typeof data.SUBMIT === "boolean") {
        //         if(Boolean(data.SUBMIT)) {
        //           newData["SUBMIT"] = "Y";
        //         } else {
        //           newData["SUBMIT"] = "N";
        //         }
        //       } else {
        //         newData["SUBMIT"] = data.SUBMIT;
        //       }
        //     } else if(fieldName === "VALID_UPTO") {
        //       newData["VALID_UPTO"] = format(
        //         new Date(data.VALID_UPTO),
        //         "dd-MM-yyyy"
        //       );
        //     } else {
        //       newData[fieldName] = data[fieldName]
        //     }
        //   });
        // }
        // newData["DETAILS_DATA"] = data?.DETAILS_DATA;
        if (typeof data.SUBMIT === "boolean") {
          if (Boolean(data.SUBMIT)) {
            newData["SUBMIT"] = "Y";
          } else {
            newData["SUBMIT"] = "N";
          }
        } else {
          newData["SUBMIT"] = data.SUBMIT;
        }
        if (
          Object.hasOwn(data._OLDROWVALUE, "SUBMIT") &&
          typeof data._OLDROWVALUE?.SUBMIT !== "undefined"
        ) {
          newData._OLDROWVALUE.SUBMIT = Boolean(data._OLDROWVALUE?.SUBMIT)
            ? "Y"
            : "N";
        }
        newData["REQ_CD"] = reqCD ?? "";
        // if (Boolean(data._isNewRow)) {
        //   newData["IS_MAIN_DATA_ADD"] = true;
        // }
        // if (data.SUBMIT === "Y") {
        //   newData["SUBMIT"] = true;
        // } else {
        //   newData["SUBMIT"] = false;
        // }

        // if (Boolean(newData["VALID_UPTO"])) {
        //   newData["VALID_UPTO"] = format(
        //     new Date(newData["VALID_UPTO"]),
        //     "dd-MM-yyyy"
        //   );
        // }
        // if (newData.DETAILS_DATA["isNewRow"]?.length > 0) {
        //   newData.DETAILS_DATA["isNewRow"] = newData.DETAILS_DATA["isNewRow"].map(
        //     (row) => {
        //       // VALID_UPTO
        //       if (Boolean(row.VALID_UPTO)) {
        //         return {
        //           ...row,
        //           VALID_UPTO: format(new Date(row.VALID_UPTO), "dd-MM-yyyy"),
        //         };
        //       } else return { ...row };
        //     }
        //   );
        // }
        // if (newData.DETAILS_DATA["isNewRow"]?.length > 0) {
        // }
        // console.log(data, "dtaa on sibmitg", newData)

        const payload = {
          DOC_MST: [
            {
              ...newData,
              NEW_FLAG: mutationRet.data?.[0]?.NEW_FLAG ?? "N",
              IS_FROM_MAIN: Boolean(newData?._isNewRow) ? "Y" : IS_FROM_MAIN,
              //  IS_FROM_MAIN: Boolean(newData?._isNewRow) ? "Y" : girdData?.[0]?.IS_FROM_MAIN ?? "",
            },
          ],
          REQ_CD: reqCD,
          CUSTOMER_ID: custID,
          COMP_CD: authState?.companyID ?? "",
          BRANCH_CD: authState?.user?.branchCode ?? "",
          // IS_FROM_MAIN:
          //   custDTLMutation.data?.[0]?.DOC_MST?.[0]?.IS_FROM_MAIN ?? "N",
          REQ_FLAG: "E",
          IsNewRow: Boolean(reqCD) ? false : true,
        };
        reqPayloadRef.current = payload;
        // console.log("weiuifhoiuewhf", newData, girdData)

        isErrorFuncRef.current = {
          data: payload,
          endSubmit,
          setFieldError,
          displayData,
        };
        setopenAccept(true);
      }

      // isErrorFuncRef.current = { data, displayData, endSubmit, setFieldError };
      // setopenAccept(true);
      // mutation.mutate({ data, endSubmit, setLoading });
    }
  };

  useEffect(() => {
    if (formMode !== "new") {
      // console.log(rows, REQ_CD, "not new formmode", mysubdtlRef.current)
      mutationRet.mutate({
        data: {
          TRAN_CD: rows[0]?.data?.TRAN_CD,
          SR_CD: rows[0]?.data?.SR_CD,
          REQ_CD: reqCD,
        },
      });
      mysubdtlRef.current = {
        ...mysubdtlRef.current,
        TRAN_CD: rows[0]?.data?.TRAN_CD,
        SR_CD: rows[0]?.data?.SR_CD,
        REQ_CD: reqCD,
      };
    }
  }, []);
  // const onFormButtonClickHandel = (id) => {
  //   setOpenImgViewer(true);
  // };

  // useEffect(() => {
  //   console.log(
  //     {
  //       _isNewRow: false,
  //       ...(rows?.[0]?.data ?? {}),
  //       DETAILS_DATA: mutationRet.data || [],
  //     },
  //     "derffwe"
  //   );
  // }, [rows]);

  return (
    <Fragment>
      <Dialog
        open={true}
        //@ts-ignore
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="md"
        classes={{
          scrollPaper: classes.topScrollPaper,
          paperScrollBody: classes.topPaperScrollBody,
        }}
      >
        {mutationRet.isLoading ? (
          <div style={{ height: 100, paddingTop: 10 }}>
            <div style={{ padding: 10 }}>
              <LoaderPaperComponent />
            </div>
            {typeof ClosedEventCall === "function" ? (
              <div style={{ position: "absolute", right: 0, top: 0 }}>
                <IconButton onClick={ClosedEventCall}>
                  <HighlightOffOutlinedIcon />
                </IconButton>
              </div>
            ) : null}
          </div>
        ) : mutationRet.isError ? (
          <>
            <div
              style={{
                paddingRight: "10px",
                paddingLeft: "10px",
                height: 100,
                paddingTop: 10,
              }}
            >
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={mutationRet.error?.error_msg ?? "Unknow Error"}
                  errorDetail={mutationRet.error?.error_detail ?? ""}
                  color="error"
                />
                {typeof ClosedEventCall === "function" ? (
                  <div style={{ position: "absolute", right: 0, top: 0 }}>
                    <IconButton onClick={ClosedEventCall}>
                      <HighlightOffOutlinedIcon />
                    </IconButton>
                  </div>
                ) : null}
              </AppBar>
            </div>
          </>
        ) : formMode === "view" ? (
          <MasterDetailsForm
            key={"extDocumentMasterDTL-" + formMode}
            metaData={DocMasterDTLMetadata as MasterDetailsMetaData}
            ref={myRef}
            initialData={{
              _isNewRow: false,
              ...(rows?.[0]?.data ?? {}),
              DETAILS_DATA: mutationRet.data || [],
            }}
            displayMode={"view"}
            isLoading={true}
            onSubmitData={onSubmitHandler}
            isNewRow={true}
            containerstyle={{
              padding: "10px",
            }}
            formStyle={{
              background: "white",
              // height: "25vh",
              // overflowY: "auto",
              // overflowX: "hidden",
            }}
            formName={"fromSourceDetail"}
            formNameMaster={"fromSourceMaster"}
            onClickActionEvent={(index, id, data) => {
              if (Boolean(preventModify)) {
                fileRowRef.current = {
                  ...data,
                };
                setIsFileViewOpen(true);
              }
            }}
          >
            {({ isSubmitting, handleSubmit }) => {
              return (
                <>
                  <Button
                    onClick={() => {
                      // if(!Boolean(preventModify)) {
                      setFormMode("edit");
                      // }
                    }}
                    // disabled={isSubmitting}
                    // endIcon={
                    //   isSubmitting ? <CircularProgress size={20} /> : null
                    // }
                    color={"primary"}
                  >
                    {t("Edit")}
                  </Button>
                  <Button
                    onClick={ClosedEventCall}
                    // disabled={isSubmitting}
                    color={"primary"}
                  >
                    {t("Close")}
                  </Button>
                </>
              );
            }}
          </MasterDetailsForm>
        ) : formMode === "edit" ? (
          <>
            <MasterDetailsForm
              key={"extDocumentMasterDTL-" + formMode}
              metaData={DocMasterDTLMetadata as MasterDetailsMetaData}
              ref={myRef}
              initialData={{
                _isNewRow: false,
                ...(rows?.[0]?.data ?? {}),
                DETAILS_DATA: mutationRet.data || [],
              }}
              displayMode={Boolean(preventModify) ? "view" : formMode}
              // displayMode={Boolean(preventModify) ? "view" : formMode}
              isLoading={isLoading}
              onSubmitData={onSubmitHandler}
              isNewRow={false}
              containerstyle={{
                padding: "10px",
              }}
              isDetailRowRequire={false}
              formStyle={{
                background: "white",
                // height: "25vh",
                // overflowY: "auto",
                // overflowX: "hidden",
              }}
              formName={"fromSourceDetailEdit"}
              formNameMaster={"fromSourceMasterEdit"}
              onClickActionEvent={(index, id, data) => {
                // console.log(data, "qewfkhqiwuefdqw", mysubdtlRef.current)
                // console.log(mysubdtlRef.current, "edit row button clicked", data, id, index, mutationRet.data);
                // mysubdtlRef.current = {
                //   ...mysubdtlRef.current,
                //   DOC_IMAGE: data?.DOC_IMAGE,
                //   VALID_UPTO: data?.VALID_UPTO,
                // }
                fileRowRef.current = {
                  ...data,
                };
                setIsFileViewOpen(true);
              }}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    {!Boolean(preventModify) && (
                      <Button
                        onClick={AddNewRow}
                        // disabled={isSubmitting}
                        //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                        color={"primary"}
                      >
                        {t("AddRow")}
                      </Button>
                    )}
                    {!Boolean(preventModify) && (
                      <Button
                        onClick={handleSubmit}
                        // disabled={isSubmitting}
                        // endIcon={
                        //   isSubmitting ? <CircularProgress size={20} /> : null
                        // }
                        color={"primary"}
                      >
                        {t("Save")}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (Boolean(preventModify)) {
                          ClosedEventCall();
                        } else {
                          setFormMode("view");
                        }
                      }}
                      // disabled={isSubmitting}
                      color={"primary"}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                );
              }}
            </MasterDetailsForm>
            {openAccept ? (
              <PopupMessageAPIWrapper
                MessageTitle="Confirmation"
                Message="Do you want to save this Request?"
                onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
                onActionNo={() => onActionCancel()}
                rows={isErrorFuncRef.current?.data}
                open={openAccept}
                loading={mutation.isLoading}
              />
            ) : null}
          </>
        ) : formMode === "new" ? (
          <>
            <MasterDetailsForm
              key={"extDocumentMasterDTL-" + formMode}
              metaData={DocMasterDTLMetadata as MasterDetailsMetaData}
              ref={myRef}
              initialData={{
                _isNewRow: true,
                // ...(rows?.[0]?.data ?? {}),
                DETAILS_DATA: [],
              }}
              displayMode={formMode}
              isLoading={isLoading}
              onSubmitData={onSubmitHandler}
              isNewRow={true}
              containerstyle={{
                padding: "10px",
              }}
              formStyle={{
                background: "white",
                // height: "25vh",
                // overflowY: "auto",
                // overflowX: "hidden",
              }}
              isDetailRowRequire={false}
              formState={{ gridData: girdData }}
              formName={"fromSourceDetailEdit"}
              formNameMaster={"fromSourceMasterEdit"}
              onClickActionEvent={(index, id, data) => {
                // console.log(mysubdtlRef.current, "new row button clicked", data, id, index, mutationRet.data);
                // mysubdtlRef.current = {
                //   ...mysubdtlRef.current,
                //   DOC_IMAGE: data?.DOC_IMAGE,
                //   VALID_UPTO: data?.VALID_UPTO,
                // }
                fileRowRef.current = {
                  ...data,
                };
                setIsFileViewOpen(true);
              }}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    <Button
                      onClick={AddNewRow}
                      // disabled={isSubmitting}
                      //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      color={"primary"}
                    >
                      {t("AddRow")}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      // disabled={isSubmitting}
                      // endIcon={
                      //   isSubmitting ? <CircularProgress size={20} /> : null
                      // }
                      color={"primary"}
                    >
                      {t("Save")}
                    </Button>
                    <Button
                      onClick={() => {
                        if (defaultmode === "new") {
                          ClosedEventCall();
                        } else {
                          setFormMode("view");
                        }
                      }}
                      // disabled={isSubmitting}
                      color={"primary"}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                );
              }}
            </MasterDetailsForm>
            {openAccept ? (
              <PopupMessageAPIWrapper
                MessageTitle="Confirmation"
                Message="SaveData"
                onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
                onActionNo={() => onActionCancel()}
                rows={isErrorFuncRef.current?.data}
                open={openAccept}
                loading={mutation.isLoading}
              />
            ) : null}
          </>
        ) : null}
        {isFileViewOpen ? (
          <FilePreviewUpload
            myRef={myRef}
            open={isFileViewOpen}
            setOpen={setIsFileViewOpen}
            detailsDataRef={fileRowRef.current}
            filesGridData={mutationRet.data || []}
            mainDocRow={mysubdtlRef.current}
            preventModify={preventModify}
          />
        ) : null}
      </Dialog>
    </Fragment>
  );
};
