import { GridYupSchemaMetaDataType } from "@acuteinfo/common-base";
import { ColDef, ICellEditorParams } from "ag-grid-community";

export interface AgGridMetaData extends Partial<ColDef> {
  accessor?: string;
  columnName?: string;
  componentType?: ColDef["cellEditor"];
  displayComponentType?: ColDef["cellRenderer"];
  FormatProps?: Record<string, any>;
  className?: string;
  headerTooltip?: string;
  shouldExclude?: (params: any) => boolean;
  postValidationSetCrossAccessorValues?: any;
  isVisible?: boolean;
  isReadOnly?: boolean | ((params: any) => boolean);
  options?: any;
  alignment?: "left" | "center" | "right";
  schemaValidation?: GridYupSchemaMetaDataType;
  validate?: (params: ICellEditorParams) => string;
  name?: string;

  // View mode metadata
  __EDIT__?: { isReadOnly?: boolean | ((params: any) => boolean) };
  __VIEW__?: { isReadOnly?: boolean | ((params: any) => boolean) };
  __NEW__?: { isReadOnly?: boolean | ((params: any) => boolean) };
}
