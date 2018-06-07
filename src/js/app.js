"use strict";

(function($) {

  // input items
  const inputMapJson = document.getElementById("map_decorated_ambient");
  const currentMapJson = ($.trim(inputMapJson.value) != '') ? JSON.parse(inputMapJson.value) : [];

  // html items
  const mapItems = $('.Map_product');
  const htmlMapJson = []; 
  $.each(mapItems, function (i, el) {
    let text = $(el).find('.Map_title').text();
    let magePos = $(el).data('magepos');
    let sku = $(el).data('sku');
    htmlMapJson.push({"text":text, "magePos": magePos, "sku": sku, "maped": false});
  });
  
  // check if maped items in input

  const missingMap = function() {
    let missingMap = 0;
    htmlMapJson.filter( function(newItem, i) {
      for (let u = 0; u < currentMapJson.length; u++) {
        if(currentMapJson[u].sku == newItem.sku) {
          htmlMapJson[i].maped = true;
          break;
        }
      }
      if(!newItem.maped){
        missingMap++;
      }
    });
    return missingMap ? true : false;
  }
  const getOptionsList = function() {
   
    $.each(htmlMapJson, function(i, newItem) {  
      if(!newItem.maped){
        let radio = document.createElement("input");
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', 'map-options');
        radio.setAttribute('value', newItem.magePos);
        radio.setAttribute('data-sku', newItem.sku);
        radio.setAttribute('data-text', newItem.text);
        radio.className = 'Map_modal-option';
        let label = document.createElement("label");
        label.appendChild(radio);
        label.appendChild(document.createTextNode(newItem.text));
        document.getElementById("Map_options").appendChild(label);
        
      }
    });  
  };

  
  
  // returns whether values are less than (maxDev * 100)% away
  const isNearby = function(one, two, maxDev) {
    return Math.abs(1 - Math.abs(one / two)) < maxDev;
  };
  
  // dot helper class
  // x,y are assumend to already be relative to align unless el is not undefined
  var dot = function(_x, _y, _text, _magePos, _align, el) {
    this.x = _x;
    this.y = _y;
    this.text = _text; // dot text
    this.align = _align; // {x, y} to which these coords are relative to
    this.radius = 50; // hover event radius
    
    if (el != undefined) {
      this.x = this.x * this.align.x / $(el).width();
      this.y = this.y * this.align.y / $(el).height();
    }
    
    this.relativeX = function(el) {
      return this.x * $(el).width() / this.align.x;
    };
    
    this.relativeY = function(el) {
      return this.y * $(el).height() / this.align.y;
    };
    
    this.render = function(context, el) {
      context.beginPath();
      context.arc(
        this.relativeX(el),
        this.relativeY(el),
        32,
        0,
        Math.PI * 2,
        true
      );
      context.fillStyle = '#0b255a';context.fillStyle = '#0b255a';
      context.fill();
      context.beginPath();
      context.fillStyle = '#FFF';
      context.font="bold 24px Arial";
      context.fillText(_magePos, this.relativeX(el)-7, this.relativeY(el)+7);
      context.fill();
    };
    
    // returns whether (x,y) match this point when relative to el or, if
    // el == undefined, they're matching (== diffrence less than maxDeviration)
    this.isMe = function(x, y, el, maxDeviration) {
      maxDeviration = maxDeviration || 0.01;
      if (el != undefined) {
        x = x * this.align.x / $(el).width();
        y = y * this.align.y / $(el).height();
      }
      return (
        isNearby(x, this.x, maxDeviration) && isNearby(y, this.y, maxDeviration)
      );
    };
  };
  
  $.fn.dots = function(dots, options) {
    var settings = $.extend(
      {
        img: "",
        setmode: false,
        setcallback: function(dot) {},
        defaulttext: "New Item",
        forceRatio: false,
        align: {
          x: 100,
          y: 100
        }
      },
      options
    );
    
    // initialize dots
    settings.dots = [];

    $.each(currentMapJson, function(i, el) {
      settings.dots.push(new dot(el.x, el.y, el.text, el.magePos, settings.align));
      $('#Map_'+ el.sku).addClass('maped');
    });
    
    // create tooltip canvas
    var contexts = [];
    
    // re-renders all dots
    var render = function() {
      $.each(contexts, function(i, data) {

        $.each(settings.dots, function(j, dot) {
          // console.log(dot.text)
          dot.render(data.ctx, data.el);
        });
      });
    };

    // places a new dot
    const setProductDot = function(event, element) {

      $('.Map_modal-option').change(function(){
        let currentOption = $(this);  
        let magePos = currentOption.val();
        let sku = currentOption.data('sku');
        let text = currentOption.data('text');

        $('#Map_'+sku).addClass('maped');

        let elementParent = $(element).parent().offset();

        const ndot = new dot(
          event.clientX - elementParent.left,
          event.clientY - elementParent.top + $(window).scrollTop(),
          text,
          magePos,
          settings.align,
          element
        );

        ndot.text = text
        // console.log(ndot.text)

        settings.dots.push(ndot);
        render();
        settings.setcallback(ndot);

        $('.Map_modal').fadeOut(300, function() {

          $('#Map_options').html('');

          currentMapJson.push({
            "x":ndot.x, 
            "y": ndot.y, 
            "text": text, 
            "magePos": magePos, 
            "sku": sku,
            "maped": true
          });

          inputMapJson.value = JSON.stringify(currentMapJson)
        })
      });
    };
    
    // removes a dot
    this.removeDot = function(x, y) {
      settings.dots = settings.dots.filter(function(el, index) {
        return dot.x != x && dot.y != y;
      });
    };
    
    // init mouse move on each element
    this.each(function(i, el) {
      el.style =
        "background: url(" +
        settings.img +
        ");" +
        "background-repeat: no-repeat; " +
        "background-size: 100% 100%;" +
        "width: " +
        settings.width +
        "; ";
        "height: " + settings.height + "; ";
      
      var jqel = $(el);
      
      contexts.push({ el: el, ctx: el.getContext("2d") });
      
      jqel.mousemove(function(event) {
        // mouseMoveEvent(event, el, el.offsetLeft, el.offsetTop);
      });
      
      if (settings.setmode)
      jqel.click(function(e) {
        if (missingMap()) {
          getOptionsList();
          $('.Map_modal').fadeIn(500, function() {
            setProductDot(e, el)
          });
        }
      });
      
      jqel.resize(function(e) {
        if (isNumeric(settings.forceRatio))
        jqel.height(jqel.width() * settings.forceRatio);
        render();
      });
    });
    
    // render initial dots
    render();
    
    return this;
  };
  
  
  // $.fn.initDots = function(options) {
  //   let settings = $.extend(
  //     {
  //       teste: "",
  //       setcallback: function() {},
  //     },
  //     options
  //   );
  // };
})(jQuery);
