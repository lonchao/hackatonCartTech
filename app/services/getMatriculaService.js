const tesseract = require('node-tesseract-ocr');
class getMatriculaService {
  async run(filename, conteudo) {
    const result = await tesseract.recognize(filename, {
      lang: 'por',
      oem: 1,
      psm: 11,
    });
    let already = [];
    let correctNumber;
    const arrDoc = result.split('\n').filter(line => {
      // console.log(
      //   '|' + line + '|' + isNaN(line) + '|' + parseInt(line.replace(/\./, ''))
      // );
      if (
        !line ||
        isNaN(line) ||
        line.trim() === '' ||
        parseInt(line.replace(/\./, '')) < 50
      ) {
        return false;
      }
      if (already.find(item => item === line) && !correctNumber) {
        correctNumber = line;
      } else {
        already.push(line);
      }
      // console.log(line);

      return true;
    });
    // const arrDoc2 = result.split('\r');
    if (!correctNumber && arrDoc.length > 0) {
      correctNumber = arrDoc.reduce(function(a, b) {
        if (parseInt(a.replace(/\./, '')) > parseInt(b.replace(/\./, ''))) {
          return a;
        } else {
          return b;
        }
        // return Math.max(a, b);
      });
      // correctNumber = arrDoc[arrDoc.length - 1];
    }
    console.log('correctNumber', correctNumber);
    console.log('arrDoc', arrDoc);
    // console.log('getMatriculaService  - ' + arrDoc.length);
    // console.log('getMatriculaService2  - ' + arrDoc2.length);
    return correctNumber ? correctNumber.split('.').join('') : 0;
  }
}

module.exports = new getMatriculaService();
