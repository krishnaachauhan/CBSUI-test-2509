import { Dialog } from "@mui/material";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActionTypes,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { RetrieveParaGridMetaData } from "./gridMetadata";
import { AsPerQueryMetaData } from "pages_audit/pages/jasperReport/commonReport/retrieveComponent/Metadata/retrieveAsPerQueryMetadata";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
import i18n from "components/multiLanguage/languagesConfiguration";

export const RetrieParaGrid = ({ myData, setMyData, refdata }) => {
  const actions: ActionTypes[] = [
    {
      actionName: "save",
      actionLabel: "Save",
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
  const [girdData, setGridData] = useState<any>(
    refdata?.current?.parameterData
  );

  const myGridRef = useRef<any>(null);
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    const params = refdata?.current?.parameterData;
    if (Array.isArray(params) && params.length) {
      const updateData = params.map((item) => {
        let updatedItem = {
          ...item,
          visibleInRetrieval: "Y",
          validationRun: "onBlur",
          type: "textField",
        };

        switch (item?.accessor) {
          case "BRANCH_CD":
            updatedItem.defaultValue = authState?.user?.branchCode;
            break;
          case "COMP_CD":
            updatedItem.defaultValue = authState?.companyID;
            break;
          case "A_FROM_DT":
          case "A_TO_DT":
            updatedItem.defaultValue = format(
              new Date(authState?.workingDate ?? new Date()),
              "dd/MMM/yyyy"
            );
            break;
          case "USERNAME":
            updatedItem.defaultValue = authState?.user?.id;
            break;
          case "SCREEN_REF":
            updatedItem.defaultValue = refdata?.current?.screenRef;
            break;
          case "DISPLAY_LANGUAGE":
            updatedItem.defaultValue = i18n.resolvedLanguage;
            break;
          default:
            break;
        }
        return updatedItem;
      });
      setGridData(updateData);
    }
  }, [authState, refdata, i18n]);

  const girdMetaData = useMemo(() => {
    if (
      Array.isArray(RetrieveParaGridMetaData?.columns) &&
      RetrieveParaGridMetaData?.columns?.length &&
      refdata.current.retrievalType !== "AS_PER_QUERY"
    ) {
      const updateColumns = RetrieveParaGridMetaData.columns.map((item) => ({
        ...item,
        isVisible:
          item?.accessor === "SR_CD" ||
          item?.accessor === "accessor" ||
          item?.accessor === "columnName" ||
          item?.accessor === "visibleInRetrieval" ||
          item?.accessor === "defaultValue",
      }));
      return { ...RetrieveParaGridMetaData, columns: updateColumns };
    }
    return RetrieveParaGridMetaData;
  }, [refdata.current.retrievalType]);

  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "close") {
      setMyData((old) => ({ ...old, isParaOpen: false }));
    } else if (data.name === "save") {
      let { hasError, data: dataold } = await myGridRef.current?.validate();

      if (hasError === true) {
        if (dataold) {
          refdata.current.parameterData = dataold;
        }
      } else {
        let result = await myGridRef?.current?.cleanData?.();
        if (!Array.isArray(result)) {
          result = [result];
        }
        let formatData = result
          ?.map((val, index) => ({
            render: { componentType: val?.type ?? "" },
            name: val?.accessor ?? "",
            label: val?.columnName ?? "",
            sequence: val?.sequence ?? index,
            defaultValue: val?.defaultValue ?? "",
            visibleInRetrieval: val?.visibleInRetrieval === "Y" ? true : false,
            placeholder: val?.placeholder ?? "",
            required: val?.required ?? false,
            isReadOnly: val?.isReadOnly ?? false,
            options: val?.options ?? [],
            dependentFields: val?.dependentFields ?? [],
            validationRun: val?.validationRun ?? "onBlur",
            shouldExclude: val?.shouldExclude ?? "",
            schemaValidation: val?.schemaValidation ?? {},
            validate: val?.validate ?? "",
            setFieldLabel: val?.setFieldLabel ?? null,
            fullWidth: true,
            GridProps: {
              xs: val?.xs ?? "",
              md: val?.md ?? "",
              sm: val?.sm ?? "",
              lg: val?.lg ?? "",
              xl: val?.xl ?? "",
            },
          }))
          .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence));

        if (refdata.current.retrievalType === "AS_PER_QUERY") {
          let newData = { ...AsPerQueryMetaData, fields: formatData };
          refdata.current.retrieveMetadata = JSON.stringify(newData, null, 2);
        }
        const defaultValue = formatData?.reduce(
          (acc, curr) => ({ ...acc, [curr.name]: curr.defaultValue }),
          {}
        );
        refdata.current.defaultParaData = defaultValue;
        setMyData((old) => ({ ...old, isParaOpen: false }));
      }
    }
  }, []);

  return (
    <Dialog
      open={myData?.isParaOpen}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        style: { width: "100%", padding: "7px" },
      }}
    >
      <GridWrapper
        key={"parameterdata"}
        finalMetaData={girdMetaData as GridMetaDataType}
        data={girdData ?? []}
        setData={setGridData}
        actions={actions}
        setAction={setCurrentAction}
        ref={myGridRef}
      />
    </Dialog>
  );
};
