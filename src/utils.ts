import { Field, FieldBin } from "./types";

export const ipHexFn = (ipHex: string): string => {
  return ipHex.replace(/[^0-9A-Fa-f]/g, '').toLowerCase();
};

export const hexToBinary = (hex: string): string => {
  if (!hex) return '';
  return hex
    .match(/.{1}/g) // Split each hex digit
    ?.map(h => parseInt(h, 16).toString(2).padStart(4, '0')) // Convert to binary and pad
    .join('') || '';
}

export const binaryToHex = (binary: string): string => {
  if (!binary) return '';
  return binary
    .match(/.{4}/g) // Split into groups of 4
    ?.map(b => parseInt(b, 2).toString(16)) // Convert to hex
    .join('') || '';
}

export const binaryToDecimal = (binary: string): number => {
  return parseInt(binary, 2);
};

export const binaryToIP = (binaryStr: string): string => {
  if (binaryStr.length !== 32) {
    throw new Error("Binary string must be exactly 32 bits long");
  }

  const octets = binaryStr.match(/.{8}/g)?.map(b => parseInt(b, 2)) || [];
  return octets.join(".");
}

export const decimalToHex = (decimal: number): string => {
  return decimal.toString(16);
}

export const binToIpProtocol = (bin: string): string => {
  const protocolDecimal = binaryToDecimal(bin);
  const obj: { [key: number]: string } = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
  };
  return `${protocolDecimal} (${obj[protocolDecimal] || 'Unknown Protocol'})`;
}

function decimalToBinary(decimal: number, bits: number) {
  return decimal.toString(2).padStart(bits, '0');
}

export const getFields = (ipFields: Field[], ipBin: string): {
  fields: FieldBin[],
  ipBinTmp: string,
} => {
  let ipBinTmp = ipBin;
  const fields = [];
  for (const field of ipFields) {
    if (ipBinTmp.length >= field.length) {
      fields.push({
        ...field,
        bin: ipBinTmp.slice(0, field.length),
      });
      ipBinTmp = ipBinTmp.slice(field.length);
    }
  }
  return { fields, ipBinTmp };
}

export const getIpHeaderErrors = (fields: FieldBin[]): string[] => {
  const ipBin = fields.map(f => f.bin).join('');
  const ipHex = binaryToHex(ipBin);
  if (fields.length === 0) {
    return ['No fields found'];
  }
  const ipVersion = binaryToDecimal(fields[0].bin);
  if (ipVersion !== 4) {
    return [
      'Only IPv4 is supported',
      `Expected: 4`,
      `Actual: ${ipVersion}`,
    ];
  }
  const ipHeaderLength = binaryToDecimal(fields[1].bin);
  if (ipHeaderLength < 5) {
    return [
      'IP Header length must be at least 5',
      `Expected: at least 5`,
      `Actual: ${ipHeaderLength}`,
    ]
  }
  if (ipBin.length < ipHeaderLength * 32) {
    return [
      'The length of IP Header is not long enough',
      `Expected: ${ipHeaderLength * 32} bits`,
      `Actual: ${ipBin.length} bits`,
    ]
  }
  const words = ipHex.match(/.{4}/g)?.slice(0, ipHeaderLength * 2) || [];
  const checksumHex = words.splice(5, 1)[0]; // remove checksum
  const calculatedChecksum = 0xffff - words.reduce((acc, hex) => {
    const sum = acc + parseInt(hex, 16);
    if (sum >= 0xffff) {
      return sum - 0xffff;
    }
    return sum;
  }, 0);
  const calculatedChecksumHex = decimalToHex(calculatedChecksum);
  if (calculatedChecksumHex !== checksumHex) {
    return [
      'Checksum is incorrect',
      `Expected: 0x${calculatedChecksumHex}`,
      `Actual: 0x${checksumHex}`,
    ]
  }
  return [];
}

export const getTcpHeaderErrors = (ipHeaderFields: FieldBin[], tcpHeaderFields: FieldBin[]): string[] => {
  const sourceIpAddress = ipHeaderFields.find(field => field.id === 'ip-source-address')?.bin;
  const destinationIpAddress = ipHeaderFields.find(field => field.id === 'ip-destination-address')?.bin;
  const zeros = '0'.repeat(8);
  const protocol = '00000110'; // 6 (TCP)
  const ipTotalLength = binaryToDecimal(ipHeaderFields.find(field => field.id === 'ip-total-length')?.bin || '');
  const ipHeaderLength = binaryToDecimal(ipHeaderFields.find(field => field.id === 'ip-header-length')?.bin || '');
  const tcpLength = decimalToBinary(ipTotalLength - ipHeaderLength * 4, 16);
  const tcpPseudoHeader: string = [
    sourceIpAddress,
    destinationIpAddress,
    zeros,
    protocol,
    tcpLength,
  ].join('');
  let checksumBin: string = [
    tcpPseudoHeader,
    tcpHeaderFields.filter(field => field.id !== 'tcp-checksum').map(field => field.bin).join(''),
    // TODO: Add tcp options and tcp data
  ].join('');
  if (checksumBin.length % 16 !== 8) {
    checksumBin += '0'.repeat(8);
  }
  console.log(binaryToHex(checksumBin));
  const checksumArr = checksumBin.match(/.{16}/g) || [];
  const checksum = checksumArr.reduce((acc, bin) => {
    const sum = acc + binaryToDecimal(bin);
    if (sum >= 0xffff) {
      return sum - 0xffff;
    }
    return sum;
  }, 0);
  console.log('checksum = ', decimalToHex(checksum));
  return [];
}

export const getIpHeaderOptionsFields = (ipHeaderLength: number) => {
  const ipHeaderOptionsFields: Field[] = [
    {
      id: 'ip-options',
      title: 'Options',
      length: (ipHeaderLength - 5) * 32,
      description: 'The options field of the packet',
      valueFn: binaryToHex,
    },
  ]
  return ipHeaderOptionsFields;
}