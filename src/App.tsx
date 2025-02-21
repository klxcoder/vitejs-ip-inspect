import { useState, useEffect } from 'react';
import './table.css';
import './App.css';
import { binaryToDecimal, binaryToHex, hexToBinary, decimalToHex, ipHexFn } from './utils';
import { EXAMPLE_IP_HEX, FIELDS } from './const';
import { FieldBin, Field } from './types';

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
