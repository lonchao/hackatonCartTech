const fs = require('fs');
var path = require('path');
const tesseract = require('node-tesseract-ocr');
const { document } = require('../models');
const getNomeService = require('../services/getNomeService');
const getMatriculaService = require('../services/getMatriculaService');

const tipos = [
  'Abertura de Matrícula',
  'Compra e Venda',
  'Abertura com Enfiteuta',
  'Abertura de Usucapião',
  'Alienação Fiduciária',
  'Área de Preservação Ambiental',
  'Atribuição',
  'Cadastro',
  'Cancelamento de Ônus',
  'Casamento Nome Conjuge',
  'Casamento que Não Transmite',
  'Compromisso de Compra e Venda',
  'Construção',
  'Dação em Pagamento',
  'Divisão Amigável',
  'Divórcio',
  'Hipoteca Cedular Lv 02',
  'Integralização de Capital Social',
  'Logradouro',
  'Partilha Herança',
  'Regularização Fundiária',
  'Restrições Urbanísticas',
  'Retificação da Pessoa',
  'Retificação Enfiteutica',
  'Transporte de Hipoteca',
  'Usucapião',
];
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

      let resMaps = tipos.map(item => {
        const pos = result.toLowerCase().indexOf(item.toLowerCase());
        return pos > -1 ? { pos: pos, item: item } : null;
      });
      resMaps = resMaps.filter(item => {
        return item;
      });
      resMaps = resMaps.filter((a, b) => {
        if (a.pos < b.pos) {
          return a;
        } else {
          return b;
        }
      });
      let tipoStr = '';
      resMaps.forEach((item, index) => {
        if (index > 0) {
          tipoStr += ', ';
        }
        tipoStr += item.item;
      });
      confiavel = tipoStr === '' ? confiavel - 10 : confiavel;
      console.log(tipoStr);
      document.create({
        matricula: matriculaRes,
        nome_arquivo: filename,
        conteudo: result.trim(),
        tipo: tipoStr,
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
