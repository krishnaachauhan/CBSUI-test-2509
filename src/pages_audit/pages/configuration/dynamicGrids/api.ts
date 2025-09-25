import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject, filters } from "@acuteinfo/common-base";
export const getDynamicGridMetaData = async ({ docID, COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher(
      `/commonMasterServiceAPI/GETDYNAMICGRIDMETADATA/${docID}`,
      { COMP_CD: COMP_CD, BRANCH_CD: BRANCH_CD }
    );
  // await AuthSDK.internalFetcher("GETDYNAMICGRIDMETADATA", {
  //   DOC_CD: docID,
  //   COMP_CD: COMP_CD,
  //   BRANCH_CD: BRANCH_CD,
  // });

  if (status === "0") {
    const columns = data[0]?.COLUMNS?.map((one) => {
      return {
        columnName: one.COLUMN_NAME,
        accessor: one.COLUMN_ACCESSOR,
        componentType: one.COMPONENT_TYPE,
        alignment: one.ALIGNMENT,
        sequence: one.SEQ_NO,
        width: one.COLUMN_WIDTH,
        minWidth: 100,
        maxWidth: 200,
        isVisible: one?.IS_VISIBLE === "Y" ? true : false,
      };
    });

    let result = {
      DOC_CD: data[0].DOC_CD,
      USER_ACC_INS: data[0].USER_ACC_INS,
      USER_ACC_UPD: data[0].USER_ACC_UPD,
      USER_ACC_DEL: data[0].USER_ACC_DEL,

      gridConfig: {
        dense: data[0].DENSE,
        gridLabel: data[0].DESCRIPTION,
        rowIdColumn: data[0].ROWID_COLUMN,
        defaultColumnConfig: {
          width: 400,
          maxWidth: 450,
          minWidth: 300,
        },
        allowColumnReordering: data[0].ALLOW_COLUMN_REORDERING,
        disableGroupBy: data[0].DISABLE_GROUP_BY,
        enablePagination: data[0].ENABLE_PAGINATION,
        pageSizes: [data[0].PAGE_SIZES],
        defaultPageSize: data[0].DEFAULT_PAGE_SIZE,
        containerHeight: {
          min: "67vh",
          max: "67vh",
        },
        allowRowSelection: data[0].ALLOW_ROW_SELECTION,
        isCusrsorFocused: data[0].IS_CUSRSORFOCUSED,
      },
      filters: [],
      columns: columns,
      // fields: filter,
    };
    console.log("result", result);
    return result;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};

export const getDynGridData = async ({
  doccd,
  companyID,
  branchID,
  userRole,
  userName,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETDYNAMICGRIDDATA", {
      DOC_CD: doccd,
      COMP_CD: companyID,
      BRANCH_CD: branchID,
      USERROLE: userRole,
      USERNAME: userName,
    });
  if (status === "0") {
    return data.map((item) => {
      return Object.assign(
        {},
        ...Object.keys(item).map((key) => ({
          [key]:
            item[key] === "Y" ? true : item[key] === "N" ? false : item[key],
        }))
      );
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynActionButtonData = async ({
  DOC_CD,
  COMP_CD,
  BRANCH_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETGRIDACTIONLST", {
      DOC_CD: DOC_CD,
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    const result = data.map((item) => {
      return {
        actionLabel: item?.ACTIONLABEL,
        actionName: item?.ACTIONNAME,
        multiple: item?.MULTIPLE === "Y" ? true : false,
        actionIcon: item?.ACTIONICON,
        tooltip: item?.TOOLTIP,
        rowDoubleClick: item?.ROWDOUBLECLICK === "Y" ? true : false,
        alwaysAvailable: item?.ALWAYSAVAILABLE === "Y" ? true : false,
        shouldExclude: item?.SHOULDEXCLUDE,
        isNodataThenShow: item?.ISNODATATHENSHOW === "Y" ? true : false,
        onEnterSubmit: item?.ONENTERSUBMIT === "Y" ? true : false,
        startsIcon: item?.ICON_TYPE,
        endsIcon: item?.ACTIONNAME,
        rotateIcon: item?.ACTIONNAME,
        COMP_CD: item?.COMP_CD,
        DOC_CD: item?.DOC_CD,
        FORM_METADATA_SR_CD: item?.FORM_METADATA_SR_CD,
        BRANCH_CD: item?.BRANCH_CD,
        SR_CD: item?.SR_CD,
        ALRT_MSG: item?.ALRT_MSG,
      };
    });
    return result;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynamicFormData = () => async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "FORMDML",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
