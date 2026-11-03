import React from 'react'

import './styles/fonts.css'
import './styles/hsn.css'
import './styles/hsn2.css'

export const metadata = {
  title: {
    default: 'Healthcare Sustainability Network',
    template: '%s · Healthcare Sustainability Network',
  },
  description:
    'Advancing Sustainable Healthcare, Green Operations, and Decarbonization. Bridging the gap between healthcare quality, patient safety, and environmental stewardship across health systems.',
  icons: { icon: '/images/hsn-logo.jpg' },
}

export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Same families the design loads, plus the accessibility fonts. Aptos is set up in styles/fonts.css. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@600;700;800&family=Lexend:wght@400;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
