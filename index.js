const moralis = require('./moralis');
const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv')

const csv = require('csv-parser');

const chains = moralis.getChains();

const addresses = [];


const callWithDelay = (fn, delay) => {
    return new Promise((resolve, reject) => {
        console.log('executing ');
        setTimeout(() => {
            resolve(fn());
        }, delay);
    });
}

const main = async (addresses) => {
    let p = Promise.resolve();

    const data = [];

    chains.forEach(chain => {
        addresses.forEach((address) => {
            p = p.then(() => callWithDelay(() => {
                moralis.getNFTByAddress(address.address, chain).then(res => data.push(...res));
            }, 1000));
        });
    });

    try {
        p.then(() => {
            const csv = new ObjectsToCsv(data);

            csv.toDisk('./data/moralis/output.csv');
        });
    }
    catch (err) {
        console.log(err);
    }
}


fs.createReadStream('./data/input.csv')
  .pipe(csv())
  .on('data', (data) => addresses.push(data))
  .on('end', () => {
      console.log('done', addresses[0]);
        main(addresses.slice(0, 3));
  });