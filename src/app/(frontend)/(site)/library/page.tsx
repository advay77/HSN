// Ported from Library.dc.html. Resources come from published Library items in the CMS.
import Link from 'next/link'
import React from 'react'

import { LibraryList, type LibraryRow } from '@/components/library/LibraryList'
import { requireMember } from '@/lib/auth/guard'
import { getPayloadClient } from '@/lib/payload'

import '../../styles/pages/library.css'

export const metadata = { title: 'Library' }
export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const payload = await getPayloadClient()
  const [res, member] = await Promise.all([
    payload.find({ collection: 'library-resources', where: { published: { equals: true } }, sort: '-createdAt', limit: 500, depth: 0 }),
    requireMember('/library'),
  ])
  const activeMember = member?.membershipStatus === 'active'
  const rows: LibraryRow[] = res.docs.map((d) => {
    const locked = d.access === 'members' && !activeMember
    return {
      id: String(d.id),
      type: d.type,
      title: d.title,
      desc: d.description || '',
      format: d.format || '',
      pages: d.size || '',
      access: d.access === 'members' ? 'Members' : 'Free',
      // Files are served through /library/<id>/file, which checks membership again.
      href: locked ? (member ? '/membership' : '/login?next=%2Flibrary') : d.file || d.externalUrl ? `/library/${d.id}/file` : null,
      locked,
    }
  })

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '40px' }}>
        <div className="wrap stack g32">
          <div className="stack g20">
            <h1 className="sec-title hero-title">Library</h1>
            <p className="lead">Guides, toolkits, reports and templates to help healthcare teams plan, measure and report sustainability improvements.</p>
          </div>
        </div>
      </section>
      <section className="sec" style={{ paddingTop: '8px' }} aria-labelledby="res">
        <LibraryList rows={rows} signedIn={!!member} />
      </section>
    </main>
  )
}
