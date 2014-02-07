Meteor.publish('intervals', function () {
  return Intervals.find({});
});

var minuteInMilliseconds = 60 * 1000;
intervals = {};

var gaParams = function (params) {
//
}


var startInterval = function (params) {

  var milliseconds = params.interval * minuteInMilliseconds; 
  var i = params.counter || 0;
  var intervalHandler = Meteor.setInterval(function () {
    i++;
    Intervals.update({clientId: params.clientId}, {$set: {
        counter: i,
        updatedAt: moment()._d
      }
    })
  }, milliseconds);
  
  intervals[params.clientId] = intervalHandler;
};

Meteor.methods({
  'setInterval': function (interval) {
    
    var now = moment();
    
    // Adding a new interval
    if (Intervals.find({clientId: interval.clientId}).count() === 0) {
      Intervals.insert(_.extend(interval, {
        createdAt: now._d
      }));
    
      startInterval(interval); 

    // On startup, restart an interval
    } else {
      var lastPing = moment(interval.updatedAt || interval.createdAt); //Last ping, or has not yet pinged
      var millisecondsToNow = now.diff(lastPing);
      var catchupDelay = millisecondsToNow % (interval.interval * minuteInMilliseconds) // Wait the remainder 
      console.log(interval.clientId + ', delay with ' + catchupDelay + ' ms');


      Meteor.setTimeout(function () { 

        // When delay has run, count +1 

        interval.counter = (interval.counter) ? (interval.counter+1) : 1;

        console.log(interval.clientId + ', counting +1 ' + interval.counter);
        Intervals.update({clientId: interval.clientId}, {$set: {
            counter: interval.counter,
            updatedAt: moment()._d
          }
        });

        console.log(interval.clientId + ', starting interval with ' + interval.interval + ' minutes');
        
        // And start the interval
        startInterval(Intervals.findOne({clientId: interval.clientId})); 
      }, catchupDelay);
    }

  
  },

  'clearInterval': function (intervalId) {
    var interval = Intervals.findOne(intervalId);
    
    Meteor.clearInterval(intervals[interval.clientId]);
    delete intervals[interval.clientId];

    Intervals.remove(intervalId);
  }
});


// Continue counting for existing intervals
Meteor.startup(function () {
  Intervals.find().forEach(function (interval) {
    Meteor.call('setInterval', interval);
  });
});




