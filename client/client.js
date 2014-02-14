Meteor.startup(function () {
  Session.set('UA', "UA-47831229-1");

  Meteor.subscribe('intervals');
});

Template.hello.events({
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
        active: $('#active').is(':checked') ? 1 : 0
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

// Ugly hack to not blink the first time.
blink = [];
Template.interval_item.created = function () {
  blink.push(this.data._id);
}

Template.interval_item.rendered = function () {
  $('#interval-list td span').tooltip();

  if (blink.indexOf(this.data._id) > -1) {
    blink.splice(blink.indexOf(this.data._id),1);
  } else { 
    
    var initialBackgroundColor = $(this.find('td')).css('backgroundColor');
    var initialColor = $(this.find('td')).css('color');
    var td = this.findAll('td');

    $(td).css({
      backgroundColor: "#7EB1DD" 
      // color: "#ffffff"
    }).animate({
      backgroundColor: initialBackgroundColor,
      // color: initialColor,
    }, 1000, 'swing', function () {
      $(td).removeAttr('style');
    });
  } 
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
  return (this.active) ? 'checked' : '';
};

Template.interval_item.events({
  'click button': function () {
    Meteor.call('clearInterval', this._id);
  },
  'click input[type="checkbox"]': function (e) {
    Meteor.call('toggleActive', this._id, (e.target.checked) ? true : false, function () {});
  }
});
