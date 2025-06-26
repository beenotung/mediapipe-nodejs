import { execSync } from 'child_process'
import express from 'express'
import { Server } from 'http'
import { dirname, join } from 'path'

export async function startClient(options: {
  port: number
  /** default: true */
  auto_install_playwright?: boolean
}) {
  if (options.auto_install_playwright ?? true) {
    installPlaywright()
  }

  let { port } = options
  let app = express()

  app.use(express.static(join(__dirname, '..', 'public')))
  app.use(
    '/npm/@mediapipe/tasks-vision',
    express.static(dirname(require.resolve('@mediapipe/tasks-vision'))),
  )

  let server = await new Promise<Server>((resolve, reject) => {
    let server = app.listen(port, () => {
      resolve(server)
    })
    server.on('error', reject)
  })

  function stop() {
    server.close()
  }

  function attachImageDirection(options: {
    /** e.g. '/images' */
    url_prefix: string
    /** e.g. './uploads/' */
    directory: string
  }) {
    app.use(options.url_prefix, express.static(options.directory))
  }

  return {
    attachImageDirection,
    stop,
  }
}

export function installPlaywright() {
  execSync('npx playwright install chromium')
}
