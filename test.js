'use strict'; 

require('dotenv').config();

//initiate a payment for 0.0001 bitcoin. 
//  - amount expected: 0.0001
//  - number of confirmations before payment is 'confirmed': 7 (default is 6)
//  - network is testnet (not mainnet) 
//  - mainWallet is specified; payment will be sent here once confirmed 
//  - 
const payment = new Payment({
    amount: 0.0001,
    confirmations: 7,
    mainWallet: 'mysyjyXetrnkFwkvNmDjmtzC4YktgoGSfW',
    testnet:true
});

//get temp wallet address by calling payment.getReceiverAddress()
console.log('waiting for payment of ' + payment.getExpectedAmount() + ' to ' + payment.getReceiverAddress()); 

//react to 'detected' event - payment of some amount has been made 
payment.on('detected', (payment) => {
    console.log('payment detected...');
    console.log('amount: ' + payment.amount); 
    console.log('confirmations: ' + payment.confirmations); 
    console.log('from: ' + payment.sender); 
});

//react to 'confirmed' event - payment has been made in full, and confirmed 
// will be sent to mainWallet now automatically, if mainWallet is specified in payment options
payment.on('confirmed', (payment) => {
    console.log('payment confirmed!');
    console.log('amount: ' + payment.amount); 
    console.log('confirmations: ' + payment.confirmations); 
    console.log('from: ' + payment.sender); 
});