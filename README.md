Bitcoin Payments
================

Use Case
--------
You want to accept a bitcoin payment from another party, programmatically. 

License
-------
UNLICENSED

Requirements
------------
Running bitcoin-qt (or even having it installed) is not necessary. 

How it Works
------------
You initiate a Payment, and then wait for it to be fulfilled and confirmed on the bitcoin network. Uses bitcoin-live-transactions (npm) to listen for transactions on the bitcoin network, bitcoinjs-lib and bitcore-lib to initiate transactions. The steps in usage are: 
- initiate payment to receive (specify expected amount) 
- temporary wallet address is created to receive this one and only payment 
- give the temporary wallet address to the payer 
- wait for event indicating that payment is detected (but not yet confirmed) 
- wait for event indicating that payment is confirmed 
- the payment is transferred from temporary wallet to another (specified) wallet (optional)

Options
-------
Can operate on testnet or mainnet. 

Usage 
-----
```javascript
const Payment = require('./index.js').Payment;

const payment = new Payment({
    amount: 0.0001,
    confirmations: 7,
    network: 'testnet',
    mainWallet: 'mysyjyXetrnkFwkvNmDjmtzC4YktgoGSfW',
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
```

