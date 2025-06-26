import { startClient } from './server'

async function main() {
  let mediapipe = await startClient({
    port: 8560,
    headless: true,
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
    // rotation: -90,
    draw_landmarks: true,
  })
  console.log('number of faces:', result.faceLandmarks.length)
  await mediapipe.close()
}
main().catch(e => console.error(e))
