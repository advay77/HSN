import React from 'react'

import './styles/fonts.css'
import './styles/hsn.css'
import './styles/hsn2.css'
import './styles/motion.css'

import { NavProgress } from '@/components/site/NavProgress'

const SITE = 'https://healthcaresustainabilitynetwork.com'

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Healthcare Sustainability Network (HSN)',
    template: '%s · Healthcare Sustainability Network (HSN)',
  },
  description:
    'Healthcare Sustainability Network (HSN) advances sustainable healthcare, green hospital operations, and decarbonization. It bridges healthcare quality, patient safety, and environmental stewardship.',
  keywords: ['HSN', 'Healthcare Sustainability Network', 'healthcare sustainability', 'green hospitals', 'sustainable healthcare', 'hospital decarbonization'],
  applicationName: 'Healthcare Sustainability Network',
  authors: [{ name: 'Healthcare Sustainability Network', url: SITE }],
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'Healthcare Sustainability Network (HSN)',
    title: 'Healthcare Sustainability Network (HSN)',
    description: 'HSN advances sustainable healthcare, green hospital operations, and decarbonization.',
  },
  robots: { index: true, follow: true },
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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Healthcare Sustainability Network',
              alternateName: ['HSN', 'Healthcare Sustainability Network (HSN)'],
              url: SITE,
              logo: `${SITE}/images/hsn-logo.jpg`,
              description: 'Healthcare Sustainability Network (HSN) advances sustainable healthcare, green hospital operations, and decarbonization.',
            }),
          }}
        />
        <NavProgress />
        {children}
      </body>
    </html>
  )
}
