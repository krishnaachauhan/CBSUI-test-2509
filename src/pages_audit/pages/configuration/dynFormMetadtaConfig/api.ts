import { AuthSDK } from "registry/fns/auth";
import { DefaultErrorObject } from "@acuteinfo/common-base";

export const getSourceListData = async (_, __, dependent) => {
  if (dependent["propsDetails.PROPS_ID"]?.value === "options") {
    const { data, status, message, messageDetails } =
      await AuthSDK.internalFetcher("GETDROPDOWNCONFIG", {});
    if (status === "0") {
      let responseData = data;
      if (Array.isArray(responseData)) {
        responseData = responseData.map(
          ({ DDLB_NAME, SOURCE_TYPE, DDW_OPTION, SOURCE_NAME, ...others }) => {
            if (SOURCE_TYPE === "DO") {
              // If SOURCE_TYPE is "DO", use DDW_OPTION
              const options = JSON.parse(DDW_OPTION);
              return {
                value: DDW_OPTION,
                label: DDLB_NAME + " - " + SOURCE_TYPE,
                SOURCE_TYPE: SOURCE_TYPE,
                ...others,
              };
            } else if (SOURCE_TYPE === "DS" || SOURCE_TYPE === "RF") {
              // If SOURCE_TYPE is "DS || RF", use SOURCE_NAME
              return {
                value: SOURCE_NAME,
                label: DDLB_NAME + " - " + SOURCE_TYPE,
                SOURCE_TYPE: SOURCE_TYPE,
                ...others,
              };
            }
          }
        );
      }

      return responseData;
    } else {
      throw DefaultErrorObject(message, messageDetails);
    }
  } else if (dependent["propsDetails.PROPS_ID"]?.value === "schemaValidation") {
    return [
      {
        value: "required",
        label: "required",
      },
      {
        value: "typeError",
        label: "typeError",
      },
      {
        value: "email",
        label: "email",
      },
    ];
  } else if (dependent["propsDetails.PROPS_ID"]?.value === "__EDIT__") {
    return [
      {
        value: "isVisible",
        label: "isVisible",
      },
      {
        value: "isReadOnly",
        label: "isReadOnly",
      },
      {
        value: "isFieldFocused",
        label: "isFieldFocused",
      },
    ];
  }
  return [];
};

// export const getSouceListData = async (_, __, dependent) => {
//   if (dependent["propsDetails.PROPS_ID"]?.value === "options") {
//     const { data, status, message, messageDetails } =
//       await AuthSDK.internalFetcher("GETDROPDOWNCONFIG", {});
//     if (status === "0") {
//       let responseData = data;
//       if (Array.isArray(responseData)) {
//         responseData = responseData.map(
//           ({ DDLB_NAME, SOURCE_TYPE, ...others }) => {
//             return {
//               value: SOURCE_TYPE,
//               label: DDLB_NAME + " - " + SOURCE_TYPE,
//               ...others,
//             };
//           }
//         );
//       }

//       return responseData;
//     } else {
//       throw DefaultErrorObject(message, messageDetails);
//     }
//   }

// else if (dependent["propsDetails.PROPS_ID"]?.value === "schemaValidation") {
//   return [
//     {
//       value: "string",
//       label: "string",
//     },
//     {
//       value: "number",
//       label: "number",
//     },
//     {
//       value: "boolean",
//       label: "boolean",
//     },
//     {
//       value: "date",
//       label: "date",
//     },
//   ];
// }
//   return [];
// };

export const getDynmetaListData = async ({ COMP_CD, BRANCH_CD }) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORMMETALIST", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
    });
  if (status === "0") {
    let responseData = data;
    if (Array.isArray(responseData)) {
      responseData = responseData.map(({ DOC_CD, ...other }) => {
        return {
          value: DOC_CD,
          label: DOC_CD,
          ...other,
        };
      });
    }
    return responseData;
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynMetadataGridConfigData = async ({
  COMP_CD,
  BRANCH_CD,
  DOC_CD,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTBGFROMCONFIGDATA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      DOC_CD: DOC_CD,
    });
  if (status === "0") {
    // return data;
    return data.map((item) => {
      return {
        ...item,
        RESETFIELDONUNMOUNT: item.RESETFIELDONUNMOUNT === "Y" ? true : false,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynFieldListData = async ({
  COMP_CD,
  BRANCH_CD,
  docCD,
  srcd,
}) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTBGFROMFIELDDATA", {
      COMP_CD: COMP_CD,
      BRANCH_CD: BRANCH_CD,
      DOC_CD: docCD + "",
      SR_CD: srcd + "",
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getDynFormPopulateData = async (inputdata) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETTBGFROMFIELDPOPULATE", {
      DOC_CD: inputdata?.DOC_CD.trim(),
      COMP_CD: inputdata?.COMP_CD,
      BRANCH_CD: inputdata?.BRANCH_CD,
    });
  if (status === "0") {
    return data;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const getFormFieldPropsData = async (reqdata) => {
  const { data, status, message, messageDetails } =
    await AuthSDK.internalFetcher("GETFORMFIELDPROPS", reqdata);
  if (status === "0") {
    // return data;
    return data.map((item) => {
      return {
        ...item,
        OPTION_VALUE: item?.PROPS_VALUE,
        DISABLE_CATCHING: item?.PROPS_VALUE === "Y" ? true : false,
        FULLWIDTH: item?.PROPS_VALUE === "Y" ? true : false,
        DEPENDENTFIELD_VALUE: item?.PROPS_VALUE?.split(","),
        _isNewRow: item["NEWROW_STATUS"] === "N" ? false : true,
      };
    });
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const dynamiFormMetadataConfigDML = async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOFORMCONFIGDATA",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
export const dynamiPropsConfigDML = async (formData: any) => {
  const { status, message, messageDetails } = await AuthSDK.internalFetcher(
    "DOFORMPROPDATA",
    formData
  );
  if (status === "0") {
    return message;
  } else {
    throw DefaultErrorObject(message, messageDetails);
  }
};
