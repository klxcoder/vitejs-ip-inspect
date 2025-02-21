export type Field = {
  title: string;
  length: number;
  description: string;
  valueFn: (bin: string) => string | number;
}

export type FieldBin = Field & {
  bin: string;
}