import { AppBar, Button, Dialog, IconButton } from "@mui/material";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { AcctMSTContext } from "../../AcctMSTContext";
import { DocMasterDTLMetadata } from "./docMasterDTLMetadata";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";

import _, { cloneDeep } from "lodash";

import FilePreviewUpload from "./FilePreviewUpload";
import {
  MasterDetailsMetaData,
  Transition,
  useDialogStyles,
  MasterDetailsForm,
  utilFunction,
  GridMetaDataType,
  LoaderPaperComponent,
  Alert,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import { getDocumentImagesList } from "../../api";

export const DocMasterDTLForm = ({
  ClosedEventCall,
  isDataChangedRef,
  defaultmode = "view",
  girdData,
  isOpen,
  currentData, //main current row data
  changedRowsRef, // changed doc format payload
  myGridRef,
  setGridData,
}) => {
  const { t } = useTranslation();
  const classes = useDialogStyles();
  const { AcctMSTState } = useContext(AcctMSTContext);
  const reqCD = AcctMSTState?.req_cd_ctx ?? "";
  // const IS_FROM_MAIN = currentData?.IS_FROM_MAIN ?? "Y";

  const [formMode, setFormMode] = useState(defaultmode);
  const [isFileViewOpen, setIsFileViewOpen] = useState(false);
  const { authState } = useContext<any>(AuthContext);
  const myRef = useRef<any>(null);
  const fileRowRef = useRef<any>(null);

  const mutationRet: any = useMutation(getDocumentImagesList, {
    onSuccess: (data) => {},
  });

  const AddNewRow = async () => {
    myRef.current?.addNewRow(false);
  };
  const onSubmitHandler = async ({
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
    // console.log(
    //   data,
    //   formMode,
    //   "wefqwdqwdqwdqwdq onsubkmkimtttt",
    //   currentData?.current
    //   // , mysubdtlRef.current
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
      // console.log(
      //   data,
      //   formMode,
      //   "wefqwdqwdqwdqwdq onsubkmkimtttt 2"
      //   // , mysubdtlRef.current
      // );
      let newData: any = data;
      if (
        Boolean(newData._isNewRow) &&
        !Boolean(AcctMSTState?.isFreshEntryctx)
      ) {
        newData = _.omit(newData, ["SR_CD", "TRAN_CD"]);
      }
      if (typeof data.SUBMIT === "boolean") {
        if (Boolean(data.SUBMIT)) {
          newData["SUBMIT"] = "Y";
        } else {
          newData["SUBMIT"] = "N";
        }
      } else {
        newData["SUBMIT"] = data.SUBMIT;
      }
      if (typeof data.ACTIVE === "boolean") {
        if (Boolean(data.ACTIVE)) {
          newData["ACTIVE"] = "Y";
        } else {
          newData["ACTIVE"] = "N";
        }
      } else {
        newData["ACTIVE"] = data.ACTIVE;
      }
      if (
        Object.hasOwn(data._OLDROWVALUE, "SUBMIT") &&
        typeof data._OLDROWVALUE?.SUBMIT !== "undefined"
      ) {
        newData._OLDROWVALUE.SUBMIT = Boolean(data._OLDROWVALUE?.SUBMIT)
          ? "Y"
          : "N";
      }
      if (
        Object.hasOwn(data._OLDROWVALUE, "ACTIVE") &&
        typeof data._OLDROWVALUE?.ACTIVE !== "undefined"
      ) {
        newData._OLDROWVALUE.ACTIVE = Boolean(data._OLDROWVALUE?.ACTIVE)
          ? "Y"
          : "N";
      }
      newData["REQ_CD"] = reqCD ?? "";
      // console.log(data, "dtaa on sibmitg", newData);

      if (AcctMSTState?.isFreshEntryctx) {
        let imgGridData = await myRef?.current?.GetGirdData?.();
        imgGridData = imgGridData?.map((imageDoc) => {
          // const {LINE_CD, ...others} = imageDoc;
          return { ...imageDoc };
        });
        let masterFormData = await myRef?.current?.getFieldData?.();
        newData.docImages = [...imgGridData];
        if (
          Boolean(newData?.DETAILS_DATA?.isNewRow) &&
          newData?.DETAILS_DATA?.isNewRow?.length > 0
        ) {
          let rmvLineCd = newData?.DETAILS_DATA?.isNewRow?.map((row) => {
            // const {LINE_CD, ...others} = row;
            return { ...row };
          });
          newData["DETAILS_DATA"]["isNewRow"] = [...rmvLineCd];
        }

        let mainDocGridData = await myGridRef?.current?.cleanData?.();

        // console.log(
        //   masterFormData,
        //   "master myr",
        //   imgGridData,
        //   "main grid ->",
        //   mainDocGridData
        // );
        if (formMode === "new") {
          let maxSR_CD = utilFunction.GetMaxCdForDetails(
            mainDocGridData,
            "SR_CD"
          );
          let maxDisplaySequence = utilFunction.GetMaxDisplaySequenceCd(
            mainDocGridData,
            "_displaySequence"
          );
          newData["SR_CD"] = String(maxSR_CD);
          newData["TRANSR_CD"] = String(maxSR_CD);
          let payload = changedRowsRef?.current;
          // console.log("newdata after al change - new", newData);
          changedRowsRef.current = [...payload, newData];
          setGridData([
            ...mainDocGridData,
            {
              ...masterFormData,
              SR_CD: String(maxSR_CD),
              TRANSR_CD: String(maxSR_CD),
              docImages: [...imgGridData],
              _isNewRow: true,
              _displaySequence: maxDisplaySequence,
            },
          ]);
          ClosedEventCall();
        } else if (formMode === "edit") {
          // console.log(
          //   changedRowsRef?.current,
          //   newData,
          //   "myr in edit",
          //   mainDocGridData
          // );
          let payload = changedRowsRef?.current;
          if (
            Array.isArray(changedRowsRef?.current) &&
            changedRowsRef?.current?.filter(
              (row) =>
                row?.SR_CD === currentData.current?.SR_CD ||
                row?.TRANSR_CD === currentData.current?.TRANSR_CD
            )?.length > 0
          ) {
            payload = changedRowsRef?.current?.map((changedDoc) => {
              if (changedDoc?.TRANSR_CD === newData?.TRANSR_CD) {
                return newData;
              } else {
                return changedDoc;
              }
            });
            changedRowsRef.current = payload;
          } else {
            changedRowsRef.current = [...payload, newData];
          }
          // console.log(mainDocGridData, "--", newData, "master myr edit", imgGridData)
          let newGridData = mainDocGridData?.map((mainDoc) => {
            if (
              mainDoc?.TRANSR_CD === newData?.TRANSR_CD ||
              mainDoc?.SR_CD === newData?.SR_CD
            ) {
              return {
                ...mainDoc,
                ...masterFormData,
                docImages: [...imgGridData],
                // _isNewRow: true
              };
            } else {
              return mainDoc;
            }
          });
          currentData.current = {
            ...currentData.current,
            ...masterFormData,
            docImages: [...imgGridData],
          };
          setGridData([...newGridData]);
          setFormMode("view");
        }
      } else {
        if (formMode === "new") {
          console.log("fresh update -- new", newData);
        } else if (formMode === "edit") {
          console.log("fresh update -- edit", newData);
        }

        let imgGridData = await myRef?.current?.GetGirdData?.();
        imgGridData = imgGridData?.map((imageDoc) => {
          if (Boolean(imageDoc?._isNewRow)) {
            // const {LINE_CD, ...others} = imageDoc;
            return { ...imageDoc };
          } else {
            return imageDoc;
          }
        });
        let masterFormData = await myRef?.current?.getFieldData?.();
        newData.docImages = [...imgGridData];

        let mainDocGridData = await myGridRef?.current?.cleanData?.();
        // console.log(
        //   masterFormData,
        //   "master myr",
        //   imgGridData,
        //   "main grid ->",
        //   mainDocGridData
        // );
        if (formMode === "new") {
          let maxSR_CD = utilFunction.GetMaxCdForDetails(
            mainDocGridData,
            "SR_CD"
          );
          let maxDisplaySequence = utilFunction.GetMaxDisplaySequenceCd(
            mainDocGridData,
            "_displaySequence"
          );
          newData["SR_CD"] = String(maxSR_CD);
          newData["TRANSR_CD"] = String(maxSR_CD);
          let payload = changedRowsRef?.current;
          changedRowsRef.current = [...payload, newData];
          setGridData([
            ...mainDocGridData,
            {
              ...masterFormData,
              SR_CD: String(maxSR_CD),
              TRANSR_CD: String(maxSR_CD),
              docImages: [...imgGridData],
              _isNewRow: true,
              _displaySequence: maxDisplaySequence,
            },
          ]);
          ClosedEventCall();
        } else if (formMode === "edit") {
          // console.log(
          //   changedRowsRef?.current,
          //   newData,
          //   "myr in edit",
          //   mainDocGridData,
          //   currentData.current
          // );
          let payload = changedRowsRef?.current;
          if (
            Array.isArray(changedRowsRef?.current) &&
            changedRowsRef?.current?.filter(
              (row) => row?.TRANSR_CD === currentData.current?.TRANSR_CD
            )?.length > 0
          ) {
            payload = changedRowsRef?.current?.map((changedDoc) => {
              if (changedDoc?.TRANSR_CD === currentData.current?.TRANSR_CD) {
                return {
                  ...newData,
                  SR_CD: currentData.current?.SR_CD,
                  TRANSR_CD: currentData.current?.TRANSR_CD,
                };
              } else {
                return changedDoc;
              }
            });
            changedRowsRef.current = payload;
          } else {
            changedRowsRef.current = [...payload, newData];
          }
          // console.log(mainDocGridData, "--", newData, "master myr edit", imgGridData)
          let newGridData = mainDocGridData?.map((mainDoc) => {
            if (mainDoc?.TRANSR_CD === currentData.current?.TRANSR_CD) {
              return {
                ...mainDoc,
                ...masterFormData,
                docImages: [...imgGridData],
                // _isNewRow: true
              };
            } else {
              return mainDoc;
            }
          });
          currentData.current = {
            ...currentData.current,
            ...masterFormData,
            docImages: [...imgGridData],
          };
          setGridData([...newGridData]);
          setFormMode("view");
        }
      }
      console.log("oiwejfoiwejfoiwjeofjewf", newData);
    }
  };

  //   useEffect(() => {
  //       console.log("not new formmode",currentData)
  //     //   if row is not fresh, its retrieved, and its opened in view mode.
  //     // api is getting called here, which is not going to be
  //     if (!Boolean(AcctMSTState?.isFreshEntryctx) && formMode !== "new" && !Boolean(currentData?.current?._isNewRow)) {
  //         // will not execute, entry will be fresh only all the time.
  //       console.log("not new formmode2",currentData)
  //       mutationRet.mutate({
  //         TRAN_CD: currentData?.current?.TRAN_CD,
  //         SR_CD: currentData?.current?.SR_CD,
  //             REQ_CD: `${AcctMSTState?.req_cd_ctx}` ?? "",
  //       });
  //     //   mysubdtlRef.current = {
  //     //     ...mysubdtlRef.current,
  //     //     TRAN_CD: rows[0]?.data?.TRAN_CD,
  //     //     SR_CD: rows[0]?.data?.SR_CD,
  //     //     REQ_CD: reqCD,
  //     //   };
  //     }
  //   }, [])
  const hasNewRow = currentData?.current?.docImages?.some(
    (item) => item?._isNewRow === true
  );
  useEffect(() => {
    if (
      !Boolean(AcctMSTState?.isFreshEntryctx) &&
      formMode !== "new" &&
      !Boolean(hasNewRow)
    ) {
      mutationRet.mutate({
        TRAN_CD: currentData?.current?.TRAN_CD,
        SR_CD: currentData?.current?.SR_CD,
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
      });
    }
  }, []);
  let metadata = cloneDeep(DocMasterDTLMetadata) as MasterDetailsMetaData;
  return (
    <Fragment>
      <Dialog
        open={isOpen}
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
        {AcctMSTState?.isFreshEntryctx &&
          (mutationRet.isLoading ? (
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
          ) : (
            mutationRet.isError && (
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
            )
          ))}
        {formMode === "view" ? (
          <MasterDetailsForm
            key={
              "extDocumentMasterDTL-" +
              formMode +
              currentData?.current +
              mutationRet.data
            }
            metaData={metadata}
            ref={myRef}
            initialData={{
              _isNewRow: false,
              // DOC_TYPE: "ACCT",
              ...(currentData?.current ?? {}),
              DETAILS_DATA: AcctMSTState?.isFreshEntryctx
                ? currentData?.current?.DETAILS_DATA?.isNewRow ??
                  currentData?.current?.docImages
                : // ? currentData?.current?.docImages ?? []
                // : []
                Boolean(hasNewRow)
                ? currentData?.current?.docImages ?? []
                : mutationRet.data ?? [],
            }}
            displayMode={"view"}
            isLoading={
              AcctMSTState?.isFreshEntryctx && mutationRet?.isLoading
                ? true
                : false
            }
            onSubmitData={onSubmitHandler}
            isNewRow={true}
            containerstyle={{
              padding: "10px",
            }}
            formStyle={{
              background: "white",
            }}
            formName={"fromSourceDetail"}
            formNameMaster={"fromSourceMaster"}
            formState={{
              workingDate: authState?.workingDate ?? "",
            }}
          >
            {({ isSubmitting, handleSubmit }) => {
              return (
                <>
                  <Button
                    onClick={() => {
                      setFormMode("edit");
                    }}
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
              key={
                "extDocumentMasterDTL-" +
                formMode +
                currentData?.current +
                mutationRet.data
              }
              metaData={metadata}
              ref={myRef}
              initialData={{
                _isNewRow: AcctMSTState?.isFreshEntryctx ? true : false,
                // DOC_TYPE: "ACCT",
                ...(currentData?.current ?? {}),
                DETAILS_DATA: AcctMSTState?.isFreshEntryctx
                  ? currentData?.current?.DETAILS_DATA?.isNewRow ??
                    currentData?.current?.docImages
                  : // ? currentData?.current?.docImages ?? []
                  // : [],
                  // : mutationRet.data ?? [],
                  Boolean(hasNewRow)
                  ? currentData?.current?.docImages ?? []
                  : mutationRet.data ?? [],
              }}
              displayMode={formMode}
              isLoading={
                AcctMSTState?.isFreshEntryctx && mutationRet?.isLoading
                  ? true
                  : false
              }
              onSubmitData={onSubmitHandler}
              // isNewRow={ckycState?.isFreshEntryctx ? true : false}
              isNewRow={
                AcctMSTState?.isFreshEntryctx
                  ? true
                  : Boolean(hasNewRow)
                  ? true
                  : false
              }
              containerstyle={{
                padding: "10px",
              }}
              isDetailRowRequire={false}
              formStyle={{
                background: "white",
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
              formState={{
                workingDate: authState?.workingDate ?? "",
              }}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    <Button
                      onClick={AddNewRow}
                      disabled={isSubmitting}
                      //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      color={"primary"}
                    >
                      {t("DocumentUpload")}
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
                        setFormMode("view");
                      }}
                      disabled={isSubmitting}
                      color={"primary"}
                    >
                      {t("Cancel")}
                    </Button>
                  </>
                );
              }}
            </MasterDetailsForm>
            {/* {openAccept ? (
                        <PopupMessageAPIWrapper
                            MessageTitle="Confirmation"
                            Message="Do you want to save this Request?"
                            onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
                            onActionNo={() => onActionCancel()}
                            rows={isErrorFuncRef.current?.data}
                            open={openAccept}
                            // loading={mutation.isLoading}
                        />
                        ) : null} */}
          </>
        ) : formMode === "new" ? (
          <>
            <MasterDetailsForm
              key={"extDocumentMasterDTL-" + formMode}
              metaData={metadata}
              ref={myRef}
              initialData={{
                _isNewRow: true,
                DOC_TYPE: "ACCT",
                ENTERED_DATE: authState?.workingDate ?? "",
                DETAILS_DATA: [],
              }}
              // initialData={{
              //   _isNewRow: ckycState?.isFreshEntryctx ? true : false,
              //   ...(currentData ?? {}),
              //   DETAILS_DATA: ckycState?.isFreshEntryctx
              //   ? currentData?.docImages ?? []
              //   : [],
              // }}
              displayMode={formMode}
              isLoading={false}
              onSubmitData={onSubmitHandler}
              isNewRow={true}
              containerstyle={{
                padding: "10px",
              }}
              formStyle={{
                background: "white",
              }}
              isDetailRowRequire={false}
              formState={{
                gridData: girdData,
                workingDate: authState?.workingDate ?? "",
              }}
              formName={"fromSourceDetailNew"}
              formNameMaster={"fromSourceMasterNew"}
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
                      {t("DocumentUpload")}
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
            {/* {openAccept ? (
                        <PopupMessageAPIWrapper
                            MessageTitle="Confirmation"
                            Message="Do you want to save this Request?"
                            onActionYes={(rowVal) => onPopupYesAccept(rowVal)}
                            onActionNo={() => onActionCancel()}
                            rows={isErrorFuncRef.current?.data}
                            open={openAccept}
                            // loading={mutation.isLoading}
                        />
                        ) : null} */}
          </>
        ) : null}
      </Dialog>
      {isFileViewOpen ? (
        <FilePreviewUpload
          myRef={myRef}
          open={isFileViewOpen}
          setOpen={setIsFileViewOpen}
          detailsDataRef={fileRowRef.current}
          filesGridData={[]}
          // mainDocRow={mysubdtlRef.current}
        />
      ) : null}
    </Fragment>
  );
};
