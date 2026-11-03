// Site sections by path, shared by the page-view beacon and the admin analytics.
const SECTIONS: [string, string][] = [
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/courses', 'Courses'],
  ['/case-studies', 'Case Studies'],
  ['/library', 'Library'],
  ['/get-involved', 'Get Involved'],
  ['/membership', 'Membership'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/my', 'My HSN'],
  ['/register', 'Courses'],
  ['/login', 'Log in'],
  ['/ar', 'Arabic'],
]

export const sectionOf = (path: string): string | null =>
  path === '/' ? 'Home' : SECTIONS.find(([p]) => path === p || path.startsWith(p + '/'))?.[1] ?? null
