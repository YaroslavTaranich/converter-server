const fs = require('fs');
const config = require('config')
const {WordsApi, ConvertDocumentRequest} = require('asposewordscloud');


class PdfConverter {
    constructor() {
        this.wordsApi = new WordsApi(config.get("ASPOSE_CLIENT_ID"), config.get("ASPOSE_CLIENT_SECRET"));
    }

    async convertPDFToDOCX(inputPath, outputPath) {
        return new Promise(async (resolve, reject) => {
            try {
                const request = new ConvertDocumentRequest({
                    format: "docx",
                    document: fs.createReadStream(inputPath),
                });

                const result = await this.wordsApi.convertDocument(request)
                await fs.writeFile(outputPath, result.body, err => {
                    reject(err)
                })
                resolve(outputPath)
                console.log('Конвертация завершена!');

            } catch (e) {
                console.error("Ошибка при конвертации PDF to docx: ", e.message)
                reject(e)
            }
        })
    }
}

module.exports = new PdfConverter;