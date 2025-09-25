import {
  ClearCacheProvider,
  extractMetaData,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";

import { lockerTrnsViewFormMetadata } from "./formMetaData";

const LockerTrnsForm = ({ data }) => {
  return (
    <FormWrapper
      key={"lockerTrnsViewForm" + data}
      metaData={
        extractMetaData(lockerTrnsViewFormMetadata, "view") as MetaDataType
      }
      initialValues={data ? data[0] : {}}
      hideHeader={true}
      displayMode={"view"}
      onSubmitHandler={() => {}}
      formStyle={{
        background: "white",
        height: "60%",
      }}
    ></FormWrapper>
  );
};
export const LockerTrnsFormView = ({ data }) => {
  return (
    <ClearCacheProvider>
      <LockerTrnsForm data={data} />
    </ClearCacheProvider>
  );
};
