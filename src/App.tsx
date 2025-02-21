import { useState, useEffect } from 'react';
import './table.css';
import './App.css';

const ipHexFn = (ipHex: string): string => {
  return ipHex.replace(/[^0-9A-Fa-f]/g, '').toLowerCase();
};

const hexToBinary = (hex: string): string => {
  if (!hex) return '';
  return hex
    .match(/.{1}/g) // Split each hex digit
    ?.map(h => parseInt(h, 16).toString(2).padStart(4, '0')) // Convert to binary and pad
    .join('') || '';
}

const binaryToHex = (binary: string): string => {
  if (!binary) return '';
  return binary
    .match(/.{4}/g) // Split into groups of 4
    ?.map(b => parseInt(b, 2).toString(16)) // Convert to hex
    .join('') || '';
}

const binaryToDecimal = (binary: string): number => {
  return parseInt(binary, 2);
};

const binaryToIP = (binaryStr: string): string => {
  if (binaryStr.length !== 32) {
    throw new Error("Binary string must be exactly 32 bits long");
  }

  const octets = binaryStr.match(/.{8}/g)?.map(b => parseInt(b, 2)) || [];
  return octets.join(".");
}

const decimalToHex = (decimal: number): string => {
  return decimal.toString(16);
}

const binToIpProtocol = (bin: string): string => {
  const protocolDecimal = binaryToDecimal(bin);
  const obj: { [key: number]: string } = {
    1: 'ICMP',
    6: 'TCP',
    17: 'UDP',
  };
  return `${protocolDecimal} (${obj[protocolDecimal] || 'Unknown Protocol'})`;
}

const EXAMPLE_IP_HEX = '4500003c660440004006d6b57f0000017f000001bd180007eecf60e400000000a002ffd7fe3000000204ffd70402080aba9bf91f0000000001030307'; // SYN packet

type Field = {
  title: string;
  length: number;
  description: string;
  valueFn: (bin: string) => string | number;
}

type FieldBin = Field & {
  bin: string;
}

const FIELDS: Field[] = [
  {
    title: 'Version',
    length: 4,
    description: 'The version of the protocol',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Header Length',
    length: 4,
    description: 'The length of the header in 32-bit words',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Type of Service',
    length: 8,
    description: 'The type of service',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Total Length',
    length: 16,
    description: 'The total length of the packet in bytes',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Identification',
    length: 16,
    description: 'The unique identifier of the packet',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Reserved bit',
    length: 1,
    description: 'Reserved bit',
    valueFn: binaryToDecimal,
  },
  {
    title: "Don't Fragment",
    length: 1,
    description: "Don't fragment bit",
    valueFn: binaryToDecimal,
  },
  {
    title: 'More Fragments',
    length: 1,
    description: 'More fragments bit',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Fragment Offset',
    length: 13,
    description: 'The fragment offset of the packet',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Time to Live',
    length: 8,
    description: 'The time to live of the packet',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Protocol',
    length: 8,
    description: 'The protocol of the packet',
    valueFn: binToIpProtocol,
  },
  {
    title: 'Header Checksum',
    length: 16,
    description: 'The checksum of the packet',
    valueFn: (bin: string) => `0x${binaryToHex(bin)}`,
  },
  {
    title: 'Source Address',
    length: 32,
    description: 'The source address of the packet',
    valueFn: binaryToIP,
  },
  {
    title: 'Destination Address',
    length: 32,
    description: 'The destination address of the packet',
    valueFn: binaryToIP,
  },
];


function App() {
  const [ipHex, setIpHex] = useState(EXAMPLE_IP_HEX);
  const [ipBin, setIpBin] = useState('');
  const [fields, setFields] = useState<FieldBin[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setIpBin(hexToBinary(ipHex));
  }, [ipHex]);

  const getFields = (FIELDS: Field[], ipBin: string): {
    fields: FieldBin[],
    ipBinTmp: string,
  } => {
    let ipBinTmp = ipBin;
    const fields = [];
    for (const field of FIELDS) {
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

  useEffect(() => {
    const { fields, ipBinTmp } = getFields(FIELDS, ipBin);
    if (fields.length === 0) {
      setErrors([]);
      return;
    }
    const ipVersion = binaryToDecimal(fields[0].bin);
    if (ipVersion !== 4) {
      setErrors([
        'Only IPv4 is supported',
        `Expected: 4`,
        `Actual: ${ipVersion}`,
      ]);
      return;
    }
    const ipHeaderLength = binaryToDecimal(fields[1].bin);
    if (ipHeaderLength < 5) {
      setErrors([
        'IP Header length must be at least 5',
        `Expected: at least 5`,
        `Actual: ${ipHeaderLength}`,
      ]);
      return;
    }
    if (ipBin.length < ipHeaderLength * 32) {
      setErrors([
        'The length of IP Header is not long enough',
        `Expected: ${ipHeaderLength * 32} bits`,
        `Actual: ${ipBin.length} bits`,
      ]);
      return;
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
      setErrors([
        'Checksum is incorrect',
        `Expected: 0x${calculatedChecksumHex}`,
        `Actual: 0x${checksumHex}`,
      ]);
      return;
    }
    setErrors([]);
    const { fields: options } = getFields([
      {
        title: 'Options',
        length: (ipHeaderLength - 5) * 32,
        description: 'The options field of the packet',
        valueFn: binaryToHex,
      },
    ], ipBinTmp);
    const protocol = fields.find((field) => field.title === 'Protocol');
    if (protocol) {
      const protocolDecimal = binaryToDecimal(protocol.bin);
      switch (protocolDecimal) {
        case 1:
          // Will handle ICMP
          break;
        case 6:
          // Will handle TCP
          break;
        case 17:
          // Will handle UDP
          break;
      }
    }
    setFields([...fields, ...options]);
  }, [ipBin, ipHex]);

  return (
    <div className="app">
      <textarea
        value={ipHex}
        onChange={(e) => setIpHex(ipHexFn(e.target.value))}
        placeholder="Enter IPv4 in hex format"
      />
      <ul className="errors">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
      <table className="details">
        <thead>
          <tr>
            <th>Field</th>
            <th>Size (bits)</th>
            <th>Value (binary)</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index}>
              <td>{field.title}</td>
              <td>{field.length}</td>
              <td>{field.bin}</td>
              <td>{field.valueFn(field.bin)}</td>
              <td>{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App
