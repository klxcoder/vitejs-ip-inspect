import './table.css';
import './AppView.css';
import { ipHexFn } from './utils';
import { FieldBin } from './types';

function AppView({
  ipHex,
  setIpHex,
  fields,
  errors,
}: {
  ipHex: string,
  setIpHex: (ipHex: string) => void,
  fields: FieldBin[],
  errors: string[],
}) {

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
              <td>{field.bin.length <= 32 ? field.bin : '---'}</td>
              <td>{field.valueFn(field.bin)}</td>
              <td>{field.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AppView
