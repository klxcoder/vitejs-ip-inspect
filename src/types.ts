export type Id = (
  | 'ip-version'
  | 'ip-header-length'
  | 'ip-type-of-service'
  | 'ip-total-length'
  | 'ip-identification'
  | 'ip-reserved-bit'
  | 'ip-dont-fragment'
  | 'ip-more-fragments'
  | 'ip-fragment-offset'
  | 'ip-time-to-live'
  | 'ip-protocol'
  | 'ip-header-checksum'
  | 'ip-source-address'
  | 'ip-destination-address'
  | 'ip-options'
  | 'tcp-source-port'
  | 'tcp-destination-port'
  | 'tcp-sequence-number'
  | 'tcp-acknowledgment-number'
  | 'tcp-header-length'
  | 'tcp-reserved'
  | 'tcp-acurate-ecn'
  | 'tcp-congestion-window-reduced'
  | 'tcp-ecn-echo'
  | 'tcp-urgent'
  | 'tcp-options'
  | 'tcp-ack'
  | 'tcp-push'
  | 'tcp-reset'
  | 'tcp-syn'
  | 'tcp-fin'
  | 'tcp-window-size'
  | 'tcp-checksum'
  | 'tcp-urgent-pointer'
);

export type Field = {
  id: Id,
  title: string;
  length: number;
  description: string;
  valueFn: (bin: string) => string | number;
}

export type FieldBin = Field & {
  bin: string;
}