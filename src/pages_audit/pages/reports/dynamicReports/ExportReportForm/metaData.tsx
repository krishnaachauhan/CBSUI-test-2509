// if using MasterDetailsForm

import { MetaDataType } from "@acuteinfo/common-base";

// export const exportReportFormMetaData = {
//   masterForm: {
//     form: {
//       name: "exportReportForm",
//       label: "Export Report form",
//       resetFieldOnUnmount: false,
//       validationRun: "all",
//       render: {
//         ordering: "auto",
//         renderType: "simple",

//         gridConfig: {
//           item: {
//             xs: 12,
//             sm: 4,
//             md: 4
//           },
//           container: {
//             direction: "row",
//             spacing: 0.5
//           }
//         }
//       },
//     },
//     fields: [
//       {
//         render: { componentType: "select" },
//         name: "export_type",
//         label: "Choose file type",
//         required: true,
//         GridProps: { xs: 12, md: 6, sm: 6 },
//         fullWidth: true,
//         defaultValue: "Excel",
//         options: [
//           { label: "Excel (.xlsx)", value: "Excel" },
//           { label: "Pdf (.pdf)", value: "Pdf" },
//         ],
//         schemaValidation: {
//           type: "string",
//           rules: [{ name: "required", params: ["This field is required."] }],
//         },
//         runExternalFunction: true,
//       },
//       {
//         render: { componentType: "checkbox" },
//         name: "include",
//         label: "Include Header",
//         GridProps: { xs: 12, md: 6, sm: 6 },
//         fullWidth: true,
//         defaultValue: true,
//       }
//     ]
//   },
//   detailsGrid: {
//     gridConfig: {
//       dense: true,
//       gridLabel: "Export report",
//       rowIdColumn: "SRNO",
//       defaultColumnConfig: { width: 150, maxWidth: 250, minWidth: 100 },
//       allowColumnReordering: true,
//       hideHeader: true,
//       disableGroupBy: true,
//       enablePagination: true,
//       containerHeight: { min: "50vh", max: "50vh" },
//       allowRowSelection: true,
//       hiddenFlag: "_hidden",
//       disableLoader: true,
//       hideFooter: true,
//       defaultPageSize: 20,
//     },
//     columns: [
//       {
//         accessor: "SRNO",
//         columnName: "Sr.No.",
//         sequence: 1,
//         alignment: "left",
//         width: 120,
//         minWidth: 100,
//         maxWidth: 1000
//       },
//       {
//         accessor: "C_NAME",
//         columnName: "Columns Name",
//         sequence: 2,
//         alignment: "left",
//         width: 300,
//         minWidth: 150,
//         maxWidth: 1000
//       }
//     ]
//   }
// }

// if using FormWrapper

export const exportReportFormMetaData: MetaDataType = {
  form: {
    name: "exportReportForm",
    label: "ExportReportform",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 4,
          md: 4,
        },
        container: {
          direction: "row",
          spacing: 0.5,
        },
      },
    },
    componentProps: {
      textField: {
        fullWidth: true,
      },
      select: {
        fullWidth: true,
      },
      datePicker: {
        fullWidth: true,
      },
      numberFormat: {
        fullWidth: true,
      },
      inputMask: {
        fullWidth: true,
      },
      datetimePicker: {
        fullWidth: true,
      },
    },
  },
  fields: [
    {
      render: {
        componentType: "select",
      },
      name: "export_type",
      label: "Selectfiletype",
      required: true,
      defaultValue: "EXCEL",
      defaultOptionLabel: "Select file tye",
      options: [
        { label: "EXCEL (.xlsx)", value: "EXCEL" },
        { label: "CSV (.csv)", value: "CSV" },
        { label: "PDF (.pdf)", value: "PDF" },
        { label: "PLAIN TEXT (.txt)", value: "TEXT" },
        { label: "XML (.xml)", value: "XML" },
        { label: "HTML (.html)", value: "HTML" },
      ],
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["ThisFieldisrequired"] }],
      },
      //@ts-ignore
      isFieldFocused: true,
      GridProps: {
        xs: 6,
        md: 3,
        sm: 3,
      },
      // __EDIT__: { isReadOnly: true },
      // __NEW__: { isReadOnly: false, isFieldFocused: true },
    },
    {
      render: {
        componentType: "select",
      },
      name: "page_size",
      label: "Selectpagesize",
      defaultValue: "a4",
      defaultOptionLabel: "Select page size",
      dependentFields: ["export_type"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.export_type?.value === "PDF") {
          return false;
        }
        return true;
      },
      options: [
        { label: "A3", value: "a3" },
        { label: "A4", value: "a4" },
        { label: "A5", value: "a5" },
        { label: "A6", value: "a6" },
        { label: "Letter", value: "letter" },
        { label: "Legal", value: "legal" },
      ],
      GridProps: {
        xs: 6,
        md: 3,
        sm: 3,
      },
    },
    {
      render: {
        componentType: "select",
      },
      name: "orientation",
      label: "Selectorientation",
      defaultValue: "portrait",
      defaultOptionLabel: "Select orientation",
      dependentFields: ["export_type"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (dependentFieldsValues?.export_type?.value === "PDF") {
          return false;
        }
        return true;
      },
      options: [
        { label: "Portrait", value: "portrait" },
        { label: "Landscape", value: "landscape" },
      ],
      GridProps: {
        xs: 6,
        md: 3,
        sm: 3,
      },
    },
    {
      render: {
        componentType: "checkbox",
      },
      name: "show_header",
      label: "ShowHeader",
      defaultValue: true,
      GridProps: { xs: 6, md: 3, sm: 3 },
      fullWidth: true,
      dependentFields: ["export_type"],
      shouldExclude: (_, dependentFieldsValues, __) => {
        if (
          dependentFieldsValues?.export_type?.value !== "XML" &&
          dependentFieldsValues?.export_type?.value !== "TEXT" &&
          dependentFieldsValues?.export_type?.value !== "CSV"
        ) {
          return false;
        }
        return true;
      },
    },
  ],
};
