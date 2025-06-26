import { execSync } from 'child_process'
import express from 'express'
import { Server } from 'http'
import { dirname, join } from 'path'
import { Browser, chromium } from 'playwright'
import type { DetectFaceLandmarksOptions } from './client'
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision'

export type MediaPipeClient = Awaited<ReturnType<typeof startMediaPipeClient>>

export interface StartMediaPipeClientOptions {
  port: number
  /** default: true */
  auto_install_playwright?: boolean
  /** default: true */
  headless?: boolean
  /** auto launch chromium browser if no instance provided */
  browser?: Browser
}

export async function startMediaPipeClient(
  options: StartMediaPipeClientOptions,
) {
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

  let browser =
    options.browser ?? (await chromium.launch({ headless: options.headless }))
  let page = await browser.newPage()
  await page.goto(`http://localhost:${port}`)

  async function stop() {
    await page.close()
    if (!options.browser) {
      await browser.close()
    }
    await new Promise<void>((resolve, reject) => {
      server.close(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  function attachImageDirection(options: {
    /** e.g. '/images' */
    url_prefix: string
    /** e.g. './uploads/' */
    directory: string
  }) {
    app.use(options.url_prefix, express.static(options.directory))
  }

  async function detectFaceLandmarks(
    options: DetectFaceLandmarksOptions,
  ): Promise<FaceLandmarkerResult> {
    return page.evaluate(options => {
      let win = window as any
      return win.detectFaceLandmarks(options)
    }, options)
  }

  return {
    attachImageDirection,
    detectFaceLandmarks,
    stop,
    close: stop,
    browser,
    page,
  }
}

export function installPlaywright() {
  execSync('npx playwright install chromium')
}
