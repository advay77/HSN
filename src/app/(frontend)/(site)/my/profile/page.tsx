// Ported from Profile.dc.html.
import { headers } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { MemberNav, TIER_FEATURES, TIER_LABEL } from '@/components/member/MemberNav'
import { requireMember } from '@/lib/auth/guard'
import { getPayloadClient } from '@/lib/payload'
import { ProfileA11y } from './ProfileA11y'
import { ProfileForm } from './ProfileForm'

export const metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const current = await requireMember('/my/profile')
  const payload = await getPayloadClient()
  const m = await payload.findByID({ collection: 'members', id: current.id, depth: 0 })
  const active = m.membershipStatus === 'active' && m.membershipTier
  const tier = active ? TIER_LABEL[m.membershipTier!] : null

  return (
    <main className="sec" style={{ paddingTop: '40px' }}>
      <div className="wrap mlay">
        <MemberNav current="profile" />
        <div className="stack g32">
          <div className="row g20">
            <span className="avatar" style={{ width: '72px', height: '72px', fontSize: '24px' }}>{current.initials}</span>
            <div className="stack g4"><h1 className="h1">My Profile</h1>{tier && <div className="row g8"><span className="bdg b-cat">{tier}</span></div>}</div>
          </div>
          <ProfileForm
            geo={(await headers()).get('x-vercel-ip-country')}
            values={{
              name: m.name,
              email: m.email,
              phoneCountryCode: m.phoneCountryCode || '',
              phone: m.phone || '',
              role: m.role || '',
              organization: m.organization || '',
              country: m.country || '',
            }}
          />
          <section className="card pad-l stack g16" aria-labelledby="mt">
            <h2 className="h3" id="mt">Membership Tier</h2>
            <div className="row between g16" style={{ padding: '16px 20px', borderRadius: '12px', background: '#E3F1E4' }}>
              {tier ? (
                <div className="stack g4"><span className="h4">{tier}</span><span className="small muted">{TIER_FEATURES[m.membershipTier!]}</span></div>
              ) : (
                <div className="stack g4"><span className="h4">{m.membershipStatus === 'pending' ? 'Membership pending' : 'Not a member yet'}</span><span className="small muted">Choose a tier to unlock the full course library and member resources.</span></div>
              )}
              <Link className="btn btn-s btn-sm" href="/membership">Compare tiers</Link>
            </div>
          </section>
          <ProfileA11y />
        </div>
      </div>
    </main>
  )
}
