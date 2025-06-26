# mediapipe-nodejs

A Node.js library for running MediaPipe models that are typically browser-only. This package uses a local Express (web) server and Playwright (headless browser) to bridge the gap between Node.js and MediaPipe's browser-based APIs.

[![npm Package Version](https://img.shields.io/npm/v/mediapipe-nodejs)](https://www.npmjs.com/package/mediapipe-nodejs)
[![npm Package Downloads](https://img.shields.io/npm/dm/mediapipe-nodejs)](https://www.npmtrends.com/mediapipe-nodejs)

Currently supports:

- **Face Landmarker** - Detect facial landmarks and features

More MediaPipe models will be added over time.

## Features

- Typescript support
- Isomorphic package: works in Node.js and browsers

## Installation

```bash
npm install mediapipe-nodejs
```

You can also install `mediapipe-nodejs` with [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [slnpm](https://github.com/beenotung/slnpm)

## Usage Example

```typescript
import { startClient } from 'mediapipe-nodejs'

async function detectFaces() {
  // Start the MediaPipe client
  const mediapipe = await startClient({
    port: 8560,
    headless: true,
  })

  // Serve images from a directory
  mediapipe.attachImageDirection({
    url_prefix: '/images',
    directory: './uploads',
  })

  // Detect face landmarks and face blendshapes
  const result = await mediapipe.detectFaceLandmarks({
    image_url: '/images/face.jpg',
    num_faces: 1,
    draw_landmarks: true,
  })

  console.log('Faces detected:', result.faceLandmarks.length)

  // Clean up
  await mediapipe.close()
}
```

Complete usage example see [test.ts](./src/test.ts)

## Typescript Signature

```typescript
import { FaceLandmarkerResult } from '@mediapipe/tasks-vision'

interface StartMediaPipeClientOptions {
  port: number
  /** default: true */
  auto_install_playwright?: boolean
  /** default: true */
  headless?: boolean
  /** auto launch chromium browser if no instance provided */
  browser?: Browser
}

function startMediaPipeClient(
  options: StartMediaPipeClientOptions,
): Promise<MediaPipeClient>

interface MediaPipeClient {
  attachImageDirection(options: {
    /** e.g. '/images' */
    url_prefix: string
    /** e.g. './uploads/' */
    directory: string
  }): void

  detectFaceLandmarks(
    options: DetectFaceLandmarksOptions,
  ): Promise<FaceLandmarkerResult>

  /** alias: stop, close */
  stop(): Promise<void>
  close(): Promise<void>
}

interface DetectFaceLandmarksOptions {
  /** local url or internet url */
  image_url: string
  /** default: 1 */
  num_faces?: number
  /** area to crop for detection, coordinates are in [0,1] with 'left' < 'right' and 'top' < 'bottom' */
  crop_region?: {
    left: number
    top: number
    right: number
    bottom: number
  }
  /** applied after crop region of interest, in degrees */
  rotation?: number
  /** for debugging, default: false */
  draw_landmarks?: boolean
}
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
