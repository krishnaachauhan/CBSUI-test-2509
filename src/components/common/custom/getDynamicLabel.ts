import { utilFunction } from "@acuteinfo/common-base";

const getDynamicLabel = (path: string, data: any, setScreenCode: boolean) => {
  const relativePath = path.replace("/EnfinityCore/", "");
  let cleanedPath;

  if (relativePath.includes("/")) {
    cleanedPath = relativePath.split("/").slice(0, 2).join("/");
  } else {
    cleanedPath = relativePath;
  }
  let screenList = utilFunction.GetAllChieldMenuData(data, true);
  const matchingPath = screenList.find((item) => item.href === cleanedPath);

  if (matchingPath) {
    return setScreenCode
      ? `${matchingPath.label} (${matchingPath.user_code.trim()})`
      : `${matchingPath.label}`;
  }

  return "";
};
export default getDynamicLabel;
