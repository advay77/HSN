declare module 'qrcode' {
  const QRCode: {
    toString(
      text: string,
      options: {
        type: 'svg'
        margin?: number
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
        color?: { dark?: string; light?: string }
      },
    ): Promise<string>
  }
  export default QRCode
}
