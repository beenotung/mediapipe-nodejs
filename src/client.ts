import {
  FaceLandmarker,
  FaceLandmarkerResult,
  FilesetResolver,
} from '@mediapipe/tasks-vision'

declare var image_list: HTMLElement

async function createFaceLandmarker(options: { numFaces: number }) {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    '/npm/@mediapipe/tasks-vision/wasm',
  )
  let faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `/saved_models/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'IMAGE',
    numFaces: options.numFaces,
  })
  return faceLandmarker
}

let faceLandmarkerCache = new Map<number, Promise<FaceLandmarker>>()

let getFaceLandmarker = (numFaces: number) => {
  let faceLandmarker = faceLandmarkerCache.get(numFaces)
  if (!faceLandmarker) {
    faceLandmarker = createFaceLandmarker({ numFaces })
    faceLandmarkerCache.set(numFaces, faceLandmarker)
  }
  return faceLandmarker
}

export type DetectFaceLandmarksOptions = {
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

async function detectFaceLandmarks(
  options: DetectFaceLandmarksOptions,
): Promise<FaceLandmarkerResult> {
  let num_faces = options.num_faces ?? 1
  let faceLandmarker = await getFaceLandmarker(num_faces)
  let image = document.createElement('img')
  image_list.textContent = ''
  image_list.appendChild(image)
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
    image.src = options.image_url
  })
  let target: HTMLImageElement | HTMLCanvasElement = image
  if (options.crop_region || options.rotation || options.draw_landmarks) {
    let crop_region = options.crop_region || {
      left: 0,
      top: 0,
      right: 1,
      bottom: 1,
    }
    let width = crop_region.right - crop_region.left
    let height = crop_region.bottom - crop_region.top
    let canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth * width
    canvas.height = image.naturalHeight * height
    let context = canvas.getContext('2d')!
    context.drawImage(
      image,
      image.naturalWidth * crop_region.left,
      image.naturalHeight * crop_region.top,
      image.naturalWidth * width,
      image.naturalHeight * height,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    if (options.rotation) {
      context.translate(canvas.width / 2, canvas.height / 2)
      context.rotate((options.rotation * Math.PI) / 180)
      context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
      context.rotate(-(options.rotation * Math.PI) / 180)
      context.translate(-canvas.width / 2, -canvas.height / 2)
    }

    image_list.appendChild(canvas)
    target = canvas
  }
  let results = faceLandmarker.detect(target)

  if (options.draw_landmarks) {
    let canvas = target as HTMLCanvasElement
    let context = canvas.getContext('2d')!
    context.strokeStyle = 'red'
    context.lineWidth = 2
    context.strokeRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'red'
    for (let faceLandmarks of results.faceLandmarks) {
      for (let landmark of faceLandmarks) {
        context.fillRect(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          5,
          5,
        )
      }
    }
  }

  return results
}

Object.assign(window, {
  detectFaceLandmarks,
})
