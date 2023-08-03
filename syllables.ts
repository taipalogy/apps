import {
  getSyllablesStart,
  getSyllablesInclude,
  getSyllablesEnd,
} from '../taipa/src/util';

/**
 * > node path/to/getsyllables.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    console.log(getSyllablesInclude(data.toString().trim()));
    console.log(getSyllablesStart(data.toString().trim()));
    console.log(getSyllablesEnd(data.toString().trim()));
  }
});
