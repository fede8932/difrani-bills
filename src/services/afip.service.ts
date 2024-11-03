import path from "path";
import { Afip, ICreateVoucherResult } from "afip.ts";
import * as fs from "fs";
import dotenv from "dotenv";
import {
  tipo_concepto,
  tipo_documento,
  tipo_factura,
  tipo_nc,
} from "../types/factura";
import { formatDate, formatearFecha } from "../utils/formatFecha";
import { ServiceSoap12Types } from "afip.ts/lib/soap/interfaces/Service/ServiceSoap12";
import { redondearDosDecimales } from "../utils/redondearDosDecim";
import { ResToQueBillDto } from "../dto/ResToQueBillDto";
// import * as mustache from "mustache";
dotenv.config();

class AfipService {
  afip: Afip;
  cuit: number;
  puntoDeVenta: number;
  constructor() {
    this.cuit = Number(process.env.CUIT);
    this.puntoDeVenta = Number(process.env.PUNTO_DE_VENTA);

    // Rutas de los archivos de clave privada y certificado
    const privateKeyPath = path.join(__dirname, "../../certs/key");
    const certificatePath = path.join(__dirname, "../../certs/cert");

    // Lee el contenido de los archivos
    const privateKeyContent = fs.readFileSync(privateKeyPath, "utf8");
    const certificateContent = fs.readFileSync(certificatePath, "utf8");

    // Inicializa la instancia de Afip con los contenidos de los archivos
    this.afip = new Afip({
      key: privateKeyContent,
      cert: certificateContent,
      cuit: this.cuit,
      production: process.env.NODE_ENV == "production" ? true : false,
    });
  }

