import express, { Request, Response } from "express";
import AfipService from "../services/afip.service";
import { FacturacionRequestBody, NCRequestBody } from "../types/factura";
import { ICreateVoucherResult } from "afip.ts";
import { ResToQueBillDto } from "../dto/ResToQueBillDto";

const router = express.Router();
const afipService: AfipService = new AfipService();

router.post(
  "/new/ft",
  async (
    req: Request<{}, {}, FacturacionRequestBody>,
    res: Response
  ): Promise<void> => {
    try {
      const {
        concepto,
        tipo_de_documento,
        tipo_de_factura,
        numero_de_documento,
        importe_gravado,
      } = req.body;
      const ans: ICreateVoucherResult = await afipService.nuevaFactura(
        concepto,
        tipo_de_documento,
        tipo_de_factura,
        numero_de_documento,
        importe_gravado
      );
      console.log(ans)
      if (ans.response.FeCabResp.Resultado == "R")
        throw new Error("No se pudo facturar");
      res.status(200).send(ans);
    } catch (err: any) {
      console.log(err);
      res.status(500).end();
    }
  }
);

router.post(
  "/new/nc",
  async (req: Request<{}, {}, NCRequestBody>, res: Response): Promise<void> => {
    try {
      const {
        concepto,
        tipo_de_documento,
        tipo_de_factura,
        numero_de_documento,
        importe_gravado,
        numFactAsoc,
      } = req.body;
      const ans: ICreateVoucherResult = await afipService.nuevaNc(
        concepto,
        tipo_de_documento,
        tipo_de_factura,
        numero_de_documento,
        importe_gravado,
        numFactAsoc
      );
      if (ans.response.FeCabResp.Resultado == "R") {
        ans.response.FeDetResp.FECAEDetResponse.map((item) => {
          console.log(item.Observaciones);
        });
        throw new Error("No se pudo facturar");
      }
      res.status(200).send(ans);
    } catch (err: any) {
      console.log(err);
      res.status(500).end();
    }
  }
);

router.get(
  "/info/:num/:ptovta/:type",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { num, ptovta, type } = req.params;
      const response: ResToQueBillDto = await afipService.getInfoFactura(
        Number(num),
        Number(ptovta),
        Number(type)
      );
      res.status(200).send(response);
    } catch (err: any) {
      console.log(err);
      res.status(500).end();
    }
  }
);

export default router;
