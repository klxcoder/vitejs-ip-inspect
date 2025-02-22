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

function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
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

const sum16bits = (hex: string): string => {
  const words: string[] = hex.match(/.{4}/g)?.map(x => x) || [];
  const checksumNbr: number = words.reduce((acc, hex) => {
    const sum = acc + parseInt(hex, 16);
    if (sum > 0xffff) {
      return sum - 0xffff;
    }
    return sum;
  }, 0);
  return decimalToHex(checksumNbr);
}

const final1sComplement = (hex: string): string => {
  const number = 0xffff - hexToDecimal(hex);
  return decimalToHex(number);
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
  if (fields.length === 1) {
    return ['Please provide IHL'];
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
  const calculatedChecksum = 0xffff - hexToDecimal(sum16bits(words.join('')));
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

export const getTcpHeaderErrors = (
  ipHeaderFields: FieldBin[],
  tcpHeaderFields: FieldBin[],
  tcpHeaderOptionsFields: FieldBin[],
): string[] => {
  const sourceIpAddress = ipHeaderFields.find(field => field.id === 'ip-source-address')?.bin;
  const destinationIpAddress = ipHeaderFields.find(field => field.id === 'ip-destination-address')?.bin;
  const zeros = '0'.repeat(8);
  const protocol = '00000110'; // 6 (TCP)
  const ipTotalLength = binaryToDecimal(ipHeaderFields.find(field => field.id === 'ip-total-length')?.bin || '');
  const ipHeaderLength = binaryToDecimal(ipHeaderFields.find(field => field.id === 'ip-header-length')?.bin || '');
  const tcpLength = decimalToBinary(ipTotalLength - ipHeaderLength * 4, 16);
  // TCP Pseudo Header
  const tcpPseudoHeaderBin: string = [
    sourceIpAddress,
    destinationIpAddress,
    zeros,
    protocol,
    tcpLength,
  ].join('');
  // TCP Segment
  let tcpSegmentBin = [
    tcpHeaderFields.map(field => field.id === 'tcp-checksum' ? '0'.repeat(16) : field.bin).join(''),
    tcpHeaderOptionsFields[0]?.bin || '',
  ].join('');
  if (tcpSegmentBin.length % 16 === 8) {
    tcpSegmentBin += '0'.repeat(8);
  }
  const tcpPseudoHeaderPartialChecksum = sum16bits(binaryToHex(tcpPseudoHeaderBin));
  const tcpSegmentPartialChecksum = sum16bits(binaryToHex(tcpSegmentBin));
  const checksum = final1sComplement(sum16bits([
    tcpPseudoHeaderPartialChecksum,
    tcpSegmentPartialChecksum,
  ].join('')));
  const actualChecksum = binaryToHex(tcpHeaderFields.find(field => field.id === 'tcp-checksum')?.bin || '');
  if (![
    tcpPseudoHeaderPartialChecksum,
    tcpSegmentPartialChecksum,
    checksum,
  ].includes(actualChecksum)) {
    return [
      `TCP Pseudo Header Partial Checksum: 0x${tcpPseudoHeaderPartialChecksum}`,
      `TCP Segment Partial Checksum: 0x${tcpSegmentPartialChecksum}`,
      `Full Checksum: 0x${checksum}`,
      `Actual Checksum 0x${actualChecksum} do not match one of the above`,
    ]
  }
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

export const getTcpHeaderOptionsFields = (tcpHeaderLength: number) => {
  const tcpHeaderOptionsFields: Field[] = [
    {
      id: 'tcp-options',
      title: 'Options',
      length: (tcpHeaderLength - 5) * 32,
      description: 'The options field of the packet',
      valueFn: binaryToHex,
    },
  ]
  return tcpHeaderOptionsFields;
}