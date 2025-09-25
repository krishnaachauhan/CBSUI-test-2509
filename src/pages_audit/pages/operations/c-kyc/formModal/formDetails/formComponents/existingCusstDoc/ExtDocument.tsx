import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as API from "../../../../api";
import { AuthContext } from "pages_audit/auth";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import { useMutation, useQuery } from "react-query";
import { DocumentGridMetadata } from "./documentGridMetadata";
import { useLocation, useNavigate } from "react-router-dom";
import ExtDocumentForm from "./ExtDocumentForm";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { t } from "i18next";
import {
  utilFunction,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import _ from "lodash";
const ExtDocument = ({
  // isCustomerData,
  // setIsCustomerData,
  // isLoading,
  // setIsLoading,
  open,
  onClose,
  viewMode,
  // from,
}) => {
  const { authState } = useContext(AuthContext);
  const {
    state,
    handleColTabChangectx,
    handleStepStatusctx,
    handleFormDataonSavectx,
    handleModifiedColsctx,
    handleFormDataonRetrievectx,
    handleFormModalClosectx,
  } = useContext(CkycContext);
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [data, setData] = useState<any>([]);
  const dataRef = useRef<any>([]);
  const [formMode, setFormMode] = useState<any>("");
  const [isNextLoading, setIsNextLoading] = useState(false);
  const isDataChangedRef = useRef(false);
  const handleDialogClose = () => {
    if (isDataChangedRef.current === true) {
      // isDataChangedRef.current = true;
      // refetch();
      isDataChangedRef.current = false;
    }
    navigate(".");
  };
  const location: any = useLocation();
  const myGridRef = useRef<any>(null);
  let oldGridData: any = [];

  // useEffect(() => {
  //   console.log('rowsData change', rowsData)
  // }, [rowsData])

  const initValues = useMemo(() => {
    return state?.isFreshEntryctx
      ? state?.formDatactx["DOC_MST"]
        ? state?.formDatactx["DOC_MST"]
        : []
      : state?.retrieveFormDataApiRes
      ? state?.retrieveFormDataApiRes["DOC_MST"]
      : [];
  }, [state?.isFreshEntryctx, state?.retrieveFormDataApiRes]);
  useEffect(() => {
    setData(initValues);
  }, [initValues]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const mutation: any = useMutation(API.getKYCDocumentGridData, {
    onSuccess: (data) => {
      setData(data);
    },
    onError: (error: any) => {},
  });

  useEffect(() => {
    // console.log(state?.formDatactx["DOC_MST"], "wadqwdwq. doc", state?.retrieveFormDataApiRes["DOC_MST"])
    if (
      state?.isFreshEntryctx &&
      !(
        Boolean(state?.formDatactx["DOC_MST"]) ||
        Boolean(state?.retrieveFormDataApiRes["DOC_MST"])
      )
    ) {
      let payload = {
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        CUST_TYPE: state?.entityTypectx,
        CONSTITUTION_TYPE: state?.constitutionValuectx ?? "",
      };
      mutation.mutate(payload);
    }
  }, []);

  const afterFormSubmit = (formData, submitFormMode) => {
    // console.log(formData, "wadqwdwq. doc afterFormSubmit", submitFormMode)
    if (submitFormMode === "new") {
      setData((old) => {
        // console.log(formData, "wadqwdwq. doc afterFormSubmit new",old)
        if (!Array.isArray(old)) {
          return [
            {
              ...formData,
              SR_CD: 1,
              IsNewRow: true,
            },
          ];
        } else {
          let srCount = utilFunction.GetMaxCdForDetails(old, "SR_CD");
          const myNewRowObj = {
            ...formData,
            SR_CD: String(srCount),
            // _isNewRow: true,
            IsNewRow: true,
          };
          return [...old, myNewRowObj];
        }
      });
    } else {
      setData((old) => {
        // console.log(formData, "wadqwdwq. doc afterFormSubmit old",old)
        return old.map((item) => {
          if (item.SR_CD === formData.SR_CD) {
            let { SR_CD, ...other } = formData;
            return { ...item, ...other };
          } else {
            return item;
          }
        });
      });
    }

    setOpenForm(false);
  };

  const actions = [
    {
      actionName: "view-details",
      actionLabel: "ViewDtl",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "update",
      actionLabel: "Update",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    // {
    //   actionName: "delete",
    //   actionLabel: "Delete",
    //   multiple: false,
    //   rowDoubleClick: false,
    // },
    {
      actionName: "add",
      actionLabel: "Add",
      multiple: undefined,
      rowDoubleClick: true,
      alwaysAvailable: true,
    },
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: true,
      alwaysAvailable: true,
    },
  ];

  const setCurrentAction = useCallback(
    (data) => {
      if (data.name === "add") {
        setOpenForm(true);
        setFormMode("new");
        setRowsData(data?.rows);
      } else if (data.name === "delete") {
        setOpenForm(true);
        // setComponentToShow("Delete")
        setRowsData(data?.rows);
      } else if (data.name === "view-details") {
        // setComponentToShow("view-details")
        setFormMode("edit");
        setRowsData(data?.rows);
        setOpenForm(true);
      } else if (data.name === "update") {
        onUpdate();
      } else if (data.name === "close") {
        handleFormModalClosectx();
        onClose();
      }
      // navigate(data?.name, {
      //   state: data?.rows,
      // });
    },
    [navigate]
  );

  const ActionBTNs = React.useMemo(() => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            // handlePhotoOrSignctx(null, null, "photo")
            // handlePhotoOrSignctx(null, null, "sign")
            onClose();
          }}
        >
          Close
        </Button>
      </React.Fragment>
    );
  }, []);

  const onUpdate = () => {
    setIsNextLoading(true);
    const data = dataRef.current;
    // console.log("kdawiudiqwdqwd", data)
    if (data) {
      let updated_tab_format: any = {};
      let other_data = {
        IsNewRow: !state?.req_cd_ctx ? true : false,
        // REQ_CD: state?.req_cd_ctx ?? "",
        // COMP_CD: COMP_CD ?? "",
      };
      let filteredKeys: any[] = [
        "VALID_UPTO",
        "DOC_IMAGE",
        "SUBMIT",
        "TEMPLATE_CD",
        "DOC_NO",
        "DOC_DESCRIPTION",
        "SR_CD",
        "TRAN_CD",
      ];
      let oldRow: any[] = [];
      let newRow: any[] = [];
      let upd;

      // console.log(oldRow, "sahdoihqaodiqwdq0", newRow, oldGridData)

      oldRow =
        oldGridData &&
        oldGridData.length > 0 &&
        oldGridData.map((formRow, i) => {
          // console.log("sahdoihqaodiqwdq oldin formRow", formRow)
          // let filteredRow = _.pick(formRow ?? {}, state?.modifiedFormCols["DOC_MST"] ?? [])
          let filteredRow = _.pick(formRow ?? {}, filteredKeys);
          // console.log("sahdoihqaodiqwdq oldin filteredRow", filteredRow)
          // if("DOC_MST" == "DOC_MST") {
          filteredRow["SUBMIT"] = Boolean(filteredRow.SUBMIT) ? "Y" : "N";
          // filteredRow = filteredRow.map(doc => ({...doc, SUBMIT: Boolean(doc.SUBMIT) ? "Y" : "N"}))
          // }
          // console.log("sahdoihqaodiqwdq oldin filteredRow --after", filteredRow)
          return filteredRow;
        });

      // console.log(oldRow, "sahdoihqaodiqwdq1", newRow)

      // newRow = (state?.formDatactx["DOC_MST"] && state?.formDatactx["DOC_MST"].length>0) && state?.formDatactx["DOC_MST"].map((formRow, i) => {
      //   let filteredRow = _.pick(formRow ?? {}, filteredKeys)
      //   return filteredRow;
      // })
      newRow =
        data &&
        data.length > 0 &&
        data.map((formRow, i) => {
          let filteredRow = _.pick(formRow ?? {}, filteredKeys);
          filteredRow["SUBMIT"] = Boolean(filteredRow.SUBMIT) ? "Y" : "N";
          return filteredRow;
        });
      // console.log(oldRow, "sahdoihqaodiqwdq2", newRow)

      upd = utilFunction.transformDetailDataForDML(oldRow ?? [], newRow ?? [], [
        "SR_CD",
      ]);
      // console.log("sahdoihqaodiqwdq3", upd)
      // not getting doc_image, doc_description in old data after comparison
      // updated_tab_format["DOC_MST"] = [{
      //   ...updated_tab_format.TAB,
      //   ...upd,
      //   ...(_.pick(data, upd._UPDATEDCOLUMNS)),
      //   ...other_data
      // }]
      // console.log("sahdoihqaodiqwdq", updated_tab_format)
    }

    // let newData = state?.formDatactx
  };

  const retrieveData: any = useMutation(API.getCustomerDetailsonEdit, {
    onSuccess: (data) => {
      if (Array.isArray(data) && data.length > 0) {
        // console.log("wefduhweiufhwef", data);
        oldGridData = data[0]?.DOC_MST ?? [];
        handleFormDataonRetrievectx(data[0]);
      }
    },
    onError: (error: any) => {},
  });

  useEffect(() => {
    let payload = {
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      REQUEST_CD: location.state?.[0]?.data.REQUEST_ID ?? "",
      CUSTOMER_ID: location.state?.[0]?.data.CUSTOMER_ID ?? "",
      SCREEN_REF: "MST/707",
    };
    retrieveData.mutate(payload);
  }, []);

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
      {/* <DialogContent sx={{ px: "0" }}> */}
      <Grid
        container
        // style={{
        //   position: "absolute",
        //   paddingRight: !state?.isFreshEntryctx ? "113px" : "12px",
        // }}
      >
        <GridWrapper
          key={`operatorMasterGrid` + data + setData}
          finalMetaData={DocumentGridMetadata as GridMetaDataType}
          data={data ?? []}
          setData={setData}
          loading={mutation.isLoading}
          actions={actions}
          setAction={setCurrentAction}
          // refetchData={() => refetch()}
          ref={myGridRef}
          onClickActionEvent={(index, id, currentData) => {
            // console.log(data, "qjwkdjbiqwudqd", index, id, currentData)
            let newData: any[] = [];
            newData =
              data.length > 0 &&
              data.filter((row) => row.SR_CD !== currentData.SR_CD);
            setData([...newData]);
          }}
        />

        {/* <Grid container item sx={{ justifyContent: "flex-end" }}>
            <Button
              sx={{ mr: 2, mb: 2 }}
              color="secondary"
              variant="contained"
              disabled={isNextLoading}
              onClick={(e) => {
                // handleColTabChangectx(1)
                handleColTabChangectx(state?.colTabValuectx - 1);
              }}
            >
              {t("Previous")}
            </Button>
            {SaveUpdateBTNs}
          </Grid> */}

        {openForm ? (
          <ExtDocumentForm
            isDataChangedRef={isDataChangedRef}
            ClosedEventCall={handleDialogClose}
            formMode={formMode}
            afterFormSubmit={afterFormSubmit}
            open={openForm}
            onClose={() => setOpenForm(false)}
            gridData={data}
            rowsData={rowsData}
          />
        ) : null}
      </Grid>
      {/* </DialogContent> */}
    </Dialog>
  );
};

export default ExtDocument;
