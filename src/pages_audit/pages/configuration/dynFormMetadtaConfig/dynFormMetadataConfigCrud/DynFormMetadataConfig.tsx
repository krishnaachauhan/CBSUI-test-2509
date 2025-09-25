import { useMutation, useQuery } from "react-query";
import { useSnackbar } from "notistack";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { Dialog, IconButton } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import * as API from "../api";

import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import {
  CreateDetailsRequestData,
  utilFunction,
  Alert,
  GridWrapper,
  FormWrapper,
  MetaDataType,
  queryClient,
  InitialValuesType,
  SubmitFnType,
  GradientButton,
  PopupMessageAPIWrapper,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";

import {
  DynamicFormConfigGridMetaDataEdit,
  DynamicFormConfigGridMetaDataView,
  DynamicFormConfigGridMetaDataAdd,
  DynamicFormConfigMetaData,
} from "./metaData";
import { PropsConfigForm } from "./propsConfigForm";

const DynamicFormMetadataConfig: FC<{
  isDataChangedRef: any;
  closeDialog?: any;
  defaultView?: "view" | "edit" | "add";
  fieldRowData: any;
}> = ({
  isDataChangedRef,
  closeDialog,
  defaultView = "view",
  fieldRowData,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formMode, setFormMode] = useState(defaultView);
  const { authState } = useContext(AuthContext);
  const [isOpenSave, setIsOpenSave] = useState(false);
  const isErrorFuncRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const mysubdtlRef = useRef<any>({});
  const myGridRef = useRef<any>(null);
  const [girdData, setGridData] = useState<any>([]);
  const [populateClicked, setPopulateClicked] = useState(false);
  const [isFieldComponentGrid, setFieldComponentGrid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const myRef = useRef<any>(null);
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getDynFieldListData"], () =>
    API.getDynFieldListData({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      docCD: fieldRowData?.[0]?.data?.DOC_CD ?? "",
      srcd: fieldRowData?.[0]?.data?.SR_CD ?? "",
    })
  );

  const mutation: any = useMutation(API.getDynFormPopulateData, {
    onError: (error: any) => {},
    // onSuccess: (data) => {
    //   let detailData = data?.map((item) => {
    //     return {
    //       ...item,
    //       // _isNewRow: true,
    //     };
    //   });
    //   console.log("myGridRef.current", myRef.current);
    //   setGridData((oldData) => {
    //     console.log("oldData", girdData);
    //     let existingData = oldData.map((item) => {
    //       console.log("item", item);
    //       let isExists = detailData.some((itemfilter) => {
    //         console.log("itemfilter", itemfilter);
    //         return itemfilter.COLUMN_ACCESSOR === item.COLUMN_ACCESSOR;
    //       });
    //       if (isExists) {
    //         return { ...item, _hidden: false };
    //       } else {
    //         return { ...item, _hidden: true };
    //       }
    //     });
    //     let newData = detailData.filter((itemFilter) => {
    //       let isExists = oldData.some((olditem) => {
    //         return olditem.COLUMN_ACCESSOR === itemFilter.COLUMN_ACCESSOR;
    //       });
    //       return !isExists;
    //     });
    //     let srCount = utilFunction.GetMaxCdForDetails(oldData, "SR_CD");
    //     newData = newData.map((newData) => {
    //       return { ...newData, _isNewRow: true, SR_CD: srCount++ };
    //     });
    //     // console.log(oldData, [...existingData, ...newData]);
    //     return [...existingData, ...newData];
    //   });
    // },
  });
  const result = useMutation(API.dynamiFormMetadataConfigDML, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      //endSubmit(false, errorMsg, error?.error_detail ?? "");
      if (isErrorFuncRef.current == null) {
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
      } else {
        isErrorFuncRef.current?.endSubmit(
          false,
          errorMsg,
          error?.error_detail ?? ""
        );
      }
      onActionCancel();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      isDataChangedRef.current = true;
      closeDialog();
    },
  });

  useEffect(() => {
    const gridDataToUpdate = populateClicked ? mutation.data : data;
    setGridData(Array.isArray(gridDataToUpdate) ? gridDataToUpdate : []);
  }, [data, mutation.data, populateClicked]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getDynFieldListData"]);
      queryClient.removeQueries(["getDynFormPopulateData"]);
      queryClient.removeQueries(["dynamiFormMetadataConfigDML"]);
    };
  }, []);

  const onPopupYes = (rows) => {
    result.mutate(rows);
  };
  const onActionCancel = () => {
    setIsOpenSave(false);
  };
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    delete data["POPULATE"];
    data["RESETFIELDONUNMOUNT"] = Boolean(data["RESETFIELDONUNMOUNT"])
      ? "Y"
      : "N";

    endSubmit(true);
    let oldData = {
      ...fieldRowData?.[0]?.data,
      RESETFIELDONUNMOUNT: Boolean(fieldRowData?.[0]?.data?.RESETFIELDONUNMOUNT)
        ? "Y"
        : "N",
    };

    let upd = utilFunction.transformDetailsData(data, oldData ?? {});

    if (actionFlag === "POPULATE") {
      data["COMP_CD"] = authState.companyID.trim();
      data["BRANCH_CD"] = authState.user.branchCode.trim();
      setPopulateClicked(true);
      mutation.mutate(data);
    } else {
      let { hasError, data: dataold } = await myGridRef.current?.validate();

      if (hasError === true) {
        if (dataold) {
          setGridData(dataold);
        }
      } else {
        let result = myGridRef?.current?.cleanData?.();
        if (!Array.isArray(result)) {
          result = [result];
        }
        result = result.map((item) => ({
          ...item,
          _isNewRow: formMode === "add" ? true : false,
        }));
        let finalResult = result.filter(
          (one) =>
            !(
              Boolean(one?._hidden) &&
              Boolean(one?._isNewRow) &&
              Boolean(one?._isTouchedCol)
            )
        );
        if (finalResult.length === 0) {
          closeDialog();
        } else {
          finalResult = CreateDetailsRequestData(finalResult);
          if (
            finalResult?.isDeleteRow?.length === 0 &&
            finalResult?.isNewRow?.length === 0 &&
            finalResult?.isUpdatedRow?.length === 0 &&
            upd?._UPDATEDCOLUMNS?.length === 0
          ) {
            closeDialog();
          } else {
            isErrorFuncRef.current = {
              data: {
                ...data,
                ...upd,
                SR_CD: fieldRowData?.[0]?.data?.SR_CD ?? "",
                _isNewRow: formMode === "add" ? true : false,
                DETAILS_DATA: finalResult,
                COMP_CD: authState.companyID,
                BRANCH_CD: authState.user.branchCode,
              },
              endSubmit,
              setFieldError,
            };
            console.log("isErrorFuncRef.current", isErrorFuncRef.current);
            setIsOpenSave(true);
          }
        }
      }
    }
    // // if (actionFlag === "save" && formMode === "add") {
    // //   navigate("configuration/dynamic-form-metadata/view-details", {
    // //     state: data,
    // //   });
    // }
  };
  if (formMode !== "add") {
    if (DynamicFormConfigMetaData.form.label) {
      DynamicFormConfigMetaData.form.label =
        "Dynamic Metadata Configure" +
        " " +
        fieldRowData?.[0]?.data?.FORM_LABEL +
        " " +
        fieldRowData?.[0]?.data?.DESCRIPTION;
    }
  }
  return (
    <>
      {(formMode === "edit" || formMode === "view") &&
      (isLoading ||
        isFetching ||
        !(fieldRowData && fieldRowData.length > 0) ||
        !girdData) &&
      !populateClicked ? (
        <div style={{ minHeight: "100px" }}>
          <LoaderPaperComponent />
        </div>
      ) : formMode !== "add" && isError ? (
        <Alert
          severity="error"
          errorMsg={error ?? "Error"}
          errorDetail={error ?? ""}
          color="error"
        />
      ) : (
        <>
          <FormWrapper
            key={`dynFormMetadataConfig` + formMode}
            metaData={DynamicFormConfigMetaData as unknown as MetaDataType}
            initialValues={fieldRowData?.[0]?.data as InitialValuesType}
            onSubmitHandler={onSubmitHandler}
            displayMode={formMode}
            formStyle={{
              background: "white",
            }}
            onFormButtonClickHandel={() => {
              let event: any = { preventDefault: () => {} };
              formRef?.current?.handleSubmit(event, "POPULATE");
            }}
            // onFormButtonCicular={mutation.isLoading}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {formMode === "edit" ? (
                  <>
                    <GradientButton
                      onClick={(event) => {
                        handleSubmit(event, "Save");
                      }}
                      disabled={isSubmitting}
                      //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      color={"primary"}
                    >
                      Save
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        setFormMode("view");
                      }}
                      color={"primary"}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </GradientButton>
                  </>
                ) : formMode === "add" ? (
                  <>
                    <GradientButton
                      onClick={(event) => {
                        handleSubmit(event, "Save");
                      }}
                      disabled={isSubmitting}
                      //endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      color={"primary"}
                    >
                      Save
                    </GradientButton>

                    <GradientButton
                      onClick={closeDialog}
                      //disabled={isSubmitting}
                      color={"primary"}
                    >
                      Close
                    </GradientButton>
                  </>
                ) : (
                  <>
                    <GradientButton
                      onClick={() => {
                        setFormMode("edit");
                      }}
                      //disabled={isSubmitting}
                      color={"primary"}
                    >
                      Edit
                    </GradientButton>
                    <GradientButton
                      onClick={closeDialog}
                      //disabled={isSubmitting}
                      color={"primary"}
                    >
                      Close
                    </GradientButton>
                  </>
                )}
              </>
            )}
          </FormWrapper>
          <GridWrapper
            key={
              `DynamicFormConfigGridMetaData` +
              formMode +
              mutation?.data?.length
            }
            loading={mutation.isLoading}
            finalMetaData={
              formMode === "edit"
                ? DynamicFormConfigGridMetaDataEdit
                : formMode === "add"
                ? DynamicFormConfigGridMetaDataAdd
                : DynamicFormConfigGridMetaDataView
            }
            // finalMetaData={
            //   formMode === "view"
            //     ? DynamicFormConfigGridMetaDataView
            //     : (DynamicFormConfigGridMetaDataEdit as GridMetaDataType)
            // }

            data={girdData}
            setData={setGridData}
            actions={[]}
            setAction={[]}
            // refetchData={() => refetch()}
            onClickActionEvent={(index, id, data) => {
              mysubdtlRef.current = {
                COMP_CD: data?.COMP_CD,
                BRANCH_CD: data?.BRANCH_CD,
                DOC_CD: data?.DOC_CD,
                LINE_ID: data?.LINE_ID,
                COMPONENT_TYPE: data?.COMPONENT_TYPE.trim(),
                FIELD_NAME: data?.FIELD_NAME,
                SR_CD: data?.SR_CD,
              };
              if (data?.COMPONENT_TYPE === "hidden") {
                setFieldComponentGrid(false);
              } else {
                setFieldComponentGrid(true);
              }
            }}
            ref={myGridRef}
          />

          {isOpenSave ? (
            <PopupMessageAPIWrapper
              MessageTitle="Confirmation"
              Message="Do you want to save this Request?"
              onActionYes={(rowVal) => onPopupYes(rowVal)}
              onActionNo={() => onActionCancel()}
              rows={isErrorFuncRef.current?.data}
              open={isOpenSave}
              loading={result.isLoading}
            />
          ) : null}
          {isFieldComponentGrid ? (
            <PropsConfigForm
              isOpen={isFieldComponentGrid}
              onClose={() => {
                setFieldComponentGrid(false);
              }}
              reqDataRef={mysubdtlRef}
              formView={formMode}
            />
          ) : null}
        </>
      )}
    </>
  );
};

export const DynamicFormMetadataWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
}) => {
  const { state: data }: any = useLocation();

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
        },
      }}
      maxWidth="lg"
    >
      <DynamicFormMetadataConfig
        isDataChangedRef={isDataChangedRef}
        closeDialog={closeDialog}
        defaultView={defaultView}
        fieldRowData={data}
      />
    </Dialog>
  );
};
