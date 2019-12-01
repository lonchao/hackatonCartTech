const fs = require('fs');
var path = require('path');
const tesseract = require('node-tesseract-ocr');
const { document } = require('../models');
const getNomeService = require('../services/getNomeService');
const getMatriculaService = require('../services/getMatriculaService');
const Sequelize = require('sequelize');

const config = require('../../config/database.js');

const sequelize = new Sequelize(config);

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
      const name = await getNomeService.run(result);
      // console.log(document);
      const matriculaRes = await getMatriculaService.run(filename, result);
      let confiavel = filename.indexOf(matriculaRes) > -1 ? 100 : 0;

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
      confiavel = !name || name.trim() === '' ? confiavel - 30 : confiavel;
      // console.log(tipoStr);
      document.create({
        matricula: matriculaRes,
        nome_arquivo: filename,
        nome: name || '',
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
  async list(req, res) {
    // const { folder } = req.body;

    let objFilter = {};

    if (req.query.matricula) {
      objFilter.matricula = req.query.matricula.replace(/\./, '');
    }

    const Op = Sequelize.Op;

    if (req.query.nome) {
      objFilter.nome = { [Op.like]: '%' + req.query.nome + '%' };
    }
    if (req.query.documento) {
      objFilter.documento = req.query.documento
        .replace(/\./, '')
        .replace(/\-/, '')
        .replace(/\//, '');
    }
    if (req.query.palavra) {
      objFilter.conteudo = { [Op.like]: '%' + req.query.palavra + '%' };
    }

    // const items = await sequelize.query('SELECT * FROM documents where 1=1 ');
    // console.log(ret2);
    const items = await document.findAll({
      where: objFilter,
    });
    // if (await User.findOne({ email })) {
    //   return res.status(400).json({ error: 'User alredy exists' });
    // }
    // const user = await User.create(req.body);
    return res.json({ status: 'success', items });
  }
  async get(req, res) {
    // console.log(req.params.id);
    if (!req.params.id) {
      return res.status(400).json({ error: 'Item not found' });
    }
    const item = await document.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!item) {
      return res.status(400).json({ error: 'Item not found' });
    }

    return res.json({ status: 'success', item });
  }
  async export(req, res) {
    // console.log(req.params.id);
    if (
      !req.params.format ||
      (req.params.format !== 'json' && req.params.format !== 'csv')
    ) {
      return res.status(400).json({ error: 'invalid format' });
    }

    const items = await document.findAll();
    if (!items) {
      return res.status(400).json({ error: 'Item not found' });
    }
    if (req.params.format === 'json') {
      return res.json({ status: 'success', items });
    } else {
      console.log(items.length);
      let str = '';
      str += 'id;';
      str += 'matricula;';
      str += 'tipo;';
      str += 'nome;';
      str += 'documento;';
      str += '\r\n';
      items.forEach((item, index) => {
        str += index + ';';
        str += item.matricula || '' + ';';
        str += item.tipo || '' + ';';
        str += item.nome || '' + ';';
        str += item.documento || '' + ';';
        str += '\r\n';
      });

      res.setHeader(
        'Content-disposition',
        'attachment; filename=matriculas.csv'
      );
      res.set('Content-Type', 'text/csv');
      return res.status(200).send(str);
    }
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
