import { useState, useEffect } from 'react';
import './table.css';
import './AppView.css';
import { binaryToDecimal, binaryToHex, hexToBinary, getFields, getErrors } from './utils';
import { EXAMPLE_IP_HEX, FIELDS } from './const';
import { FieldBin } from './types';
import AppView from './AppView';

function App() {
  const [ipHex, setIpHex] = useState(EXAMPLE_IP_HEX);
  const [ipBin, setIpBin] = useState('');
  const [fields, setFields] = useState<FieldBin[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setIpBin(hexToBinary(ipHex));
  }, [ipHex]);

  useEffect(() => {
    const { fields, ipBinTmp } = getFields(FIELDS, ipBin);
    const errors = getErrors(fields);
    setErrors(errors);
    if (errors.length > 0) {
      return;
    }
    const ipHeaderLength = binaryToDecimal(fields[1].bin);
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
    <AppView
      ipHex={ipHex}
      setIpHex={setIpHex}
      fields={fields}
      errors={errors}
    />
  );
}

export default App
