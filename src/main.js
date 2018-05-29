$(function() {

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext("2d");
    
    // Map sprite
    var mapSprite = new Image();
    mapSprite.src = "https://img.elo7.com.br/product/main/1486F1F/difusor-de-ambiente-1-litro-cheiro.jpg";
    
    var Marker = function () {
        this.Sprite = new Image();
        this.Sprite.src = "http://www.clker.com/cliparts/w/O/e/P/x/i/map-marker-hi.png"
        this.Width = 12;
        this.Height = 20;
        this.XPos = 0;
        this.YPos = 0;
    }
    
    var Markers = new Array();
    
    var mouseClicked = function (mouse) {
        // Get corrent mouse coords
        var rect = canvas.getBoundingClientRect();
        var mouseXPos = (mouse.x - rect.left);
        var mouseYPos = (mouse.y - rect.top);
    
        console.log("Marker added");
    
        // Move the marker when placed to a better location
        var marker = new Marker();
        marker.XPos = mouseXPos - (marker.Width / 2);
        marker.YPos = mouseYPos - marker.Height;
    
        Markers.push(marker);
    }
    
    // Add mouse click event listener to canvas
    canvas.addEventListener("mousedown", mouseClicked, false);
    
    var firstLoad = function () {
        context.font = "15px Georgia";
        context.textAlign = "center";
    }
    
    firstLoad();
    
    var main = function () {
        draw();
    };
    
    var draw = function () {
        // Clear Canvas
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        // Draw map
        // Sprite, X location, Y location, Image width, Image height
        // You can leave the image height and width off, if you do it will draw the image at default size
        context.drawImage(mapSprite, 0, 0, 580, 392);
    
        // Draw markers
        for (var i = 0; i < Markers.length; i++) {
            var tempMarker = Markers[i];
            // Draw marker
            context.drawImage(tempMarker.Sprite, tempMarker.XPos, tempMarker.YPos, tempMarker.Width, tempMarker.Height);
    
            // Calculate postion text
            var markerText = "Postion (X:" + tempMarker.XPos + ", Y:" + tempMarker.YPos;
    
            // Draw a simple box so you can see the position
            var textMeasurements = context.measureText(markerText);
            context.fillStyle = "#666";
            context.globalAlpha = 0.7;
            context.fillRect(tempMarker.XPos - (textMeasurements.width / 2), tempMarker.YPos - 15, textMeasurements.width, 20);
            context.globalAlpha = 1;
    
            // Draw position above
            context.fillStyle = "#000";
            context.fillText(markerText, tempMarker.XPos, tempMarker.YPos);
        }
    };
    
    setInterval(main, (1000 / 60)); // Refresh 60 times a second
});

