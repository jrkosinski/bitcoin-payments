'use strict'; 

const rbuffer = require('random-buffer');

function generateRandomAddress() {
    //return Buffer.from('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'); 
    return rbuffer(32);
}

module.exports = {
    generateRandom: generateRandomAddress
}; 