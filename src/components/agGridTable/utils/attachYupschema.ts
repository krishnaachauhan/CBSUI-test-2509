import * as yup from "yup";
const validationConfig = {
  abortEarly: false,
  strict: false,
};

interface GridYupSchemaMetaDataType {
  type: "string" | "number" | "boolean" | "date";
  rules?: YupRulesType[];
}

interface YupRulesType {
  name: string;
  params: any[];
}

export const parseYupSchemaAndAttachMethod = (
  schemaValidation?: GridYupSchemaMetaDataType,
  node?: any,
  field?: string
) => {
  if (schemaValidation === undefined) {
    return undefined;
  }
  const { type, rules } = schemaValidation;

  //check if type exist in yup
  if (!yup[type]) {
    return undefined;
  }

  if (!Array.isArray(rules)) {
    return undefined;
  }
  //@ts-ignore
  let validator = yup[type]();

  rules.forEach((rule) => {
    const { params, name } = rule;
    if (!validator[name]) {
      return;
    }
    validator = validator[name](...params);
  });

  return attachYupValidator(validator, node, field);
};

const attachYupValidator =
  (
    validator:
      | yup.DateSchema
      | yup.NumberSchema
      | yup.StringSchema
      | yup.BooleanSchema,
    node?: any,
    field?: string
  ) =>
  async (value: number | string | boolean | Date, node, field) => {
    try {
      await validator.validate(value, validationConfig);
      const updatedErrors = (node.data.errors || []).filter(
        (err) => err.field !== field
      );

      node.setData({
        ...node.data,
        errors: updatedErrors,
      });
    } catch (e: any) {
      const existingErrors = node.data.errors || [];

      const updatedErrors = [
        ...existingErrors.filter((err) => err.field !== field),
        { field, message: e.message, touched: true },
      ];

      node.setData({
        ...node.data,
        errors: updatedErrors,
      });
      if (e instanceof yup.ValidationError) {
        // const updatedErrors = [
        //   ...existingErrors.filter((err) => err.field !== field),
        //   { field, message: e.errors[0] },
        // ];

        // node.setData({
        //   ...node.data,
        //   errors: updatedErrors,
        // });
        return e.errors[0];
      }
      return e.message;
    }
  };
