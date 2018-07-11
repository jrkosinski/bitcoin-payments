'use strict'; 

require('dotenv').config();

const Payment = require('./index.js').Payment;

const payment = new Payment({
    receiver: null, 
    amount: 0.001,
    confirmations: 7
});

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