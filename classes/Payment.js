'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');
const BLT = require('bitcoin-live-transactions');
const bitcore = require('bitcore-lib'); 
const events = require('events'); 
const exception = require('./common/exceptions')('PAY'); 

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

    let _expectedAmount = 0; 
    let _minConfirmations = 6;
    let _receiverAddress = null; 

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

    /**
     * constructor 
     * 
     * @param {json} options
     *  amount: the expected amount to be received
     *  confirmations: the min number of confirmations to accept the payment 
     */
    const init = (options) => {
        if (options) {
            if (options.amount) {
                _this.setExpectedAmount(options.amount);
            }
            if (options.confirmations) {
                _this.setMinConfirmations(options.confirmations);
            }
        }
    }; 

    init(options); 
}