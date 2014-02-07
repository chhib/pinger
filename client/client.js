Meteor.startup(function () {
  Session.set('UA', "UA-47831229-1");

  Meteor.subscribe('intervals');
});

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
      Meteor.call('setInterval', {
        clientId: $('#cid').val().trim(),
        tid: $('#webproperty').val().trim(),
        interval: parseInt($('#minutes').val(), 10),
        cdIndex: parseInt($('#cd-index').val(), 10),
        cdValue: $('#cd-value').val().trim(),
        ec: $('#ec').val().trim(),
        ea: $('#ea').val().trim(),
        active: true
      });
    } else {

    }
  }
});

momentInterval = Meteor.setInterval(function () {
  $('#interval-list td span[data-original-title]').each(function (i,itm) {
    $(itm).html( Template.interval_item.fromNow($(itm).attr('data-original-title')) )
  });
},1000);

Template.interval_item.rendered = function () {

  $('#interval-list td span').tooltip();

};

Template.intervals.intervals = function () {
  return Intervals.find();
};


Template.interval_item.formatTime = function (date) {
  return (date && date !== '-') ? moment(date).zone('+0100').format('YYYY-MM-DD HH:mm:ss') : '-';
};
Template.interval_item.fromNow = function (date) {
  return (date && date !== '-') ? moment(date).zone('+0100').fromNow() : '-';
}

Template.interval_item.showCount = function (counter) {
  return (counter) ? counter : 0;
};

Template.interval_item.printChecked = function () {
  return (this.active) ? 'checked="checked"' : '';
};

Template.interval_item.events({
  'click button': function () {
    Meteor.call('clearInterval', this._id);
  },
  'click input[type="checkbox"]': function (e) {
    Meteor.call('toggleActive', this._id, (e.target.checked) ? true : false, function () {});
  }
});