  async nuevaFactura(
    concepto: tipo_concepto,
    tipo_de_documento: tipo_documento,
    tipo_factura: tipo_factura,
    numero_de_documento: number | 0,
    importe_gravado: number
  ): Promise<ICreateVoucherResult> {
    try {
      // console.log("importe sin iva:", importe_gravado);
      // console.log(
      //   "importe con iva red:",
      //   redondearDosDecimales(importe_gravado * 1.21)
      // );
      const lastVoucher =
        await this.afip.electronicBillingService.getLastVoucher(
          this.puntoDeVenta,
          tipo_factura
        );
      const payload = {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: this.puntoDeVenta, // Punto de venta
        CbteTipo: tipo_factura, // Tipo de comprobante (ver tipos disponibles)
        Concepto: concepto, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        DocTipo: tipo_de_documento, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
        DocNro: numero_de_documento, // Número de documento del comprador (0 consumidor final)
        CbteDesde: lastVoucher.CbteNro + 1, // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
        CbteHasta: lastVoucher.CbteNro + 1, // Número de comprobante o numero del último comprobante en caso de ser mas de uno
        CbteFch: formatDate(new Date()), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        ImpTotal: redondearDosDecimales(importe_gravado * 1.21), // Importe total del comprobante
        ImpTotConc: 0, // Importe neto no gravado
        ImpNeto: importe_gravado, // Importe neto gravado
        ImpOpEx: 0, // Importe exento de IVA
        ImpIVA: redondearDosDecimales(importe_gravado * 0.21), //Importe total de IVA
        ImpTrib: 0, //Importe total de tributos
        MonId: "PES", //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
        MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
        Iva: [
          // (Opcional) Alícuotas asociadas al comprobante
          {
            Id: 5, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles)
            BaseImp: importe_gravado, // Base imponible
            Importe: redondearDosDecimales(importe_gravado * 0.21), // Importe
          },
        ],
      };
      const invoice: ICreateVoucherResult =
        await this.afip.electronicBillingService.createInvoice(payload);
      return invoice;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async nuevaNc(
    concepto: tipo_concepto,
    tipo_de_documento: tipo_documento,
    tipo_factura: tipo_nc,
    numero_de_documento: number | 0,
    importe_gravado: number,
    numFactAsoc: number
  ): Promise<ICreateVoucherResult> {
    try {
      let typeFactAsoc: number = 1;
      if (tipo_factura == tipo_nc.NCB) {
        typeFactAsoc = 6;
      }
      const lastVoucher =
        await this.afip.electronicBillingService.getLastVoucher(
          this.puntoDeVenta,
          tipo_factura
        );
      const payload = {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: this.puntoDeVenta, // Punto de venta
        CbteTipo: tipo_factura, // Tipo de comprobante (ver tipos disponibles)
        Concepto: concepto, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
        DocTipo: tipo_de_documento, // Tipo de documento del comprador (99 consumidor final, ver tipos disponibles)
        DocNro: numero_de_documento, // Número de documento del comprador (0 consumidor final)
        CbteDesde: lastVoucher.CbteNro + 1, // Número de comprobante o numero del primer comprobante en caso de ser mas de uno
        CbteHasta: lastVoucher.CbteNro + 1, // Número de comprobante o numero del último comprobante en caso de ser mas de uno
        CbteFch: formatDate(new Date()), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
        ImpTotal: redondearDosDecimales(importe_gravado * 1.21), // Importe total del comprobante
        ImpTotConc: 0, // Importe neto no gravado
        ImpNeto: importe_gravado, // Importe neto gravado
        ImpOpEx: 0, // Importe exento de IVA
        ImpIVA: redondearDosDecimales(importe_gravado * 0.21), //Importe total de IVA
        ImpTrib: 0, //Importe total de tributos
        MonId: "PES", //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
        MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
        Iva: [
          // (Opcional) Alícuotas asociadas al comprobante
          {
            Id: 5, // Id del tipo de IVA (5 para 21%)(ver tipos disponibles)
            BaseImp: importe_gravado, // Base imponible
            Importe: redondearDosDecimales(importe_gravado * 0.21), // Importe
          },
        ],
        CbtesAsoc: [
          {
            Tipo: typeFactAsoc,
            PtoVta: this.puntoDeVenta,
            Nro: numFactAsoc,
            Cuit: numero_de_documento.toString(),
          },
        ],
      };
      // console.log("payload------->", payload);
      const invoice: ICreateVoucherResult =
        await this.afip.electronicBillingService.createInvoice(payload);
      console.log("NC GENERADA");
      return invoice;
    } catch (err) {
      throw err;
    }
  }

  async getInfoFactura(
    comprobante: number,
    ptoVenta: number,
    tipoComprobante: number
  ): Promise<ResToQueBillDto> {
    try {
      const voucherInfo: ServiceSoap12Types.IFECompConsultarResult | null =
        await this.afip.electronicBillingService.getVoucherInfo(
          comprobante,
          ptoVenta,
          tipoComprobante
        );

      if (voucherInfo === null) {
        throw new Error("No existe la factura");
      }
      const infoQr = {
        ver: 1,
        fecha: formatearFecha(voucherInfo.ResultGet.CbteFch),
        cuit: Number(process.env.CUIT),
        ptoVta: voucherInfo.ResultGet.PtoVta,
        tipoCmp: voucherInfo.ResultGet.CbteTipo,
        nroCmp: comprobante,
        importe: voucherInfo.ResultGet.ImpTotal,
        moneda: voucherInfo.ResultGet.MonId,
        ctz: voucherInfo.ResultGet.MonCotiz,
        tipoDocRec: voucherInfo.ResultGet.DocTipo,
        nroDocRec: voucherInfo.ResultGet.DocNro,
        tipoCodAut: "E",
        codAut: Number(voucherInfo.ResultGet.CodAutorizacion),
      };
      console.log(infoQr);
      const infoQrJson = JSON.stringify(infoQr);
      const infoQrJsonB64 = Buffer.from(infoQrJson).toString("base64");
      const qrUrl: string = `${process.env.URL_QR}/?p=${infoQrJsonB64}`;
      const res: ResToQueBillDto = {
        billData: voucherInfo,
        url: qrUrl,
      };
      return res;
    } catch (err) {
      throw err;
    }
  }
}
export default AfipService;
