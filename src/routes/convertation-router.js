const express = require("express")
const config = require("config")
const multer = require("multer")
const fs = require("fs")
const audioVideoConverter = require("../audio-video-converter")
const pdfConverter = require("../pdf-converter")
const convertationRouter = express.Router()

const data = {
  audio: {
    title: "Аудиофайлы",
    outputFormats: "mp3, ogg",
    inputFormats: [".mp3", ".ogg"],
    icon: "/svg/audio.svg",
    hasProgress: true,
    availableConvertFormats: {
      mp3: ["ogg"],
      ogg: ["mp3"],
    },
  },
  video: {
    title: "Видеофайлы",
    outputFormats: "mp4, avi, mov",
    inputFormats: [".mp4", ".avi", ".mov"],
    icon: "/svg/video.svg",
    hasProgress: true,
    availableConvertFormats: {
      mp4: ["avi", "mov"],
      avi: ["mp4", "mov"],
      mov: ["mp4", "avi"],
    },
  },
  pdf: {
    title: "PDF файлы",
    outputFormats: "docx",
    inputFormats: [".pdf"],
    icon: "/svg/pdf.svg",
    hasProgress: false,
    availableConvertFormats: {
      pdf: ["docx"],
    },
  },
}

const activeConversions = new Map()
const upload = multer({ dest: "uploads/" })

const convertAudioVideo = (wss) => async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не найден" })
    return
  }
  const filePath = req.file.path
  const format = req.body.format
  const clientId = req.body.clientId

  try {
    const outputFilePath = filePath + "." + format

    // Добавление конвертации в список активных
    activeConversions.set(clientId, { filePath, outputFilePath })

    res.json({ message: "Началась конвертация файла" })
    await audioVideoConverter.convertToFormat(
      format,
      filePath,
      outputFilePath,
      (progress) => wss.sendProgress(progress, clientId)
    )
    await fs.unlink(filePath, (err) => {
      if (err) console.error(err)
    })

    const downloadLink = `/api/convertation/download/${clientId}`

    wss.sendLink(downloadLink, clientId)
  } catch (err) {
    console.error(err)
    wss.sendError(
      "Произошла ошибка при конвертации! Попробуйте позже!",
      clientId
    )
  }
}

const convertPdf = (wss) => async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не найден" })
    return
  }
  const filePath = req.file.path
  const format = req.body.format
  const clientId = req.body.clientId

  try {
    const outputFilePath = filePath + ".docx"

    // Добавление конвертации в список активных
    activeConversions.set(clientId, { filePath, outputFilePath })

    res.json({ message: "Началась конвертация файла" })
    await pdfConverter.convertPDFToDOCX(filePath, outputFilePath, (process) =>
      wss.sendProgress(process, clientId)
    )
    await fs.unlink(filePath, (err) => {
      if (err) console.error(err)
    })

    const downloadLink = `/api/convertation/download/${clientId}`

    wss.sendLink(downloadLink, clientId)
  } catch (err) {
    console.error(err)
    wss.sendError(
      "Произошла ошибка при конвертации! Попробуйте позже!",
      clientId
    )
  }
}

const creareconvertationRouter = (wss) => {
  convertationRouter.get("/", (req, res) => {
    res.json(data)
  })

  convertationRouter.get("/audio", (req, res) => {
    res.json(data.audio)
  })

  convertationRouter.get("/video", (req, res) => {
    res.json(data.video)
  })

  convertationRouter.get("/pdf", (req, res) => {
    res.json(data.pdf)
  })

  convertationRouter.post(
    "/audio",
    upload.single("file"),
    convertAudioVideo(wss)
  )
  convertationRouter.post(
    "/video",
    upload.single("file"),
    convertAudioVideo(wss)
  )

  convertationRouter.post("/pdf", upload.single("file"), convertPdf(wss))

  convertationRouter.get("/download/:clientId", (req, res) => {
    const clientId = req.params.clientId
    const conversion = activeConversions.get(clientId)

    if (conversion) {
      const outputFilePath = conversion.outputFilePath
      console.log(outputFilePath)
      res.download(outputFilePath, (err) => {
        if (err) {
          console.error(err)
          res
            .status(500)
            .json({ error: "Произошла ошибка при отправке файла." })
        }

        fs.unlink(outputFilePath, (err) => {
          if (err) console.error(err)
          activeConversions.delete(clientId)
        })
      })
    } else {
      res.status(404).json({ error: "Файл не найден." })
    }
  })

  return convertationRouter
}

module.exports = creareconvertationRouter
