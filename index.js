'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const BLT = require('bitcoin-live-transactions');
const bitcore = require('bitcore-lib'); 

//TODO: 
// - generate on-the-fly address
// - listen for number of confirmations 
// - transfer back into main wallet when done 

module.exports = {
    Payment: require('./classes/Payment')
}; 