/**
 * Calculates a standard CRC16-CCITT checksum for QRIS payloads.
 * Polynomial: 0x1021, Initial: 0xFFFF, No reflection, Final XOR: 0x0000.
 */
export function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    const code = str.charCodeAt(c);
    crc ^= (code << 8);
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

interface QRISOptions {
  nmid?: string;
  merchantName?: string;
  merchantId?: string;
  city?: string;
  postalCode?: string;
}

/**
 * Dynamically builds a standard, valid Indonesian QRIS (EMVCo) payload string
 * using the provided merchant details.
 */
export function generateQRIS(options: QRISOptions): string {
  const f = (tag: string, value: string): string => {
    return tag + value.length.toString().padStart(2, '0') + value;
  };

  const fNested = (tag: string, subTags: { tag: string; value: string }[]): string => {
    const content = subTags.map(st => f(st.tag, st.value)).join('');
    return f(tag, content);
  };

  const nmid = (options.nmid || 'ID1026514400302').trim();
  const merchantName = (options.merchantName || 'IT TECH SOLUTION').trim().toUpperCase();
  const merchantId = (options.merchantId || '93600915').trim();
  const city = (options.city || 'KAB. TANGERANG').trim().toUpperCase();
  const postalCode = (options.postalCode || '15810').trim();

  // EMVCo list structure
  const payloadTags: string[] = [];
  
  // Tag 00: Payload Format Indicator (01)
  payloadTags.push(f('00', '01'));
  
  // Tag 01: Point of Initiation Method (11 = Static, 12 = Dynamic)
  payloadTags.push(f('01', '11'));
  
  // Tag 26: Merchant Account Information (QRIS)
  payloadTags.push(fNested('26', [
    { tag: '00', value: 'ID.CO.QRIS.WWW' },
    { tag: '01', value: nmid },
    { tag: '02', value: merchantId.padEnd(15, '0') },
    { tag: '03', value: 'U00' }
  ]));

  // Tag 51: National Payment Network Info (Often required for standard processors)
  payloadTags.push(fNested('51', [
    { tag: '00', value: 'ID.CO.QRIS.WWW' },
    { tag: '01', value: nmid },
    { tag: '02', value: merchantId.padEnd(15, '0') },
    { tag: '03', value: 'U00' }
  ]));

  // Tag 52: Merchant Category Code (5732 = Computer Stores)
  payloadTags.push(f('52', '5732'));

  // Tag 53: Transaction Currency (360 = IDR)
  payloadTags.push(f('53', '360'));

  // Tag 58: Country Code (ID)
  payloadTags.push(f('58', 'ID'));

  // Tag 59: Merchant Name
  payloadTags.push(f('59', merchantName));

  // Tag 60: Merchant City
  payloadTags.push(f('60', city));

  // Tag 61: Postal Code
  payloadTags.push(f('61', postalCode));

  // Tag 62: Additional Data Field (Terminal ID / Printed ID)
  payloadTags.push(fNested('62', [
    { tag: '07', value: merchantId }
  ]));

  const rawPayload = payloadTags.join('') + '6304';
  const crc = calculateCRC16(rawPayload);
  return rawPayload + crc;
}
