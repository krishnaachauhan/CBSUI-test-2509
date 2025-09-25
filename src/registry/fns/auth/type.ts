export interface DOCCRUDTYPE {
  moduleType: string;
  productType?: string;
  docCategory?: string;
  categoryCD?: string;
  refID: string;
  serialNo?: string;
}

export interface crudType {
  moduleType: string;
  productType: string;
  refID: string;
}

export interface ExternalDOCCRUDTYPE {
  productType?: string;
  docCategory?: string;
  categoryCD?: string;
  refID: string;
  serialNo?: string;
  token?: string;
  uploadFor?: any;
  entityType?: any;
}
