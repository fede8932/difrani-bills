export enum tipo_factura {
  "A" = 1,
  "B" = 6,
  "C" = 11,
}
export enum tipo_nc {
  "NCA" = 3,
  "NCB" = 8,
  "NCC" = 13,
}
export enum tipo_concepto {
  "productos" = 1,
  "servicios" = 2,
  "productos_servicios" = 3,
}
export enum tipo_documento {
  "dni" = 96,
  "cuil" = 86,
  "cuit" = 80,
  "final" = 99,
}

export type DataFactura = {
  CantReg: number;
  PtoVta: number;
  CbteTipo: number;
  Concepto: number;
  DocTipo: number;
  DocNro: number;
  CbteDesde: number;
  CbteHasta: number;
  CbteFch: number;
  FchServDesde: number | null;
  FchServHasta: number | null;
  FchVtoPago: number | null;
  ImpTotal: number;
  ImpTotConc: number;
  ImpNeto: number;
  ImpOpEx: number;
  ImpIVA: number;
  ImpTrib: number;
  MonId: string;
  MonCotiz: number;
  Iva?: Iva[];
};

export type DataNC = DataFactura & {
  CbtesAsoc: facAsoc[];
};

type Iva = {
  Id: number;
  BaseImp: number;
  Importe: number;
};

export interface FacturacionRequestBody {
  concepto: tipo_concepto;
  tipo_de_documento: tipo_documento;
  tipo_de_factura: tipo_factura;
  numero_de_documento: number;
  importe_gravado: number;
  numFactAsoc: number;
}

export interface NCRequestBody {
  concepto: tipo_concepto;
  tipo_de_documento: tipo_documento;
  tipo_de_factura: tipo_nc;
  numero_de_documento: number;
  importe_gravado: number;
  numFactAsoc: number;
}

export interface NotaCreditoRequestBody extends FacturacionRequestBody {
  tipo_de_nota: tipo_nc;
  num_fact_asociada: number;
}

type facAsoc = {
  Tipo: number;
  PtoVta: number;
  Nro: number;
};
