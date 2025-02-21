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

export const TCP_HEADER_FIELDS: Field[] = [
  {
    title: 'Source Port',
    length: 16,
    description: 'The port number of the sender',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Destination Port',
    length: 16,
    description: 'The port number of the receiver',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Sequence Number',
    length: 32,
    description: 'The sequence number of the first byte in the segment',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Acknowledgment Number',
    length: 32,
    description: 'The acknowledgment number indicating the next expected byte',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Data Offset',
    length: 4,
    description: 'The size of the TCP header in 32-bit words',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Reserved',
    length: 3,
    description: 'Reserved for future use, must be set to zero',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Acurate ECN',
    length: 1,
    description: 'Explicit Congestion Notification',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Congestion Window Reduced',
    length: 1,
    description: 'Congestion Window Reduced',
    valueFn: binaryToDecimal,
  },
  {
    title: 'ECN-Echo',
    length: 1,
    description: 'ECN-Echo',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Urgent',
    length: 1,
    description: 'Urgent',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Acknowledgment',
    length: 1,
    description: 'Acknowledgment',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Push',
    length: 1,
    description: 'Push',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Reset',
    length: 1,
    description: 'Reset',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Syn',
    length: 1,
    description: 'Synchronize',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Fin',
    length: 1,
    description: 'Finish',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Window Size',
    length: 16,
    description: 'The number of bytes the sender is willing to receive',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Checksum',
    length: 16,
    description: 'The checksum for error-checking the header and data',
    valueFn: (bin: string) => `0x${binaryToHex(bin)}`,
  },
  {
    title: 'Urgent Pointer',
    length: 16,
    description: 'Indicates the position of urgent data, if the URG flag is set',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Urgent',
    length: 1,
    description: 'Urgent',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Acknowledgment',
    length: 1,
    description: 'Acknowledgment',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Push',
    length: 1,
    description: 'Push',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Reset',
    length: 1,
    description: 'Reset',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Synchronize',
    length: 1,
    description: 'Synchronize',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Finish',
    length: 1,
    description: 'Finish',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Window Size',
    length: 16,
    description: 'The number of bytes the sender is willing to receive',
    valueFn: binaryToDecimal,
  },
  {
    title: 'Checksum',
    length: 16,
    description: 'The checksum for error-checking the header and data',
    valueFn: (bin: string) => `0x${binaryToHex(bin)}`,
  },
  {
    title: 'Urgent Pointer',
    length: 16,
    description: 'Indicates the position of urgent data, if the URG flag is set',
    valueFn: binaryToDecimal,
  },
];
