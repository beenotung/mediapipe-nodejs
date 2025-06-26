import { startMediaPipeClient } from './server'

async function main() {
  let headless = true
  // headless = false
  let mediapipe = await startMediaPipeClient({
    port: 8560,
    headless,
  })

  mediapipe.attachImageDirection({
    url_prefix: '/images',
    directory: './res',
  })

  let result = await mediapipe.detectFaceLandmarks({
    image_url: '/images/demo.jpg',
    num_faces: 1,
    crop_region: {
      left: 0.7,
      right: 0.8,
      top: 0.05,
      bottom: 0.18,
    },
    rotation: -45,
    draw_landmarks: true,
    draw_style: '#55ff55',
    draw_size: 2,
    draw_bounding_box: true,
  })
  console.log('number of faces:', result.faceLandmarks.length)
  if (headless) {
    await mediapipe.close()
  }

  if (result.faceLandmarks.length == 0) {
    throw new Error('no face found')
  }
}
main().catch(e => console.error(e))
