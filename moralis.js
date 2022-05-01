const axios = require('axios');
const fs = require('fs');

exports.getChains = () => {
    let data = null;
    
    try{
        data = fs.readFileSync('./data/moralis/chains.json', 'utf8');
    }
    catch (err) {
        console.log('./data/moralis/chains.json not found');
    }

    if(data) {
        console.log('chains.json found');
        return JSON.parse(data);
    }

    return [];
}

exports.getNFTByAddress = async (address, chain) => {
    console.log('getNFTByAddress', address, chain);
    
    const url = 'https://deep-index.moralis.io/api/v2/' + address + '/nft';
    
    const headers = {
        'X-API-Key': process.env.MORALIS_KEY
    };

    const params = {
        chain,
        format: 'decimal'
    };
    
    try {
        console.log('Getting NFTs from API...');
        const response = await axios.get(url, { headers, params });
        
        let pair_response = {};

        try {
            const pair_url = 'https://deep-index.moralis.io/api/v2/' + address + '/reserves';

            const res = await axios.get(pair_url, { headers, params });
            pair_response = res.data;
        }
        catch (err) {
            console.log('Error getting reserves: ' + err.message);
            pair_response = {};
        }

        console.log('Got NFTs from API');
        const data = response.data.result.map(nft => ({
            chain: chain,
            address: address,
            name: nft.name,
            amount: nft.amount,
            symbol: nft.symbol,
            token_address: nft.token_address,
            owner_of: nft.owner_of,
            block_number: nft.block_number,
            block_number_minted: nft.block_number_minted,
            reserve0: pair_response.reserve0,
            reserve1: pair_response.reserve1
        }));

        return data;
    }
    catch (err) {
        console.log('Could Not Get from API ' + err.message);
        return null;
    }
}