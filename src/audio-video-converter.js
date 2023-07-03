const ffmpeg = require("fluent-ffmpeg")
const installer = require("@ffmpeg-installer/ffmpeg")
const ffprobe = require("ffprobe-static")

ffmpeg.setFfmpegPath(installer.path)

ffmpeg.setFfprobePath(ffprobe.path)

const timeToSeconds = (time) => {
  const array = time.split(":")
  let result = 0
  for (let i = array.length - 1; i >= 0; i--) {
    result += Number(array[i]) * 60 ** (array.length - i - 1)
  }
  return result
}

class MediaConverter {
  getTotalSeconds(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }
        resolve(metadata.format.duration)
      })
    })
  }

  async convertToFormat(format, inputFilePath, outputFilePath, onProgress) {
    const totalSeconds = await this.getTotalSeconds(inputFilePath)
    return new Promise((resolve, reject) => {
      try {
        ffmpeg(inputFilePath)
          .toFormat(format)
          .on("progress", (progress) => {
            onProgress(
              Math.floor(
                // sending % of progress
                (timeToSeconds(progress.timemark) / totalSeconds) * 100
              )
            )
          })
          .on("error", (err) => reject(err))
          .on("end", () => resolve(outputFilePath))
          .save(outputFilePath)
      } catch (e) {
        console.error("Ошибка при конвертации: ", e.message)
      }
    })
  }
}

module.exports = new MediaConverter()
