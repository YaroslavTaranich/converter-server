const ffmpeg = require("fluent-ffmpeg");
const installer = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("ffprobe-static");

ffmpeg.setFfmpegPath(installer.path);
ffmpeg.setFfprobePath(ffprobe.path);

class Converter {
  async getVideoFrameCount(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const videoStream = metadata.streams.find(
            (stream) => stream.codec_type === "video"
          );
          const frameCount = videoStream.nb_frames;
          resolve(frameCount);
        }
      });
    });
  }

  async convertToFormat(format, inputFilePath, outputFilePath, onProgress) {
    const totalFrames = await this.getVideoFrameCount(inputFilePath);
    console.log(totalFrames, " frames");

    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .toFormat(format)
        .on("progress", (progress) => {
          onProgress(Math.floor((progress.frames / totalFrames) * 100)); // sending % of progress
        })
        .on("error", (err) => reject(err))
        .on("end", () => resolve(outputFilePath))
        .save(outputFilePath);
    });
  }
}

module.exports = new Converter();
