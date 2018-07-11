'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const BLT = require('bitcoin-live-transactions');
const bitcore = require('bitcore-lib'); 
const btcAddrGen = require('btc-address-generator'); 
const events = require('events'); 

const exception = require('../common/exceptions')('PAY'); 

const DEFAULT_MIN_CONFIRMATIONS = 6; 

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
     *  amount: the expected amount to be received
     *  confirmations: the min number of confirmations to accept the payment (optional)
     *  receiver: the receiver's address (optional; if not provided one will be created)
     */
    const init = async((options) => {
        if (options) {
            if (options.amount) {
                _this.setExpectedAmount(options.amount);
            }
            if (options.confirmations) {
                _this.setMinConfirmations(options.confirmations);
            }
            if (options.receiver) {
                _receiverAddress = receiver;
            } else { 
                _receiverAddress = generateAddress(); 
            }
        }

        if (await(startListening())) {
            _state = paymentState.initialized;
        }
    }); 

    /**
     * generates a new address for receiving payment
     * 
     * @returns
     *  address public key 
     */
    const /*string*/ generateAddress = () => {
        return exception.try(() => {
            const addr = btcAddrGen(); 
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
                    _blt.events.on(_receiverAddress, (tx) => {
                        onPaymentDetected(tx);
                    });
                    resolve(true);
                }); 
                _blt.connect(); 
            }, { onError: (e) => {reject(e);}}); 
        });
        
        return exception.try(() => {
            _blt = new BLT(); 
            _blt.connect()
        });
    }; 

    const addTransaction = (tx) => {
        exception.try(() => {
            if (tx.amount)
                _totalReceived += tx.amount;

            if (tx.txid) {
                _transactions[tx.txid] = {

                }
            }
        }); 
    }; 

    const /*bool*/ tryConfirmPayment = () => {
        return exception.try(() => {

        });
    }; 

    /**
     * called privately upon first detection of the payment 
     */
    const onPaymentDetected = () => {
        exception.try(() => {            
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
                //TODO: transfer to main wallet 
            }
        });
    };

    //property getters 
    /*float*/ this.getExpectedAmount = () => { return _expectedAmount;}; 
    /*uint*/ this.getMinConfirmations = () => { return _minConfirmations;}; 
    /*string*/ this.getReceiverAddress = () => { return _receiverAddress;}; 

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

    init(options); 
}

module.exports = {
    Payment: Payment, 
    paymentState: paymentState
}