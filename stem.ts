import { getStem, getDesinence } from '../taipa/src/util';

/**
 * > node path/to/stem.js
 */

const stdin = process.openStdin();

stdin.addListener('data', function (data) {
  if (process.argv.length == 2) {
    const stem = getStem(data.toString().trim());
    console.info('stem: ' + stem);

    const desinence = getDesinence(data.toString().trim());
    console.info('desinence: ' + desinence);
  }
});
