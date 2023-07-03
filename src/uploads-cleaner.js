const fs = require("fs")
const path = require("path")

const folderPath = path.resolve(__dirname, "./uploads")

const startUploadsCleaner = () => {
  setInterval(() => {
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Ошибка чтения папки:", err)
        return
      }

      files.forEach((file) => {
        const filePath = path.join(folderPath, file)

        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error("Ошибка получения информации о файле:", err)
            return
          }

          const creationTime = stats.ctime.getTime()
          const currentTime = Date.now()
          const elapsedTime = currentTime - creationTime
          const elapsedHours = Math.floor(elapsedTime / (1000 * 60 * 60))

          if (elapsedHours > 6) {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error("Ошибка удаления файла:", err)
              } else {
                console.log(`Файл ${filePath} успешно удалён.`)
              }
            })
          }
        })
      })
    })
  }, 60 * 60 * 1000) // Проверка каждый час
}

module.exports = startUploadsCleaner
