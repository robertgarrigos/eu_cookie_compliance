(function ($) {
  Backdrop.behaviors.eu_cookie_compliance_popup = {
    attach: function(context, settings) {
      $('body').not('.sliding-popup-processed').addClass('sliding-popup-processed').each(function() {
        try {
          var enabled = Backdrop.settings.eu_cookie_compliance.popup_enabled;

          if(!enabled) {
            return;
          }
          if (!Backdrop.eu_cookie_compliance.cookiesEnabled()) {
            return;
          } 
          var status = Backdrop.eu_cookie_compliance.getCurrentStatus();
          var clicking_confirms = Backdrop.settings.eu_cookie_compliance.popup_clicking_confirmation;
          var agreed_enabled = Backdrop.settings.eu_cookie_compliance.popup_agreed_enabled;
          var popup_hide_agreed = Backdrop.settings.eu_cookie_compliance.popup_hide_agreed;
          if (status == 0) {
            var next_status = 1;
            if (clicking_confirms) {
              $('a, input[type=submit]').bind('click.eu_cookie_compliance', function(){
                if(!agreed_enabled) {
                  Backdrop.eu_cookie_compliance.setStatus(1);
                  next_status = 2;
                }
                Backdrop.eu_cookie_compliance.changeStatus(next_status);
              });
            }

            $('.agree-button').click(function(){
              if(!agreed_enabled) {
                Backdrop.eu_cookie_compliance.setStatus(1);
                next_status = 2;
              }
              Backdrop.eu_cookie_compliance.changeStatus(next_status);
            });

            Backdrop.eu_cookie_compliance.createPopup(Backdrop.settings.eu_cookie_compliance.popup_html_info);
          } else if(status == 1) {
            Backdrop.eu_cookie_compliance.createPopup(Backdrop.settings.eu_cookie_compliance.popup_html_agreed);
            if (popup_hide_agreed) {
              $('a, input[type=submit]').bind('click.eu_cookie_compliance_hideagreed', function(){
                Backdrop.eu_cookie_compliance.changeStatus(2);
              });
            }

          } else {
            return;
          }
        }
        catch(e) {
          return;
        }
      });
    }
  }

  Backdrop.eu_cookie_compliance = {};

  Backdrop.eu_cookie_compliance.createPopup = function(html) {
    var popup = $(html)
      .attr({"id": "sliding-popup"})
      .height(Backdrop.settings.eu_cookie_compliance.popup_height)
      .width(Backdrop.settings.eu_cookie_compliance.popup_width)
      .hide();
    if(Backdrop.settings.eu_cookie_compliance.popup_position) {
      popup.prependTo(".l-content");
      var height = popup.height();
      popup.show()
        .attr({"class": "sliding-popup-top"})
        .css({"top": -1 * height})
        .animate({top: 0}, Backdrop.settings.eu_cookie_compliance.popup_delay);
    } else {
      popup.appendTo("body");
      height = popup.height();
      popup.show()
        .attr({"class": "sliding-popup-bottom"})
        .css({"bottom": -1 * height})
        .animate({bottom: 0}, Backdrop.settings.eu_cookie_compliance.popup_delay)
    }
    Backdrop.eu_cookie_compliance.attachEvents();
  }

  Backdrop.eu_cookie_compliance.attachEvents = function() {
	var clicking_confirms = Backdrop.settings.eu_cookie_compliance.popup_clicking_confirmation;
    var agreed_enabled = Backdrop.settings.eu_cookie_compliance.popup_agreed_enabled;
    $('.find-more-button').click(function(){
      if (Backdrop.settings.eu_cookie_compliance.popup_link_new_window) {
        window.open(Backdrop.settings.eu_cookie_compliance.popup_link);
      }
      else{
        window.location.href = Backdrop.settings.eu_cookie_compliance.popup_link;
      }
    });
    $('.agree-button').click(function(){
      var next_status = 1;
      if(!agreed_enabled) {
        Backdrop.eu_cookie_compliance.setStatus(1);
        next_status = 2;
      }
      if (clicking_confirms) {
        $('a, input[type=submit]').unbind('click.eu_cookie_compliance');
      }
      Backdrop.eu_cookie_compliance.changeStatus(next_status);
    });
    $('.hide-popup-button').click(function(){
      Backdrop.eu_cookie_compliance.changeStatus(2);
    });
  }

  Backdrop.eu_cookie_compliance.getCurrentStatus = function() {
	name = 'cookie-agreed';
	value = Backdrop.eu_cookie_compliance.getCookie(name);
	return value;
  }

  Backdrop.eu_cookie_compliance.changeStatus = function(value) {
    var status = Backdrop.eu_cookie_compliance.getCurrentStatus();
    if (status == value) return;
    if(Backdrop.settings.eu_cookie_compliance.popup_position) {
      $(".sliding-popup-top").animate({top: $("#sliding-popup").height() * -1}, Backdrop.settings.eu_cookie_compliance.popup_delay, function () {
        if(status == 0) {
          $("#sliding-popup").html(Backdrop.settings.eu_cookie_compliance.popup_html_agreed).animate({top: 0}, Backdrop.settings.eu_cookie_compliance.popup_delay);
          Backdrop.eu_cookie_compliance.attachEvents();
        }
        if(status == 1) {
          $("#sliding-popup").remove();
        }
      })
    } else {
      $(".sliding-popup-bottom").animate({bottom: $("#sliding-popup").height() * -1}, Backdrop.settings.eu_cookie_compliance.popup_delay, function () {
        if(status == 0) {
          $("#sliding-popup").html(Backdrop.settings.eu_cookie_compliance.popup_html_agreed).animate({bottom: 0}, Backdrop.settings.eu_cookie_compliance.popup_delay)
          Backdrop.eu_cookie_compliance.attachEvents();
        }
        if(status == 1) {
          $("#sliding-popup").remove();
        }
      ;})
    }
    Backdrop.eu_cookie_compliance.setStatus(value);
  }

  Backdrop.eu_cookie_compliance.setStatus = function(status) {
    var date = new Date();
    date.setDate(date.getDate() + parseInt(Backdrop.settings.eu_cookie_compliance.cookie_lifetime));
    var cookie = "cookie-agreed=" + status + ";expires=" + date.toUTCString() + ";path=" + Backdrop.settings.basePath;
    if(Backdrop.settings.eu_cookie_compliance.domain) {
      cookie += ";domain="+Backdrop.settings.eu_cookie_compliance.domain;
    }
    document.cookie = cookie;
  }

  Backdrop.eu_cookie_compliance.hasAgreed = function() {
    var status = Backdrop.eu_cookie_compliance.getCurrentStatus();
    if(status == 1 || status == 2) {
      return true;
    }
    return false;
  }


  /**
   * Verbatim copy of Backdrop.comment.getCookie().
   */
  Backdrop.eu_cookie_compliance.getCookie = function(name) {
    var search = name + '=';
    var returnValue = '';

    if (document.cookie.length > 0) {
      offset = document.cookie.indexOf(search);
      if (offset != -1) {
        offset += search.length;
        var end = document.cookie.indexOf(';', offset);
        if (end == -1) {
          end = document.cookie.length;
        }
        returnValue = decodeURIComponent(document.cookie.substring(offset, end).replace(/\+/g, '%20'));
      }
    }

    return returnValue;
  };
  
  Backdrop.eu_cookie_compliance.cookiesEnabled = function() {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;
      if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) { 
        document.cookie="testcookie";
        cookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;
      }
    return (cookieEnabled);
  }
  
})(jQuery);
