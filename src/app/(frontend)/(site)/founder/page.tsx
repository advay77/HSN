// Our Team. The nav label is "Our Team"; the address stays /founder. People are managed in Admin → Our Team.
import type { Metadata } from 'next'
import React from 'react'

import '../../styles/pages/about.css'
import '../../styles/pages/team.css'

import { TeamBoard, type TeamPerson } from '@/components/site/TeamBoard'
import { getPayloadClient } from '@/lib/payload'
import { getSiteCopy } from '@/lib/site/copy'
import type { Media } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Our Team',
  description: 'The people of the Healthcare Sustainability Network.',
}
export const revalidate = 60

export default async function FounderPage() {
  const [payload, copy] = await Promise.all([getPayloadClient(), getSiteCopy()])
  const { docs } = await payload.find({ collection: 'team-members', where: { published: { equals: true } }, sort: 'sort', pagination: false, depth: 1 })
  const people: TeamPerson[] = docs.map((m) => {
    const photo = m.photo && typeof m.photo === 'object' ? (m.photo as Media).url : null
    return { id: m.id, name: m.name, role: m.role || '', bio: m.bio || '', photo: photo || null }
  })

  return (
    <main>
      <section className="sec" style={{ paddingTop: '48px', paddingBottom: '0' }}>
        <div className="wrap">
          <div className="green-box light-box">
            <h1 className="sec-title">{copy.teamPageTitle}</h1>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          {people.length > 0 ? <TeamBoard people={people} /> : <p className="muted">Team members will be added soon.</p>}
        </div>
      </section>
    </main>
  )
}
