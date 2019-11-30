const tesseract = require('node-tesseract-ocr');
class getMatriculaService {
  async run(conteudo) {
    const result = await tesseract.recognize(filename, {
      lang: 'por',
      oem: 1,
      psm: 11,
    });
    const arrDoc = result.split('\r\n');

    console.log('getMatriculaService' + arrDoc.length);
    return 'matricula';
  }
}

module.exports = new getMatriculaService();
