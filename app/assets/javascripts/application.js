// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require chartkick
//= require Chart.bundle
//= require jquery_ujs
//= require_tree .

$(document).on('ready', function() {
  $("a.flag-dialog-link").bind("click", (ev) => {
    ev.preventDefault();
    const self = $(ev.target);
    self.parents(".post--body").find(".js-flag-box").toggleClass("is-active");
  });
  $("button.flag-link").bind("click", (ev) => {
    ev.preventDefault();
    const self = $(ev.target);
    
    const active_radio = self.parents(".js-flag-box").find("input[type='radio'][name='flag-reason']:checked");
    const reason = parseInt(active_radio.val()) || null;

    if (reason === null) {
      QPixel.createNotification('danger', "Please choose a reason.");
      return;
    }

    const data = {
      'flag_type': (reason != -1) ? reason : null,
      'post_id': self.data("post-id"),
      'reason': self.parents(".js-flag-box").find(".js-flag-comment").val()
    };

    if ((reason === -1 && data['reason'].length < 10) || (reason !== -1 && data['reason'].length > 0 && data['reason'].length < 10)) {
      QPixel.createNotification('danger', "Please enter at least 10 characters.");
      return;
    }

    $.ajax({
      'type': 'POST',
      'url': '/flags/new',
      'data': data,
      'target': self
    })
    .done((response) => {
      if(response.status !== 'success') {
        QPixel.createNotification('danger', '<strong>Failed:</strong> ' + response.message);
      }
      else {
        QPixel.createNotification('success', '<strong>Thanks!</strong> A moderator will review your flag.');
        self.parents(".js-flag-box").find(".js-flag-comment").val("");
      }
      self.parents(".js-flag-box").removeClass("is-active");
    })
      .fail((jqXHR, textStatus, errorThrown) => {
        let message = jqXHR.status;
        try {
          message = JSON.parse(jqXHR.responseText)['message'];
        }
        finally {
          QPixel.createNotification('danger', '<strong>Failed:</strong> ' + message);
        }
        self.parents(".js-flag-box").removeClass("is-active");
    });
  });

  $('.close-dialog-link').on('click', (ev) => {
    ev.preventDefault();
    const self = $(ev.target);
    console.log(self.parents(".post--body").find(".js-close-box").toggleClass("is-active"));
  });

  $("a.show-all-flags-dialog-link").bind("click", (ev) => {
    ev.preventDefault();
    const self = $(ev.target);
    self.parents(".post--body").find(".js-flags").toggleClass("is-active");
  });

  $("a.flag-resolve").bind("click", function(ev) {
    ev.preventDefault();
    var self = $(this);
    var id = self.data("flag-id");
    var data = {
      'result': self.data("result"),
      'message': self.parent().parent().find(".flag-resolve-comment").val()
    };

    $.ajax({
      'type': 'POST',
      'url': '/mod/flags/' + id + '/resolve',
      'data': data,
      'el': self
    })
    .done(function(response) {
      if(response['status'] !== 'success') {
        QPixel.createNotification('danger', "<strong>Failed:</strong> " + response['message']);
      }
      else {
        $(this.el).parent().parent().parent().fadeOut(200, function() {
          $(this).remove();
        });
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      QPixel.createNotification('danger', "<strong>Failed:</strong> " + jqXHR.status);
      console.log(jqXHR.responseText);
    });
  });

  if (document.cookie.indexOf('dismiss_fvn') === -1 ) {
    $('#fvn-dismiss').on('click', () => {
      document.cookie = 'dismiss_fvn=true; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    });
  };
});
