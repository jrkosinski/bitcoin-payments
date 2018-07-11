'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const BLT = require('bitcoin-live-transactions');
const bitcore = require('bitcore-lib'); 
const transaction = require('bitcoin-transaction'); 
const btcAddrGen = require('btc-address-generator'); 
const events = require('events'); 

const exception = require('../common/exceptions')('PAY'); 

const DEFAULT_MIN_CONFIRMATIONS = 6; 
const DEBUG = true;

//state of the instance enum 
const paymentState = {
    initialized: 'initialized', 
    detected : 'detected',
    confirmed : 'confirmed'
}; 

/**
 * Payment 
 * 
 * Encapsualates a payment to be received and confirmed. Creating an instance automatically 
 * generates a new payment address (unless a payment address is specified in the constructor options, 
 * in which case that one is used and no new one is created). 
 * 
 * Provide an expected amount upon creation. A min number of confirmations is optional, as is a 
 * receiver address. 
 * 
 * Usage: 
 * - construct the instance 
 * - subscribe to events and wait for payment 
 * 
 * Payment is 'confirmed' when (a) a payment has been received at the receiver address in the amount 
 * expected, and (b) the min number of confirmations above that transaction (or transactions) has 
 * been met. 
 * 
 * Events: 
 *  detected: fired when a payment to the receiver address is detected 
 *  confirmed: fired when all requires to confirm the payment have been met 
 * 
 * @param {json} options 
 *  see constructor 
 */
