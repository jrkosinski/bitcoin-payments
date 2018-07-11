'use strict'; 

require('dotenv').config();

const Payment = require('./index.js').Payment;

const payment = new Payment({
    amount: 0.001,
    confirmations: 7,
    network: 'testnet',
    mainWallet: null,
    testnet:true
});

console.log('waiting for payment of ' + payment.getExpectedAmount() + ' to ' + payment.getReceiverAddress()); 

payment.on('detected', (payment) => {
    console.log('payment detected...');
    console.log('amount: ' + payment.amount); 
    console.log('confirmations: ' + payment.confirmations); 
    console.log('from: ' + payment.sender); 
});

payment.on('confirmed', (payment) => {
    console.log('payment confirmed!');
    console.log('amount: ' + payment.amount); 
    console.log('confirmations: ' + payment.confirmations); 
    console.log('from: ' + payment.sender); 
});