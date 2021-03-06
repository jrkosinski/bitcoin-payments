'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const BLT = require('bitcoin-live-transactions');
const bitcore = require('bitcore-lib'); 

//TODO: 
// - listen for number of confirmations 
// - transfer back into main wallet when done 
// - allow transaction to be saved so that it can be restored 

const payment = require('./classes/Payment');

module.exports = {
    Payment: payment.Payment,
    paymentState: payment.paymentState
}; 