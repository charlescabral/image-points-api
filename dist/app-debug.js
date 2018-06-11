"use strict";

(function ($) {

  var contexts = [];

  // ====> HELPERS <==== //
  var setAttributes = function setAttributes(el, attrs) {
    // Key Value
    for (var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  };

  var isNumber = function isNumber(value) {
    if (!/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
    return true;
  };

  // input items
  var inputMapJson = document.getElementById("map_decorated_ambient");
  var currentMapJson = $.trim(inputMapJson.value) != '' ? JSON.parse(inputMapJson.value) : [];

  // html items
  var mapItems = $('.Map_product');
  var htmlMapJson = [];

  $.each(mapItems, function (i, el) {
    var text = $(el).find('.Map_title').text();
    var magePos = $(el).data('magepos');
    var sku = $(el).data('sku');
    htmlMapJson.push({ "text": text, "magePos": magePos, "sku": sku, "maped": false });
  });

  // merge new and maped items
  var oldItemsMaped = [];

  if (currentMapJson.length > htmlMapJson.length) {
    currentMapJson.filter(function (elem) {
      for (var i = 0; i < this.length; i++) {
        if (this[i].sku == elem.sku) {
          oldItemsMaped.push(elem);
          break;
        }
      }
    }, htmlMapJson);
  } else {
    htmlMapJson.filter(function (elem, index, array) {
      for (var i = 0; i < this.length; i++) {
        if (this[i].sku == elem.sku) {
          oldItemsMaped.push(this[i]);
          break;
        }
      }
    }, currentMapJson);
  }

  // check if maped items in input
  var missingMap = function missingMap(mapJson) {
    var count = 0;
    mapJson.filter(function (newItem, i) {
      for (var u = 0; u < this.length; u++) {
        if (this[u].sku == newItem.sku) {
          mapJson[i].maped = true;break;
        }
      }!newItem.maped ? count++ : 0;
    }, currentMapJson);
    return count;
  };

  // 'type': 'value',
  //   'name': 'map-options',
  //   'value': newItem.magePos,
  //   'data-sku': newItem.sku,
  //   'data-text': newItem.text

  var getOptionsList = function getOptionsList(mapJson) {
    $('#Map_options').html('');
    $.each(mapJson, function (i, option) {
      if (!option.maped) {
        var radio = document.createElement("input");
        setAttributes(radio, {
          'type': 'radio',
          'name': 'map-options',
          'value': option.magePos,
          'data-sku': option.sku,
          'data-text': option.text,
          'class': 'Map_modal-option'
        });
        var label = document.createElement("label");
        label.appendChild(radio);
        label.appendChild(document.createTextNode(option.text));
        document.getElementById("Map_options").appendChild(label);
      }
    });
  };

  var getCancel = function getCancel() {
    var id = 'Map_cancel-label';
    $('#' + id).html('');
    var radio = document.createElement("input");
    setAttributes(radio, {
      'type': 'radio',
      'name': 'map-options',
      'value': "cancel",
      'class': 'Map_modal-option'
    });
    document.getElementById(id).appendChild(radio);
  };

  // returns whether values are less than (maxDev * 100)% away
  var isNearby = function isNearby(one, two, maxDev) {
    return Math.abs(1 - Math.abs(one / two)) < maxDev;
  };

  var prerender = function prerender(_contexts, _dots) {
    $.each(_contexts, function (i, data) {
      $.each(_dots, function (j, dot) {
        data.ctx.clearRect(0, 0, data.el.width, data.el.height);
      });
    });
  };

  var saveClearDots = function saveClearDots() {
    inputMapJson.value = [];
    $('button[title="Salvar e continuar a editar"]').trigger('click');
  };

  var deleteDot = function deleteDot(_dots, sku) {}

  // oldItemsMaped.filter( function( elem ) {
  //     dots.removeDot(elem.x, elem.y)
  // });


  // dot helper class
  // x,y are assumend to already be relative to align unless el is not undefined
  ;var dot = function dot(_x, _y, _text, _magePos, _align, el) {
    var _this = this;

    this.x = _x;
    this.y = _y;
    this.text = _text; // dot text
    this.align = _align; // {x, y} to which these coords are relative to
    this.radius = 50; // hover event radius

    if (el != undefined) {
      this.x = this.x * this.align.x / $(el).width();
      this.y = this.y * this.align.y / $(el).height();
    }

    this.relativeX = function (el) {
      return _this.x * $(el).width() / _this.align.x;
    };
    this.relativeY = function (el) {
      return _this.y * $(el).height() / _this.align.y;
    };

    this.render = function (context, el) {
      context.beginPath();
      context.arc(_this.relativeX(el), _this.relativeY(el), 32, 0, Math.PI * 2, true);
      context.fillStyle = '#0b255a';
      context.fill();
      context.beginPath();
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.fillStyle = '#FFF';
      context.font = 'bold 24px Arial';
      context.fillText(_magePos, _this.relativeX(el), _this.relativeY(el));
      context.fill();
    };

    // returns whether (x,y) match this point when relative to el or, if
    // el == undefined, they're matching (== diffrence less than maxDeviration)
    this.isMe = function (x, y, el, maxDeviration) {
      maxDeviration = maxDeviration || 0.01;
      if (el != undefined) {
        x = x * _this.align.x / $(el).width();
        y = y * _this.align.y / $(el).height();
      }
      return isNearby(x, _this.x, maxDeviration) && isNearby(y, _this.y, maxDeviration);
    };
  };

  $.fn.dots = function (dots, options) {

    var settings = $.extend({
      img: "",
      setmode: false,
      setcallback: function setcallback(dot) {},
      defaulttext: "New Item",
      forceRatio: false,
      align: { x: 100, y: 100 }
    }, options);

    // initialize dots
    settings.dots = [];

    oldItemsMaped.filter(function (el, i) {
      for (var u = 0; u < this.length; u++) {
        if (this[u].sku == el.sku) {
          el.magePos = this[u].magePos;break;
        }
      }
      settings.dots.push(new dot(el.x, el.y, el.text, el.magePos, settings.align));
      $('#Map_' + el.sku).addClass('maped');
    }, htmlMapJson);

    inputMapJson.value = JSON.stringify(oldItemsMaped);

    // re-renders all dots
    var render = function render() {
      prerender(contexts, settings.dots);
      $.each(contexts, function (i, data) {
        $.each(settings.dots, function (j, dot) {
          dot.render(data.ctx, data.el);
        });
      });
    };

    // places a new dot
    var setProductDot = function setProductDot(event, element) {

      $('.Map_modal-option').change(function () {
        var currentOption = $(this);
        var magePos = currentOption.val();
        var sku = currentOption.data('sku');
        var text = currentOption.data('text');

        if (isNumber(magePos)) {
          var elementParent = $(element).parent().offset();
          var ndot = new dot(event.clientX - elementParent.left, event.clientY - elementParent.top + $(window).scrollTop(), text, magePos, settings.align, element);
          ndot.text = text;

          $('#Map_' + sku).addClass('maped');

          settings.dots.push(ndot);
          render();
          settings.setcallback(ndot);

          $('.Map_modal').fadeOut(300, function () {

            $.each([oldItemsMaped, currentMapJson], function (i, array) {
              array.push({
                "x": ndot.x,
                "y": ndot.y,
                "text": text,
                "magePos": magePos,
                "sku": sku,
                "maped": true
              });
            });

            inputMapJson.value = JSON.stringify(oldItemsMaped);
          });
        } else {
          $('.Map_modal').fadeOut(300);
        }
      });
    };

    // removes a dot
    this.removeDot = function (x, y) {
      settings.dots = settings.dots.filter(function (el, index) {
        return dot.x != x && dot.y != y;
      });
    };

    // init mouse move on each element
    this.each(function (i, el) {
      el.style = "background: url(" + settings.img + ");" + "background-repeat: no-repeat;" + "background-size: 100% 100%;" + "width: " + settings.width + ";" + "height: " + settings.height + ";";

      var jqel = $(el);

      // create tooltip canvas
      contexts.push({ el: el, ctx: el.getContext("2d") });

      jqel.mousemove(function (event) {
        // mouseMoveEvent(event, el, el.offsetLeft, el.offsetTop);
      });

      if (settings.setmode) jqel.click(function (e) {
        if (missingMap(htmlMapJson)) {
          getOptionsList(htmlMapJson);
          getCancel();
          $('.Map_modal').fadeIn(500, function () {
            setProductDot(e, el);
          });
        }
      });

      jqel.resize(function (e) {
        if (isNumeric(settings.forceRatio)) jqel.height(jqel.width() * settings.forceRatio);
        render();
      });
    });

    $(document).on('click', '.saveClearDots', saveClearDots);

    $(document).on('click', '.Map_delete', function () {
      var sku = $(this).data('sku');
      deleteDot(settings.dots, sku);
    });

    render();

    return this;
  };
})(jQuery);