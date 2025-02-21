import { useState, useEffect } from 'react';
import './table.css';
import './AppView.css';
import { binaryToDecimal, hexToBinary, getFields, getIpHeaderErrors, getIpHeaderOptionsFields, getTcpHeaderErrors } from './utils';
import { EXAMPLE_IP_HEX, IP_HEADER_FIELDS, TCP_HEADER_FIELDS } from './const';
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
    // Process IP Header
    const { fields: ipHeaderFields, ipBinTmp: ipHeaderBin } = getFields(IP_HEADER_FIELDS, ipBin);
    const ipHeaderErrors = getIpHeaderErrors(ipHeaderFields);
    setErrors(ipHeaderErrors);
    if (ipHeaderErrors.length > 0) {
      return;
    }
    // Process IP Header Options
    const ipHeaderLength = binaryToDecimal(ipHeaderFields[1].bin);
    const { fields: ipHeaderOptionsFields, ipBinTmp: ipHeaderOptionsBin } = getFields(getIpHeaderOptionsFields(ipHeaderLength), ipHeaderBin);
    // fields
    const fields = [...ipHeaderFields, ...ipHeaderOptionsFields];
    // Process Protocol
    const protocol = ipHeaderFields.find((field) => field.title === 'Protocol');
    if (protocol) {
      const protocolDecimal = binaryToDecimal(protocol.bin);
      switch (protocolDecimal) {
        case 1: {
          // Process ICMP
          break;
        }
        case 6: {
          // Process TCP
          const { fields: tcpHeaderFields } = getFields(TCP_HEADER_FIELDS, ipHeaderOptionsBin);
          const tcpHeaderErrors = getTcpHeaderErrors(ipHeaderFields, tcpHeaderFields);
          setErrors(tcpHeaderErrors);
          if (tcpHeaderErrors.length > 0) {
            return;
          }
          fields.push(...tcpHeaderFields);
          // TODO: Check TCP Header
          break;
        }
        case 17: {
          // Process UDP
          break;
        }
      }
    }
    setFields(fields);
  }, [ipBin]);

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
