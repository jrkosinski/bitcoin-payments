'use strict'; 

const async = require('asyncawait/async');
const await = require('asyncawait/await');

/**
 * Timer
 * A generic timer class wrapping javascript setTimeout and clearTimeout
 * 
 * John R. Kosinski 
 * 21 Apr 2018
 * 
 * Usage: 
 *  const timer = new Timer(100, () => {
 *      console.log('timer fired'); 
 *  });
 *  timer.start(); 
 * 
 *  - OR - 
 * 
 * const timer = new Timer(100); 
 * timer.start(() => {
 *      console.log('timer fired'); 
 * });
 * 
 * @param {int} intervalMs 
 * @param {function} callback 
 */
function Timer(intervalMs, callback) {
    const _this = this; 
    
    let _interval = intervalMs;    
    let _callback = callback;    
    let _startTimestamp = null; 
    let _stopTimestamp = null; 
    let _timerHandle = null; 
    let _awaitable = false;

    /**
     * gets timestamp in milliseconds 
     */
    const getTimestamp = () => {
        return new Date().getTime();
    }; 

    /**
     * calls the appropriate callback on each timer interval 
     */
    const callCallback = async(() => {
        if (_awaitable) 
            await(_callback()); 
        else 
            _callback(); 
    });

    /**
     * run one time, on interval 
     * 
     * @param {bool} runFirst 
     *  if true, the timer will hit for the first time immediately upon starting 
     */
    const runOnce = async((runFirst) => {
        if (runFirst) {
            callCallback(); 
        }

        _timerHandle = setTimeout(async(() => {
            await(callCallback());

            if (_this.isRunning()) {
                runOnce(false); 
            }
        }), _interval); 
    }); 

    /**
     * sets the callback function to be called on timer interval 
     * 
     * @param {function} callback
     *  the callback to call on each timer interval 
     */
    this.setCallback = (callback) => {
        _callback = callback;
    }; 

    /**
     * sets the number of ms to use as interval between calls
     * 
     * @param {int} ms
     *  number of milliseconds interval 
     */
    this.changeInterval = (ms) => {
        _interval = ms;
        if (_timerHandle) {
            clearTimeout(_timerHandle);
            runOnce(false); 
        }
    }; 

    /**
     * returns true if the timer has been started (and not yet stopped) 
     */
    /*bool*/ this.isRunning = () => {
        return (_timerHandle ? true: false); 
    }; 

    /**
     * gets the number of milliseconds from the last start to the most recent stop (if stopped; 
     * otherwise the number of milliseconds from start til now) 
     */
    /*int*/ this.getRunDuration = () => {
        let output = 0; 
        if (_startTimestamp) {
            let stopTimestamp = _stopTimestamp; 
            if (!stopTimestamp) 
                stopTimestamp = getTimestamp(); 
            output = stopTimestamp - _startTimestamp;
        }

        return output; 
    }; 
    
    /**
     * starts the timer running 
     * 
     * @param {function} callback
     *  the callback to call on each timer interval 
     * @param {bool} runFirst 
     *  if true, the timer will hit for the first time immediately upon starting 
     */
    /*bool*/ this.start = (callback, runFirst) => {
        _awaitable = false;
        if (!_timerHandle) {
            if (callback)
                _callback = callback; 

            runOnce(runFirst);

            _startTimestamp = getTimestamp(); 
            _stopTimestamp = null; 

            return true;
        }
        return false;
    }; 

    /**
     * starts the timer running when the callback given is an async() function, and the 
     * function should be await()ed each time it's called by the timer. 
     * 
     * @param {function} callback
     *  the callback to call on each timer interval 
     * @param {bool} runFirst 
     *  if true, the timer will hit for the first time immediately upon starting 
     */
    /*bool*/ this.startAsync = (callback, runFirst) => {
        _awaitable = true;
        if (!_timerHandle) {
            if (callback)
                _callback = callback; 

            runOnce(runFirst); 
            
            _startTimestamp = getTimestamp(); 
            _stopTimestamp = null; 

            return true;
        }
        return false;
    };

    /**
     * stops the timer, if started. 
     * 
     * @returns {int} 
     *  number of milliseconds between most recent start and stop
     */
    /*int*/ this.stop = () => {
        if (_timerHandle) {
            clearTimeout(_timerHandle); 
            _timerHandle = null; 
            _stopTimestamp = getTimestamp();

            return _this.getRunDuration();
        }
        return 0;
    }; 
}

module.exports = Timer;