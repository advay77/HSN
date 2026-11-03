// Puts the Supabase database password into DATABASE_URL in .env (URL-encoded) and tests the connection.
// The password is never shown on screen. Usage: node scripts/set-db-password.mjs
import fs from 'fs'
import pg from 'pg'
import readline from 'readline'

const ENV = new URL('../.env', import.meta.url)
const CA = new URL('../certs/supabase-ca.crt', import.meta.url)

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => {
      if (s.includes(question)) rl.output.write(s)
    }
    rl.question(question, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

const env = fs.readFileSync(ENV, 'utf8')
const line = env.match(/^DATABASE_URL=(.*)$/m)
if (!line || !/^postgres(ql)?:\/\//.test(line[1].trim())) {
  console.log('DATABASE_URL in .env is not a Supabase postgresql:// address. Paste the Transaction pooler address first.')
  process.exit(1)
}
let password = (await askHidden('Supabase database password paste karo (dikhega nahi), phir Enter: ')).trim()
// Right-click plus Ctrl+V in some terminals pastes twice; keep one copy.
const half = password.length / 2
if (password.length % 2 === 0 && password.length >= 16 && password.slice(0, half) === password.slice(half)) password = password.slice(0, half)
if (!password) {
  console.log('Koi password nahi mila. Dobara chalao.')
  process.exit(1)
}

const url = new URL(line[1].trim())
url.password = encodeURIComponent(password)
url.searchParams.set('sslmode', 'require')
fs.writeFileSync(ENV, env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${url.toString()}`))
console.log(`Password .env mein daal diya (${password.length} characters).`)

const test = new URL(url.toString())
test.searchParams.delete('sslmode')
const client = new pg.Client({
  connectionString: test.toString(),
  connectionTimeoutMillis: 15000,
  ssl: fs.existsSync(CA) ? { ca: fs.readFileSync(CA, 'utf8'), rejectUnauthorized: true } : undefined,
})
try {
  await client.connect()
  await client.query('select 1')
  await client.end()
  console.log('SAHI HAI: database se connection ho gaya. Claude ko bolo "password sahi hai".')
} catch (e) {
  if (e.code === '28P01') console.log('GALAT PASSWORD: Supabase ne password nahi maana. Supabase mein password dobara reset karke ye command phir chalao.')
  else console.log('Connection nahi hua:', e.code || '', String(e.message).slice(0, 120))
  process.exit(1)
}
