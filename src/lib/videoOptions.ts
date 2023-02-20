interface Resolution {
  name: string
  description: string
  scaleFactor: number
}


export const resolutions: Resolution[] = [
  {
    name: '480p',
    description: '640x480',
    scaleFactor: 0.44444444
  },
  {
    name: '720p',
    description: '1280x720',
    scaleFactor: 0.66666667
  },
  {
    name: '1080p',
    description: '1920x1080',
    scaleFactor: 1.0
  },
  {
    name: '4K',
    description: '3840x2160',
    scaleFactor: 2.0
  },
]
export const resolutionDefault = resolutions[2]


export interface VideoOptions {
  fps: number
  resolution: Resolution
  backgroundColor: string
  foregroundColor: string
}