function Payment(options) {
    const _this = this;
    const _event = new events.EventEmitter(); 
    const _transactions = {};

    let _expectedAmount = 0; 
    let _minConfirmations = DEFAULT_MIN_CONFIRMATIONS;
    let _receiverAddress = null; 
    let _blt = null; 
    let _state = null; 
    let _totalReceived = 0; 
    let _options = options;

    /**
     * constructor 
     * 
     * @param {json} options
     *  amount (float): the expected amount to be received
     *  confirmations (uint): the min number of confirmations to accept the payment (optional)
     *  testnet (boolean): if true, all transactions are on testnet (default: false)
     *  mainWallet (string): (optional) the wallet to which to send balance upon successful confirmation 
     */
    const init = async((options) => {
        if (options) {
            if (options.amount) {
                _this.setExpectedAmount(options.amount);
            }
            if (options.confirmations) {
                _this.setMinConfirmations(options.confirmations);
            }
            _receiverAddress = generateAddress(); 
        }

        if (await(startListening())) {
            _state = paymentState.initialized;
        }
    }); 

    /**
     * log in debug mode 
     */
    const debugLog = (s) => {
        if (DEBUG) 
            console.log(s); 
    }; 

    /**
     * generates a new address for receiving payment
     * 
     * @returns
     *  address public key 
     */
    const /*string*/ generateAddress = () => {
        return exception.try(() => {
            const addr = btcAddrGen({network:_this.getNetworkName()}); 
            return addr.address; 
        }); 
    }; 

    /**
     * starts listening for payment activity on the bitcoin network
     * 
     * @returns 
     *  a boolean indicating success or failure to connect & begin listening 
     */
    const /*bool*/ startListening = () => {
        return new Promise((resolve, reject) => {
            exception.try(() => {
                //connect to bitcoin 
                _blt = new BLT(); 
                _blt.events.on('connected', () => {
                    debugLog('connected to ' + (_options.testnet ? 'testnet' : 'mainnet') + ' network'); 
                    debugLog('listening...'); 

                    _blt.events.on(_receiverAddress, (tx) => {
                        onPaymentDetected(tx);
                    });
                    resolve(true);
                }); 

                //hack blt to allow testnet 
                if (_options.testnet) {
                    _blt.insight_servers = ["https://test-insight.bitpay.com/"];
                    _blt.insight_apis_servers = ["https://test-insight.bitpay.com/api/"]; 
                }
                _blt.connect(); 
            }, { onError: (e) => {reject(e);}}); 
        });
        
        return exception.try(() => {
            _blt = new BLT(); 
            _blt.connect()
        });
    }; 

    /**
     * parses & stores a transaction received from bitcoin-live-transactions 
     * 
     * @param {transaction} tx 
     */
    const addTransaction = (tx) => {
        exception.try(() => {
            if (tx.amount)
                _totalReceived += tx.amount;

            if (tx.txid) {
                _transactions[tx.txid] = {
                    amount: tx.amount
                }
            }

            if (tryConfirmPayment()) {
                onPaymentConfirmed(); 
            }
        }); 
    }; 

    /**
     * attempts to determine whether or not the full payment is complete & confirmed
     * 
     * @returns
     *  true if confirmed 
     */
    const /*bool*/ tryConfirmPayment = () => {
        return exception.try(() => {
            let complete = false; 

            if (_totalReceived) {
                complete = (_totalReceived >= _expectedAmount);
            }
            else if (_transactions) {
                let total = 0; 
                for (let txid in _transactions) {
                    total += _transactions[txid].amount;
                }
                complete = (total >= _expectedAmount);

                if (complete)
                    _totalReceived = total; 
            }

            //TODO: count num confirmations 
            return complete;
        });
    }; 

    /**
     * called privately upon first detection of the payment 
     */
    const onPaymentDetected = (tx) => {
        exception.try(() => {            
            debugLog('transaction detected: ' + JSON.stringify(tx)); 
            addTransaction(tx); 
            _state = paymentState.detected;

            //TODO: event args
            _event.emit('detected', tx); 
        });
    };

    /**
     * called privately upon successful confirmation of the payment 
     */
    const onPaymentConfirmed = () => {
        exception.try(() => {
            _state = paymentState.confirmed;

            //TODO: event args
            _event.emit('confirmed', { amount: 0, confirmations: 0}); 

            //if specified, transfer full amount to main wallet when done 
            if (_options && _options.mainWallet) {
                transfer(_options.mainWallet); 
            }
        });
    };

    /**
     * transfers all received funds to a different wallet 
     * 
     * @param {string} receiver
     *  the wallet to which to send 
     */
    const transfer = async((receiver) => {
        return exception.try(() => {
            const balance = await(transaction.getBalance(_receiverAddress, {network: _this.getNetworkName()})); 

            if (balance) {
                transaction.sendTransaction({
                    from: _receiverAddress,
                    to:receiver,
                    privKeyWIF: '',
                    btc: balance, 
                    network: _this.getNetworkName()
                })
            }
        }); 
    }); 

    //property getters 
    /*float*/ this.getExpectedAmount = () => { return _expectedAmount;}; 
    /*uint*/ this.getMinConfirmations = () => { return _minConfirmations;}; 
    /*string*/ this.getReceiverAddress = () => { return _receiverAddress;}; 
    /*string*/ this.getNetworkName = () => { return _options && _options.testnet ? 'testnet': 'mainnet';};

    //property setters 
    /*float*/this.setExpectedAmount = (value) => { _expectedAmount = value; return _expectedAmount;}; 
    /*uint*/ this.setMinConfirmations = (value) => { _minConfirmations = value; return _minConfirmations;}; 

    /**
     * subscribes to an event 
     * 
     * @param {string} event 
     *  the event name 
     * @param {function} handler 
     *  function to handle event
     */
    this.on = (event, handler) => {
        _event.on(event, handler); 
    }; 

    /**
     * unsubscribes from an event 
     * 
     * @param {string} event 
     *  the event name 
     * @param {function} handler 
     *  function to handle event
     */
    this.off = (event, handler) => {
        _event.removeListener(event, handler);
    }; 

    /**
     * releases any held resources; disposes the instance 
     */
    this.dispose = () => {
        exception.try(() => {
            _event.removeAllListeners(); 
        });
    };

    /**
     * cancels a waiting payment; stops listening for updates 
     */
    this.cancel = () => {
        this.dispose(); 
    }; 

    init(options); 
}

module.exports = {
    Payment: Payment, 
    paymentState: paymentState
}