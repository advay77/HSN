// Ported from AdminCourses.dc.html: courses table + course editor for the selected course.
// ?edit=<id> opens a course, ?new=1 starts a new one; with neither, the first course is open.
import React from 'react'

import '@/app/(frontend)/styles/pages/admin-courses.css'

import { CourseAdmin } from '@/components/admin/CourseAdmin'
import { blankCourse } from '@/components/admin/courseTypes'
import { requireAdmin } from '@/lib/admin/auth'
import { getCourseForEditor, listCourses } from '@/lib/admin/courses'

export const metadata = { title: 'Courses' }

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const admin = await requireAdmin('/admin/courses')
  const sp = await searchParams
  const rows = await listCourses()
  const editId = sp.new ? null : Number(sp.edit) || rows[0]?.id || null
  const initial = (editId && (await getCourseForEditor(editId))) || blankCourse()
  return <CourseAdmin key={initial.id ?? 'new'} rows={rows} initial={initial} adminInitial={admin.initial} />
}
