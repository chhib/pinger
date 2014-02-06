Meteor.startup(function () {
  Session.set('UA', "UA-47831229-1");

  Meteor.subscribe('intervals');
});

Template.hello.greeting = function () {
  return "Welcome to fakesite-nocookie.";
};

Template.intervals.intervals = function () {
  return Intervals.find();
};

Template.hello.events({
  'click #send-ga-pageview' : function (e) {
    e.preventDefault();
    
    HTTP.get('http://www.google-analytics.com/collect', {
      params: {
        v: "1",
        tid: Session.get('UA'),
        cid: $('#cid').val(),

        t: 'pageview',
        dp: $('#page').val()
      }
    }, function () {});

  },
  'click #send-ga-event' : function (e) {
    e.preventDefault();

    var params = {
      v: "1",
      tid: Session.get('UA'),
      cid: $('#cid').val(),

      t: 'event',
      ec: $('#event-cat').val(),
      ea: $('#event-act').val(),
      ni: "1"
    };

    if ($('#page').val()) {
      params["dp"] = $('#page').val();
    }

    HTTP.get('http://www.google-analytics.com/collect', {
      params: params
    }, function () {});
  },
  'click #setInterval': function (e) {
    e.preventDefault();

    if ($('#cid').val()) {
      Meteor.call('setInterval', $('#cid').val());
    } else {

    }
  }
});

Template.intervals.formatTime = function (date) {
  return moment(date).format('YYYY-MM-DD HH:MM:SS');
};

Template.intervals.showCount = function (counter) {
  return (counter) ? counter : 0;
};

Template.intervals.events({
  'click #interval-list tr button': function () {
    Meteor.call('clearInterval', this._id);
  }
})