import {
  FaceLandmarker,
  FaceLandmarkerResult,
  FilesetResolver,
} from '@mediapipe/tasks-vision'

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

async function detectFaceLandmarks(options: {
  /** local url or internet url */
  image_url: string
  /** default: 1 */
  num_faces?: number
  /** area to crop for detection */
  regionOfInterest?: {
    left: number
    top: number
    right: number
    bottom: number
  }
  /** applied after crop region of interest */
  rotationDegrees?: number
}): Promise<FaceLandmarkerResult> {
  let num_faces = options.num_faces ?? 1
  let faceLandmarker = await getFaceLandmarker(num_faces)
  let image = document.createElement('img')
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
    image.src = options.image_url
  })
  let results = faceLandmarker.detect(image, {
    rotationDegrees: options.rotationDegrees,
    regionOfInterest: options.regionOfInterest,
  })
  return results
}

Object.assign(window, {
  detectFaceLandmarks,
})
