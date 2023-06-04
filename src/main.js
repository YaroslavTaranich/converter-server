const express = require("express");
const multer = require("multer");
const fs = require("fs");
const converter = require("./converter");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Файл не найден" });
    return;
  }
  const filePath = req.file.path;
  const format = req.body.format;

  try {
    const outputFilePath = filePath + "." + format;

    await converter.convertToFormat(format, filePath, outputFilePath);

    res.download(outputFilePath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Произошла ошибка при отправке файла." });
      }

      fs.unlink(filePath, (err) => {
        if (err) console.error(err);
      });
      fs.unlink(outputFilePath, (err) => {
        if (err) console.error(err);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Произошла ошибка при конвертации файла." });
  }
});

app.listen(3333, () => {
  console.log("Сервер запущен на порту 3333");
});
