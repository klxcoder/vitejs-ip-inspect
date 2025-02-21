import { Field } from "./types";
import { binaryToDecimal, binToIpProtocol, binaryToHex, binaryToIP } from "./utils";

export const EXAMPLE_IP_HEX = '4500003c660440004006d6b57f0000017f000001bd180007eecf60e400000000a002ffd7fe3000000204ffd70402080aba9bf91f0000000001030307'; // SYN packet

export const IP_HEADER_FIELDS: Field[] = [
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