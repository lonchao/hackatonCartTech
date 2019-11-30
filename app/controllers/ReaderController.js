const fs = require('fs');
var path = require('path');
const tesseract = require('node-tesseract-ocr');
const { document } = require('../models');
const getNomeService = require('../services/getNomeService');
const getMatriculaService = require('../services/getMatriculaService');
class ReaderController {
  async readAll(arrAll) {
    for (let i = 0; i < arrAll.length; i++) {
      console.log(await this.read('./tmp/' + arrAll[i]));
    }
  }
  async read(filename) {
    const ext = path.extname(filename);
    if (
      fs.existsSync(filename) &&
      (ext.toLowerCase() === '.tif' || ext.toLowerCase() === '.pdf')
    ) {
      console.log('1 - ' + filename + ' - added.');

      const result = await tesseract.recognize(filename, {
        lang: 'por',
        oem: 1,
        psm: 12,
      });
      getNomeService.run(result);
      // console.log(document);
      const matriculaRes = await getMatriculaService.run(filename, result);
      const confiavel = filename.indexOf(matriculaRes) > -1 ? 100 : 0;
      const tipo =
        result.toLowerCase().indexOf('compra e venda') > -1
          ? 'Compra e Venda'
          : '';
      document.create({
        matricula: matriculaRes,
        nome_arquivo: filename,
        conteudo: result.trim(),
        tipo: tipo,
        confiavel: confiavel,
      });
    }
    console.log('####');
    // const { folder } = req.body;
    // if (await User.findOne({ email })) {
    //   return res.status(400).json({ error: 'User alredy exists' });
    // }
    // const user = await User.create(req.body);
    return 'ENDED - ' + filename;
  }
}
//   async read(req, res) {
//     // const { folder } = req.body;
//     // if (await User.findOne({ email })) {
//     //   return res.status(400).json({ error: 'User alredy exists' });
//     // }
//     // const user = await User.create(req.body);
//     return res.json({ status: 'success' });
//   }
// }

module.exports = new ReaderController();
