const AYLIENTextAPI = require('aylien_textapi');
const axios = require('axios');
const util = require('util');

const textapi = new AYLIENTextAPI({
  application_id: '1345024e',
  application_key: '6c61eda0073abfa9b1878203cd1c1196',
});

const url = 'https://api.aylien.com/api/v1/entities';

class getNomeService {
  async run(data) {
    let indexName = data.toLowerCase().search('proprietária');
    if (indexName === -1) {
      indexName = data.toLowerCase().search('proprietário');
    } else if (indexName === -1) {
      indexName = data.toLowerCase().search('proprietários');
    }
    let name = data.slice(indexName).split(':-');

    if (name.length === 1) {
      name = data.slice(indexName).split(':');
    }
    console.log('name', name[1]);

    const readNamePromise = (...args) => {
      return new Promise((resolve, reject) => {
        textapi.entities(...args, (error, response) => {
          if (!error) {
            resolve(response);
          }
        });
      });
    };
    const arrNames = await readNamePromise({
      text: name[1],
      language: 'pt',
    });

    const { person } = arrNames.entities;

    const formatString = dado => {
      console.log('dados', dado);
      const ret = dado
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f\u00E7\u0026\u00B4\u0022\u201C\u201D\u2018\u2019\u201A\u201E\u00BA\u0027]/g,
          ''
        );
      return ret;
    };
    let names = [];
    if (person) {
      person.forEach(name => {
        const isNumber = name.replace(/[^0-9]/g, '');
        if (name === name.toUpperCase() && isNumber === '') {
          names.push(formatString(name));
        }
      });
    } else {
      return null;
    }

    const unique = (value, index, self) => {
      return self.indexOf(value) === index;
    };

    return names
      .filter(unique)
      .filter(name => name.toLowerCase() !== 'yates')
      .join(',');
  }
}

module.exports = new getNomeService();
