import { BASE_URL } from './apiConfig'

export async function generateQRCode(payload) {
  const response = await fetch(`${BASE_URL}/api/grampanchayat/generate-qr`, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })

  if (!response.ok) {
    let message = 'Unable to generate QR code'

    try {
      const result = await response.json()
      message = result.message || message
    } catch {
      // Keep the default message when the server does not return JSON.
    }

    throw new Error(message)
  }

  return {
    blob: await response.blob(),
    qrRecordId: response.headers.get('X-QR-Record-Id'),
    upiId: response.headers.get('X-QR-UPI-ID'),
  }
}