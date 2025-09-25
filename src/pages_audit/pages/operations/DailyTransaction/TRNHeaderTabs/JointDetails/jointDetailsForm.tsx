import {
  FormWrapper,
  GradientButton,
  MetaDataType,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { FC, useMemo, useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { joint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/jointTabMetadata";
import { nomineejoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/nomineeJointMetadata";
import { guarantorjoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/guarantorJointMetadataa";
import { collateraljoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/collateralJointMetadata";
import { guardianjoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/guardianlJointMetadata";
import { signatoryjoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/signatoryJointMetadata";
import { introductorjoint_tab_metadata } from "pages_audit/pages/operations/acct-mst/tabMetadata/introductorJointMetadata";
import { t } from "i18next";

export const JointDetailsForm: FC<{
  isOpen: boolean;
  reqData: any;
  index?: any;
  data: any;
  closeDialog?: any;
}> = ({ isOpen, reqData, index, data, closeDialog }) => {
  const [currentIndex, setCurrentIndex] = useState(index); // Index for navigation
  // Dynamically set the form label using account details
  const metaData: any = useMemo(() => {
    let baseMetaData;

    switch (data?.[currentIndex]?.J_TYPE) {
      case "J":
        baseMetaData = joint_tab_metadata;
        break;
      case "N":
        baseMetaData = nomineejoint_tab_metadata;
        break;
      case "G":
        baseMetaData = guarantorjoint_tab_metadata;
        break;
      case "M":
        baseMetaData = collateraljoint_tab_metadata;
        break;
      case "U":
        baseMetaData = guardianjoint_tab_metadata;
        break;
      case "S":
        baseMetaData = signatoryjoint_tab_metadata;
        break;
      case "I":
        baseMetaData = introductorjoint_tab_metadata;
        break;
      default:
        baseMetaData = joint_tab_metadata;
    }

    return {
      ...baseMetaData,
      fields: baseMetaData?.fields.map((field) =>
        field?.render?.componentType === "arrayField"
          ? {
              ...field,
              isDisplayCount: false,
              fixedRows: true,
            }
          : field
      ),
    };
  }, [data, currentIndex]);

  const initialValue = useMemo(() => {
    switch (data?.[currentIndex]?.J_TYPE) {
      case "J":
        return { JOINT_HOLDER_DTL: [data?.[currentIndex]] };
      case "N":
        return { JOINT_NOMINEE_DTL: [data?.[currentIndex]] };
      case "G":
        return { JOINT_GUARANTOR_DTL: [data?.[currentIndex]] };
      case "M":
        return { JOINT_HYPOTHICATION_DTL: [data?.[currentIndex]] };
      case "U":
        return { JOINT_GUARDIAN_DTL: [data?.[currentIndex]] };
      case "S":
        return { JOINT_SIGNATORY_DTL: [data?.[currentIndex]] };
      case "I":
        return { JOINT_INTRODUCTOR_DTL: [data?.[currentIndex]] };
      default:
        return { JOINT_HOLDER_DTL: [data?.[currentIndex]] };
    }
  }, [data, currentIndex]);

  const jointType = useMemo(() => {
    const findJointDisc = (initialValue) => {
      for (const value of Object.values(initialValue || {})) {
        if (Array?.isArray(value) && value?.length > 0) {
          return value?.[0]?.JOINT_DISC || "";
        }
      }
      return "";
    };
    return findJointDisc(initialValue);
  }, [data, currentIndex]);

  if (metaData?.form) {
    // @ts-ignore
    metaData.form.label = `Joint Full view For Account :
          ${reqData?.COMP_CD?.trim() ?? ""}${reqData?.BRANCH_CD?.trim() ?? ""}${
      reqData?.ACCT_TYPE?.trim() ?? ""
    }${reqData?.ACCT_CD?.trim() ?? ""} - ${reqData?.ACCT_NM?.trim() ?? ""}
            | Type* : ${jointType} | Row ${currentIndex + 1} of ${
      data?.length
    } `;
  } else {
    return null;
  }

  const changeIndex = (direction) => {
    setCurrentIndex((prevIndex) => {
      const nextIndex =
        direction === "next"
          ? (prevIndex + 1) % data?.length
          : (prevIndex - 1 + data?.length) % data?.length;
      return nextIndex;
    });
  };

  return (
    <Dialog
      open={isOpen}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          closeDialog();
        } else if (event.key === "ArrowUp") {
          // same as "Prev"
          if (currentIndex > 0) changeIndex("previous");
        } else if (event.key === "ArrowDown") {
          // same as "Next"
          if (currentIndex < data?.length - 1) changeIndex("next");
        }
      }}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      maxWidth="lg"
      scroll="body"
    >
      <FormWrapper
        key={`JointDetailDisplayForm_${data?.[currentIndex]}_${metaData?.form?.label}`}
        metaData={metaData as MetaDataType}
        initialValues={initialValue}
        onSubmitHandler={() => {}}
        displayMode={"view"}
        formState={{ formMode: "view" }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              startIcon={<ArrowBackIosNewIcon />}
              disabled={1 === currentIndex + 1}
              onClick={() => changeIndex("previous")}
              color={"primary"}
            >
              {t("Prev")}
            </GradientButton>
            <GradientButton
              endIcon={<ArrowForwardIosIcon />}
              disabled={currentIndex + 1 === data.length}
              onClick={() => changeIndex("next")}
              color={"primary"}
            >
              {t("Next")}
            </GradientButton>
            <GradientButton onClick={closeDialog} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};
