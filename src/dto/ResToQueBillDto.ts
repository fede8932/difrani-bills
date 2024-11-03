import { ServiceSoap12Types } from "afip.ts/lib/soap/interfaces/Service/ServiceSoap12";

export type ResToQueBillDto = {
  readonly billData: ServiceSoap12Types.IFECompConsultarResult;
  readonly url: string;
};
