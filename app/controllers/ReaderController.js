const fs = require('fs');
var path = require('path');
const tesseract = require('node-tesseract-ocr');
const { document } = require('../models');
const getNomeService = require('../services/getNomeService');
const getMatriculaService = require('../services/getMatriculaService');
class ReaderController {
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
        psm: 3,
      });
      getNomeService.run(result);
      // console.log(document);
      const matriculaRes = getMatriculaService.run(result);
      console.log(matriculaRes);
      document.create({
        matricula: matriculaRes,
        nome_arquivo: filename,
        conteudo: result,
      });
    }
    console.log('####');
    // const { folder } = req.body;
    // if (await User.findOne({ email })) {
    //   return res.status(400).json({ error: 'User alredy exists' });
    // }
    // const user = await User.create(req.body);
    // return res.json({ status: 'success' });
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
