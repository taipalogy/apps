import { inflectDesinence } from '../taipa/src/change/inflector';

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const lexeme = inflectDesinence(data.toString().trim());

    //lexeme.getForms()[0].literal;
    lexeme.getForms().map((v) => console.info('inflected form:' + v.literal));
  }
});
