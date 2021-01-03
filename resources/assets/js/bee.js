/**
 * On resize do some specific responsiveness adjustments
 *
 * @param event
 */
var handleResizeEvent = function (event) {

    calcAspectRatio(event);
    calcAboutTextPanelHeight(event);
};

/**
 * Maintain aspect ratio of the video panel
 *
 * @param event
 */
var calcAspectRatio = function (event) {
    // On resize we recalculate the height of the iframe to maintain aspect ratio
    // There may be multiple video frames, so we are using the class to identify videos
    $(".video-frame").each(function(index, elem) {
        vidFrame = $(elem);
        vidWidth = vidFrame.width();
        vidHeight = (Math.round(vidWidth * 0.5625, 0) + 20);
        vidFrame.css('height', vidHeight);
    });

};

/**
 * Check the height of the About panels and ensure they match up correctly
 *
 * @param event
 */
var calcAboutTextPanelHeight = function (event) {
    var leftContainer = null;
    var rightContainer = null;
    // On resize we recalculate the height of the About text panel to make sure is at least as big as the image one
    if ((leftContainer = $("#about-left-container"))
        && (rightContainer = $("#about-right-container"))) {
        if (rightContainer.height() < leftContainer.height()) {
            rightContainer.css('min-height', leftContainer.height());
        }
    }
};

/**
 * Cross browser event handling
 *
 * @param object
 * @param type
 * @param callback
 */
var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};
