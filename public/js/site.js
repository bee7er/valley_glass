(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {var svgNS = "http://www.w3.org/2000/svg";
    var subframeEnabled = true;
    var expressionsPlugin;
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var cachedColors = {};
    var bm_rounder = Math.round;
    var bm_rnd;
    var bm_pow = Math.pow;
    var bm_sqrt = Math.sqrt;
    var bm_abs = Math.abs;
    var bm_floor = Math.floor;
    var bm_max = Math.max;
    var bm_min = Math.min;
    var blitter = 10;

    var BMMath = {};
    (function(){
        var propertyNames = Object.getOwnPropertyNames(Math);
        var i, len = propertyNames.length;
        for(i=0;i<len;i+=1){
            BMMath[propertyNames[i]] = Math[propertyNames[i]];
        }
    }());

    function ProjectInterface(){return {}};

    BMMath.random = Math.random;
    BMMath.abs = function(val){
        var tOfVal = typeof val;
        if(tOfVal === 'object' && val.length){
            var absArr = Array.apply(null,{length:val.length});
            var i, len = val.length;
            for(i=0;i<len;i+=1){
                absArr[i] = Math.abs(val[i]);
            }
            return absArr;
        }
        return Math.abs(val);

    }
    var defaultCurveSegments = 75;
    var degToRads = Math.PI/180;
    var roundCorner = 0.5519;

    function roundValues(flag){
        if(flag){
            bm_rnd = Math.round;
        }else{
            bm_rnd = function(val){
                return val;
            };
        }
    }
    roundValues(false);

    function roundTo2Decimals(val){
        return Math.round(val*10000)/10000;
    }

    function roundTo3Decimals(val){
        return Math.round(val*100)/100;
    }

    function styleDiv(element){
        element.style.position = 'absolute';
        element.style.top = 0;
        element.style.left = 0;
        element.style.display = 'block';
        element.style.transformOrigin = element.style.webkitTransformOrigin = '0 0';
        element.style.backfaceVisibility  = element.style.webkitBackfaceVisibility = 'visible';
        element.style.transformStyle = element.style.webkitTransformStyle = element.style.mozTransformStyle = "preserve-3d";
    }

    function styleUnselectableDiv(element){
        element.style.userSelect = 'none';
        element.style.MozUserSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.oUserSelect = 'none';

    }

    function BMEnterFrameEvent(n,c,t,d){
        this.type = n;
        this.currentTime = c;
        this.totalTime = t;
        this.direction = d < 0 ? -1:1;
    }

    function BMCompleteEvent(n,d){
        this.type = n;
        this.direction = d < 0 ? -1:1;
    }

    function BMCompleteLoopEvent(n,c,t,d){
        this.type = n;
        this.currentLoop = c;
        this.totalLoops = t;
        this.direction = d < 0 ? -1:1;
    }

    function BMSegmentStartEvent(n,f,t){
        this.type = n;
        this.firstFrame = f;
        this.totalFrames = t;
    }

    function BMDestroyEvent(n,t){
        this.type = n;
        this.target = t;
    }

    function _addEventListener(eventName, callback){

        if (!this._cbs[eventName]){
            this._cbs[eventName] = [];
        }
        this._cbs[eventName].push(callback);

    }

    function _removeEventListener(eventName,callback){

        if (!callback){
            this._cbs[eventName] = null;
        }else if(this._cbs[eventName]){
            var i = 0, len = this._cbs[eventName].length;
            while(i<len){
                if(this._cbs[eventName][i] === callback){
                    this._cbs[eventName].splice(i,1);
                    i -=1;
                    len -= 1;
                }
                i += 1;
            }
            if(!this._cbs[eventName].length){
                this._cbs[eventName] = null;
            }
        }

    }

    function _triggerEvent(eventName, args){
        if (this._cbs[eventName]) {
            var len = this._cbs[eventName].length;
            for (var i = 0; i < len; i++){
                this._cbs[eventName][i](args);
            }
        }
    }

    function randomString(length, chars){
        if(chars === undefined){
            chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        }
        var i;
        var result = '';
        for (i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }

    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [ r,
            g,
            b ];
    }

    function RGBtoHSV(r, g, b) {
        if (arguments.length === 1) {
            g = r.g, b = r.b, r = r.r;
        }
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return [
            h,
            s,
            v
        ];
    }

    function addSaturationToRGB(color,offset){
        var hsv = RGBtoHSV(color[0]*255,color[1]*255,color[2]*255);
        hsv[1] += offset;
        if (hsv[1] > 1) {
            hsv[1] = 1;
        }
        else if (hsv[1] <= 0) {
            hsv[1] = 0;
        }
        return HSVtoRGB(hsv[0],hsv[1],hsv[2]);
    }

    function addBrightnessToRGB(color,offset){
        var hsv = RGBtoHSV(color[0]*255,color[1]*255,color[2]*255);
        hsv[2] += offset;
        if (hsv[2] > 1) {
            hsv[2] = 1;
        }
        else if (hsv[2] < 0) {
            hsv[2] = 0;
        }
        return HSVtoRGB(hsv[0],hsv[1],hsv[2]);
    }

    function addHueToRGB(color,offset) {
        var hsv = RGBtoHSV(color[0]*255,color[1]*255,color[2]*255);
        hsv[0] += offset/360;
        if (hsv[0] > 1) {
            hsv[0] -= 1;
        }
        else if (hsv[0] < 0) {
            hsv[0] += 1;
        }
        return HSVtoRGB(hsv[0],hsv[1],hsv[2]);
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    }

    var rgbToHex = (function(){
        var colorMap = [];
        var i;
        var hex;
        for(i=0;i<256;i+=1){
            hex = i.toString(16);
            colorMap[i] = hex.length == 1 ? '0' + hex : hex;
        }

        return function(r, g, b) {
            if(r<0){
                r = 0;
            }
            if(g<0){
                g = 0;
            }
            if(b<0){
                b = 0;
            }
            return '#' + colorMap[r] + colorMap[g] + colorMap[b];
        };
    }());

    function fillToRgba(hex,alpha){
        if(!cachedColors[hex]){
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            cachedColors[hex] = parseInt(result[1], 16)+','+parseInt(result[2], 16)+','+parseInt(result[3], 16);
        }
        return 'rgba('+cachedColors[hex]+','+alpha+')';
    }

    var fillColorToString = (function(){

        var colorMap = [];
        return function(colorArr,alpha){
            if(alpha !== undefined){
                colorArr[3] = alpha;
            }
            if(!colorMap[colorArr[0]]){
                colorMap[colorArr[0]] = {};
            }
            if(!colorMap[colorArr[0]][colorArr[1]]){
                colorMap[colorArr[0]][colorArr[1]] = {};
            }
            if(!colorMap[colorArr[0]][colorArr[1]][colorArr[2]]){
                colorMap[colorArr[0]][colorArr[1]][colorArr[2]] = {};
            }
            if(!colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]]){
                colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]] = 'rgba(' + colorArr.join(',')+')';
            }
            return colorMap[colorArr[0]][colorArr[1]][colorArr[2]][colorArr[3]];
        };
    }());

    function RenderedFrame(tr,o) {
        this.tr = tr;
        this.o = o;
    }

    function LetterProps(o,sw,sc,fc,m,p){
        this.o = o;
        this.sw = sw;
        this.sc = sc;
        this.fc = fc;
        this.m = m;
        this.props = p;
    }

    function iterateDynamicProperties(num){
        var i, len = this.dynamicProperties;
        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue(num);
        }
    }

    function reversePath(paths){
        var newI = [], newO = [], newV = [];
        var i, len, newPaths = {};
        var init = 0;
        if (paths.c) {
            newI[0] = paths.o[0];
            newO[0] = paths.i[0];
            newV[0] = paths.v[0];
            init = 1;
        }
        len = paths.i.length;
        var cnt = len - 1;

        for (i = init; i < len; i += 1) {
            newI.push(paths.o[cnt]);
            newO.push(paths.i[cnt]);
            newV.push(paths.v[cnt]);
            cnt -= 1;
        }

        newPaths.i = newI;
        newPaths.o = newO;
        newPaths.v = newV;

        return newPaths;
    }
    /*!
     Transformation Matrix v2.0
     (c) Epistemex 2014-2015
     www.epistemex.com
     By Ken Fyrstenberg
     Contributions by leeoniya.
     License: MIT, header required.
     */

    /**
     * 2D transformation matrix object initialized with identity matrix.
     *
     * The matrix can synchronize a canvas context by supplying the context
     * as an argument, or later apply current absolute transform to an
     * existing context.
     *
     * All values are handled as floating point values.
     *
     * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
     * @prop {number} a - scale x
     * @prop {number} b - shear y
     * @prop {number} c - shear x
     * @prop {number} d - scale y
     * @prop {number} e - translate x
     * @prop {number} f - translate y
     * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
     * @constructor
     */

    var Matrix = (function(){

        function reset(){
            this.props[0] = 1;
            this.props[1] = 0;
            this.props[2] = 0;
            this.props[3] = 0;
            this.props[4] = 0;
            this.props[5] = 1;
            this.props[6] = 0;
            this.props[7] = 0;
            this.props[8] = 0;
            this.props[9] = 0;
            this.props[10] = 1;
            this.props[11] = 0;
            this.props[12] = 0;
            this.props[13] = 0;
            this.props[14] = 0;
            this.props[15] = 1;
            return this;
        }

        function rotate(angle) {
            if(angle === 0){
                return this;
            }
            var mCos = Math.cos(angle);
            var mSin = Math.sin(angle);
            return this._t(mCos, -mSin,  0, 0
                , mSin,  mCos, 0, 0
                , 0,  0,  1, 0
                , 0, 0, 0, 1);
        }

        function rotateX(angle){
            if(angle === 0){
                return this;
            }
            var mCos = Math.cos(angle);
            var mSin = Math.sin(angle);
            return this._t(1, 0, 0, 0
                , 0, mCos, -mSin, 0
                , 0, mSin,  mCos, 0
                , 0, 0, 0, 1);
        }

        function rotateY(angle){
            if(angle === 0){
                return this;
            }
            var mCos = Math.cos(angle);
            var mSin = Math.sin(angle);
            return this._t(mCos,  0,  mSin, 0
                , 0, 1, 0, 0
                , -mSin,  0,  mCos, 0
                , 0, 0, 0, 1);
        }

        function rotateZ(angle){
            if(angle === 0){
                return this;
            }
            var mCos = Math.cos(angle);
            var mSin = Math.sin(angle);
            return this._t(mCos, -mSin,  0, 0
                , mSin,  mCos, 0, 0
                , 0,  0,  1, 0
                , 0, 0, 0, 1);
        }

        function shear(sx,sy){
            return this._t(1, sy, sx, 1, 0, 0);
        }

        function skew(ax, ay){
            return this.shear(Math.tan(ax), Math.tan(ay));
        }

        function skewFromAxis(ax, angle){
            var mCos = Math.cos(angle);
            var mSin = Math.sin(angle);
            return this._t(mCos, mSin,  0, 0
                , -mSin,  mCos, 0, 0
                , 0,  0,  1, 0
                , 0, 0, 0, 1)
                ._t(1, 0,  0, 0
                    , Math.tan(ax),  1, 0, 0
                    , 0,  0,  1, 0
                    , 0, 0, 0, 1)
                ._t(mCos, -mSin,  0, 0
                    , mSin,  mCos, 0, 0
                    , 0,  0,  1, 0
                    , 0, 0, 0, 1);
            //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, Math.tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
        }

        function scale(sx, sy, sz) {
            sz = isNaN(sz) ? 1 : sz;
            if(sx == 1 && sy == 1 && sz == 1){
                return this;
            }
            return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
        }

        function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
            this.props[0] = a;
            this.props[1] = b;
            this.props[2] = c;
            this.props[3] = d;
            this.props[4] = e;
            this.props[5] = f;
            this.props[6] = g;
            this.props[7] = h;
            this.props[8] = i;
            this.props[9] = j;
            this.props[10] = k;
            this.props[11] = l;
            this.props[12] = m;
            this.props[13] = n;
            this.props[14] = o;
            this.props[15] = p;
            return this;
        }

        function translate(tx, ty, tz) {
            tz = tz || 0;
            if(tx !== 0 || ty !== 0 || tz !== 0){
                return this._t(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1);
            }
            return this;
        }

        function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {

            if(a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0){
                if(m2 !== 0 || n2 !== 0 || o2 !== 0){

                    this.props[12] = this.props[12] * a2 + this.props[13] * e2 + this.props[14] * i2 + this.props[15] * m2 ;
                    this.props[13] = this.props[12] * b2 + this.props[13] * f2 + this.props[14] * j2 + this.props[15] * n2 ;
                    this.props[14] = this.props[12] * c2 + this.props[13] * g2 + this.props[14] * k2 + this.props[15] * o2 ;
                    this.props[15] = this.props[12] * d2 + this.props[13] * h2 + this.props[14] * l2 + this.props[15] * p2 ;
                }
                return this;
            }

            var a1 = this.props[0];
            var b1 = this.props[1];
            var c1 = this.props[2];
            var d1 = this.props[3];
            var e1 = this.props[4];
            var f1 = this.props[5];
            var g1 = this.props[6];
            var h1 = this.props[7];
            var i1 = this.props[8];
            var j1 = this.props[9];
            var k1 = this.props[10];
            var l1 = this.props[11];
            var m1 = this.props[12];
            var n1 = this.props[13];
            var o1 = this.props[14];
            var p1 = this.props[15];

            /* matrix order (canvas compatible):
             * ace
             * bdf
             * 001
             */
            this.props[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
            this.props[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2 ;
            this.props[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2 ;
            this.props[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2 ;

            this.props[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2 ;
            this.props[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2 ;
            this.props[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2 ;
            this.props[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2 ;

            this.props[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2 ;
            this.props[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2 ;
            this.props[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2 ;
            this.props[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2 ;

            this.props[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2 ;
            this.props[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2 ;
            this.props[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2 ;
            this.props[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2 ;

            return this;
        }

        function clone(matr){
            var i;
            for(i=0;i<16;i+=1){
                matr.props[i] = this.props[i];
            }
        }

        function cloneFromProps(props){
            var i;
            for(i=0;i<16;i+=1){
                this.props[i] = props[i];
            }
        }

        function applyToPoint(x, y, z) {

            return {
                x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
                y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
                z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
            };
            /*return {
             x: x * me.a + y * me.c + me.e,
             y: x * me.b + y * me.d + me.f
             };*/
        }
        function applyToX(x, y, z) {
            return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
        }
        function applyToY(x, y, z) {
            return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
        }
        function applyToZ(x, y, z) {
            return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
        }

        function inversePoints(pts){
            //var determinant = this.a * this.d - this.b * this.c;
            var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
            var a = this.props[5]/determinant;
            var b = - this.props[1]/determinant;
            var c = - this.props[4]/determinant;
            var d = this.props[0]/determinant;
            var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12])/determinant;
            var f = - (this.props[0] * this.props[13] - this.props[1] * this.props[12])/determinant;
            var i, len = pts.length, retPts = [];
            for(i=0;i<len;i+=1){
                retPts[i] = [pts[i][0] * a + pts[i][1] * c + e, pts[i][0] * b + pts[i][1] * d + f, 0]
            }
            return retPts;
        }

        function applyToPointArray(x,y,z){
            return [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
        }
        function applyToPointStringified(x, y) {
            return (bm_rnd(x * this.props[0] + y * this.props[4] + this.props[12]))+','+(bm_rnd(x * this.props[1] + y * this.props[5] + this.props[13]));
        }

        function toArray() {
            return [this.props[0],this.props[1],this.props[2],this.props[3],this.props[4],this.props[5],this.props[6],this.props[7],this.props[8],this.props[9],this.props[10],this.props[11],this.props[12],this.props[13],this.props[14],this.props[15]];
        }

        function toCSS() {
            if(isSafari){
                return "matrix3d(" + roundTo2Decimals(this.props[0]) + ',' + roundTo2Decimals(this.props[1]) + ',' + roundTo2Decimals(this.props[2]) + ',' + roundTo2Decimals(this.props[3]) + ',' + roundTo2Decimals(this.props[4]) + ',' + roundTo2Decimals(this.props[5]) + ',' + roundTo2Decimals(this.props[6]) + ',' + roundTo2Decimals(this.props[7]) + ',' + roundTo2Decimals(this.props[8]) + ',' + roundTo2Decimals(this.props[9]) + ',' + roundTo2Decimals(this.props[10]) + ',' + roundTo2Decimals(this.props[11]) + ',' + roundTo2Decimals(this.props[12]) + ',' + roundTo2Decimals(this.props[13]) + ',' + roundTo2Decimals(this.props[14]) + ',' + roundTo2Decimals(this.props[15]) + ')';
            } else {
                this.cssParts[1] = this.props.join(',');
                return this.cssParts.join('');
            }
        }

        function to2dCSS() {
            return "matrix(" + this.props[0] + ',' + this.props[1] + ',' + this.props[4] + ',' + this.props[5] + ',' + this.props[12] + ',' + this.props[13] + ")";
        }

        function toString() {
            return "" + this.toArray();
        }

        return function(){
            this.reset = reset;
            this.rotate = rotate;
            this.rotateX = rotateX;
            this.rotateY = rotateY;
            this.rotateZ = rotateZ;
            this.skew = skew;
            this.skewFromAxis = skewFromAxis;
            this.shear = shear;
            this.scale = scale;
            this.setTransform = setTransform;
            this.translate = translate;
            this.transform = transform;
            this.applyToPoint = applyToPoint;
            this.applyToX = applyToX;
            this.applyToY = applyToY;
            this.applyToZ = applyToZ;
            this.applyToPointArray = applyToPointArray;
            this.applyToPointStringified = applyToPointStringified;
            this.toArray = toArray;
            this.toCSS = toCSS;
            this.to2dCSS = to2dCSS;
            this.toString = toString;
            this.clone = clone;
            this.cloneFromProps = cloneFromProps;
            this.inversePoints = inversePoints;
            this._t = this.transform;

            this.props = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];

            this.cssParts = ['matrix3d(','',')'];
        }
    }());

    function Matrix() {


    }

    /*
     Copyright 2014 David Bau.

     Permission is hereby granted, free of charge, to any person obtaining
     a copy of this software and associated documentation files (the
     "Software"), to deal in the Software without restriction, including
     without limitation the rights to use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and to
     permit persons to whom the Software is furnished to do so, subject to
     the following conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
     IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
     CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
     TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
     SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

     */

    (function (pool, math) {
//
// The following constants are related to IEEE 754 limits.
//
        var global = this,
            width = 256,        // each RC4 output is 0 <= x < 256
            chunks = 6,         // at least six RC4 outputs for each double
            digits = 52,        // there are 52 significant digits in a double
            rngname = 'random', // rngname: name for Math.random and Math.seedrandom
            startdenom = math.pow(width, chunks),
            significance = math.pow(2, digits),
            overflow = significance * 2,
            mask = width - 1,
            nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
        function seedrandom(seed, options, callback) {
            var key = [];
            options = (options == true) ? { entropy: true } : (options || {});

            // Flatten the seed string or build one from local entropy if needed.
            var shortseed = mixkey(flatten(
                options.entropy ? [seed, tostring(pool)] :
                    (seed == null) ? autoseed() : seed, 3), key);

            // Use the seed to initialize an ARC4 generator.
            var arc4 = new ARC4(key);

            // This function returns a random double in [0, 1) that contains
            // randomness in every bit of the mantissa of the IEEE 754 value.
            var prng = function() {
                var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
                    d = startdenom,                 //   and denominator d = 2 ^ 48.
                    x = 0;                          //   and no 'extra last byte'.
                while (n < significance) {          // Fill up all significant digits by
                    n = (n + x) * width;              //   shifting numerator and
                    d *= width;                       //   denominator and generating a
                    x = arc4.g(1);                    //   new least-significant-byte.
                }
                while (n >= overflow) {             // To avoid rounding up, before adding
                    n /= 2;                           //   last byte, shift everything
                    d /= 2;                           //   right using integer math until
                    x >>>= 1;                         //   we have exactly the desired bits.
                }
                return (n + x) / d;                 // Form the number within [0, 1).
            };

            prng.int32 = function() { return arc4.g(4) | 0; }
            prng.quick = function() { return arc4.g(4) / 0x100000000; }
            prng.double = prng;

            // Mix the randomness into accumulated entropy.
            mixkey(tostring(arc4.S), pool);

            // Calling convention: what to return as a function of prng, seed, is_math.
            return (options.pass || callback ||
            function(prng, seed, is_math_call, state) {
                if (state) {
                    // Load the arc4 state from the given state if it has an S array.
                    if (state.S) { copy(state, arc4); }
                    // Only provide the .state method if requested via options.state.
                    prng.state = function() { return copy(arc4, {}); }
                }

                // If called as a method of Math (Math.seedrandom()), mutate
                // Math.random because that is how seedrandom.js has worked since v1.0.
                if (is_math_call) { math[rngname] = prng; return seed; }

                // Otherwise, it is a newer calling convention, so return the
                // prng directly.
                else return prng;
            })(
                prng,
                shortseed,
                'global' in options ? options.global : (this == math),
                options.state);
        }
        math['seed' + rngname] = seedrandom;

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
        function ARC4(key) {
            var t, keylen = key.length,
                me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

            // The empty key [] is treated as [0].
            if (!keylen) { key = [keylen++]; }

            // Set up S using the standard key scheduling algorithm.
            while (i < width) {
                s[i] = i++;
            }
            for (i = 0; i < width; i++) {
                s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
                s[j] = t;
            }

            // The "g" method returns the next (count) outputs as one number.
            (me.g = function(count) {
                // Using instance members instead of closure state nearly doubles speed.
                var t, r = 0,
                    i = me.i, j = me.j, s = me.S;
                while (count--) {
                    t = s[i = mask & (i + 1)];
                    r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
                }
                me.i = i; me.j = j;
                return r;
                // For robust unpredictability, the function call below automatically
                // discards an initial batch of values.  This is called RC4-drop[256].
                // See http://google.com/search?q=rsa+fluhrer+response&btnI
            })(width);
        }

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
        function copy(f, t) {
            t.i = f.i;
            t.j = f.j;
            t.S = f.S.slice();
            return t;
        };

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
        function flatten(obj, depth) {
            var result = [], typ = (typeof obj), prop;
            if (depth && typ == 'object') {
                for (prop in obj) {
                    try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
                }
            }
            return (result.length ? result : typ == 'string' ? obj : obj + '\0');
        }

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
        function mixkey(seed, key) {
            var stringseed = seed + '', smear, j = 0;
            while (j < stringseed.length) {
                key[mask & j] =
                    mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
            }
            return tostring(key);
        }

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
        function autoseed() {
            try {
                if (nodecrypto) { return tostring(nodecrypto.randomBytes(width)); }
                var out = new Uint8Array(width);
                (global.crypto || global.msCrypto).getRandomValues(out);
                return tostring(out);
            } catch (e) {
                var browser = global.navigator,
                    plugins = browser && browser.plugins;
                return [+new Date, global, plugins, global.screen, tostring(pool)];
            }
        }

//
// tostring()
// Converts an array of charcodes to a string
//
        function tostring(a) {
            return String.fromCharCode.apply(0, a);
        }

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
        mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//

// End anonymous scope, and pass initial values.
    })(
        [],     // pool: entropy pool starts empty
        BMMath    // math: package containing random, pow, and seedrandom
    );
    var BezierFactory = (function(){
        /**
         * BezierEasing - use bezier curve for transition easing function
         * by Gaëtan Renaudeau 2014 - 2015 – MIT License
         *
         * Credits: is based on Firefox's nsSMILKeySpline.cpp
         * Usage:
         * var spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
         * spline.get(x) => returns the easing value | x must be in [0, 1] range
         *
         */

        var ob = {};
        ob.getBezierEasing = getBezierEasing;
        var beziers = {};

        function getBezierEasing(a,b,c,d,nm){
            var str = nm || ('bez_' + a+'_'+b+'_'+c+'_'+d).replace(/\./g, 'p');
            if(beziers[str]){
                return beziers[str];
            }
            var bezEasing = new BezierEasing([a,b,c,d]);
            beziers[str] = bezEasing;
            return bezEasing;
        }

// These values are established by empiricism with tests (tradeoff: performance VS precision)
        var NEWTON_ITERATIONS = 4;
        var NEWTON_MIN_SLOPE = 0.001;
        var SUBDIVISION_PRECISION = 0.0000001;
        var SUBDIVISION_MAX_ITERATIONS = 10;

        var kSplineTableSize = 11;
        var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

        var float32ArraySupported = typeof Float32Array === "function";

        function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function calcBezier (aT, aA1, aA2) {
            return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
        }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function getSlope (aT, aA1, aA2) {
            return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }

        function binarySubdivide (aX, aA, aB, mX1, mX2) {
            var currentX, currentT, i = 0;
            do {
                currentT = aA + (aB - aA) / 2.0;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0.0) {
                    aB = currentT;
                } else {
                    aA = currentT;
                }
            } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
            return currentT;
        }

        function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
            for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0.0) return aGuessT;
                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }

        /**
         * points is an array of [ mX1, mY1, mX2, mY2 ]
         */
        function BezierEasing (points) {
            this._p = points;
            this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
            this._precomputed = false;

            this.get = this.get.bind(this);
        }

        BezierEasing.prototype = {

            get: function (x) {
                var mX1 = this._p[0],
                    mY1 = this._p[1],
                    mX2 = this._p[2],
                    mY2 = this._p[3];
                if (!this._precomputed) this._precompute();
                if (mX1 === mY1 && mX2 === mY2) return x; // linear
                // Because JavaScript number are imprecise, we should guarantee the extremes are right.
                if (x === 0) return 0;
                if (x === 1) return 1;
                return calcBezier(this._getTForX(x), mY1, mY2);
            },

            // Private part

            _precompute: function () {
                var mX1 = this._p[0],
                    mY1 = this._p[1],
                    mX2 = this._p[2],
                    mY2 = this._p[3];
                this._precomputed = true;
                if (mX1 !== mY1 || mX2 !== mY2)
                    this._calcSampleValues();
            },

            _calcSampleValues: function () {
                var mX1 = this._p[0],
                    mX2 = this._p[2];
                for (var i = 0; i < kSplineTableSize; ++i) {
                    this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
                }
            },

            /**
             * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
             */
            _getTForX: function (aX) {
                var mX1 = this._p[0],
                    mX2 = this._p[2],
                    mSampleValues = this._mSampleValues;

                var intervalStart = 0.0;
                var currentSample = 1;
                var lastSample = kSplineTableSize - 1;

                for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                    intervalStart += kSampleStepSize;
                }
                --currentSample;

                // Interpolate to provide an initial guess for t
                var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]);
                var guessForT = intervalStart + dist * kSampleStepSize;

                var initialSlope = getSlope(guessForT, mX1, mX2);
                if (initialSlope >= NEWTON_MIN_SLOPE) {
                    return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
                } else if (initialSlope === 0.0) {
                    return guessForT;
                } else {
                    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
                }
            }
        };

        return ob;

    }())


    function matrixManagerFunction(){

        var mat = new Matrix();

        var returnMatrix2D = function(rX, scaleX, scaleY, tX, tY){
            return mat.reset().translate(tX,tY).rotate(rX).scale(scaleX,scaleY).toCSS();
        };

        var getMatrix = function(animData){
            return returnMatrix2D(animData.tr.r[2],animData.tr.s[0],animData.tr.s[1],animData.tr.p[0],animData.tr.p[1]);
        };

        return {
            getMatrix : getMatrix
        };

    }
    var MatrixManager = matrixManagerFunction;
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if(!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        if(!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }());
    function createElement(parent,child,params){
        if(child){
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;
            child.prototype._parent = parent.prototype;
        }else{
            var instance = Object.create(parent.prototype,params);
            var getType = {};
            if(instance && getType.toString.call(instance.init) === '[object Function]'){
                instance.init();
            }
            return instance;
        }
    }

    function extendPrototype(source,destination){
        for (var attr in source.prototype) {
            if (source.prototype.hasOwnProperty(attr)) destination.prototype[attr] = source.prototype[attr];
        }
    }
    function bezFunction(){

        var easingFunctions = [];
        var math = Math;

        function pointOnLine2D(x1,y1, x2,y2, x3,y3){
            var det1 = (x1*y2) + (y1*x3) + (x2*y3) - (x3*y2) - (y3*x1) - (x2*y1);
            return det1 > -0.0001 && det1 < 0.0001;
        }

        function pointOnLine3D(x1,y1,z1, x2,y2,z2, x3,y3,z3){
            return pointOnLine2D(x1,y1, x2,y2, x3,y3) && pointOnLine2D(x1,z1, x2,z2, x3,z3);
        }

        /*function getEasingCurve(aa,bb,cc,dd,encodedFuncName) {
         if(!encodedFuncName){
         encodedFuncName = ('bez_' + aa+'_'+bb+'_'+cc+'_'+dd).replace(/\./g, 'p');
         }
         if(easingFunctions[encodedFuncName]){
         return easingFunctions[encodedFuncName];
         }
         var A0, B0, C0;
         var A1, B1, C1;
         easingFunctions[encodedFuncName] = function(tt) {
         var x = tt;
         var i = 0, z;
         while (++i < 20) {
         C0 = 3 * aa;
         B0 = 3 * (cc - aa) - C0;
         A0 = 1 - C0 - B0;
         z = (x * (C0 + x * (B0 + x * A0))) - tt;
         if (bm_abs(z) < 1e-3) break;
         x -= z / (C0 + x * (2 * B0 + 3 * A0 * x));
         }
         C1 = 3 * bb;
         B1 = 3 * (dd - bb) - C1;
         A1 = 1 - C1 - B1;
         var polyB = x * (C1 + x * (B1 + x * A1));
         //return c * polyB + b;
         return polyB;
         };
         return easingFunctions[encodedFuncName];
         }*/
        var getBezierLength = (function(){

            function Segment(l,p){
                this.l = l;
                this.p = p;
            }

            return function(pt1,pt2,pt3,pt4){
                var curveSegments = defaultCurveSegments;
                var k;
                var i, len;
                var ptCoord,perc,addedLength = 0;
                var ptDistance;
                var point = [],lastPoint = [];
                var lengthData = {
                    addedLength: 0,
                    segments: []
                };
                len = pt3.length;
                for(k=0;k<curveSegments;k+=1){
                    perc = k/(curveSegments-1);
                    ptDistance = 0;
                    for(i=0;i<len;i+=1){
                        ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*pt3[i]+3*(1-perc)*bm_pow(perc,2)*pt4[i]+bm_pow(perc,3)*pt2[i];
                        point[i] = ptCoord;
                        if(lastPoint[i] !== null){
                            ptDistance += bm_pow(point[i] - lastPoint[i],2);
                        }
                        lastPoint[i] = point[i];
                    }
                    if(ptDistance){
                        ptDistance = bm_sqrt(ptDistance);
                        addedLength += ptDistance;
                    }
                    lengthData.segments.push(new Segment(addedLength,perc));
                }
                lengthData.addedLength = addedLength;
                return lengthData;
            };
        }());

        function BezierData(length){
            this.segmentLength = 0;
            this.points = new Array(length);
        }

        function PointData(partial,point){
            this.partialLength = partial;
            this.point = point;
        }

        var buildBezierData = (function(){

            var storedData = {};

            return function (keyData){
                var pt1 = keyData.s;
                var pt2 = keyData.e;
                var pt3 = keyData.to;
                var pt4 = keyData.ti;
                var bezierName = (pt1.join('_')+'_'+pt2.join('_')+'_'+pt3.join('_')+'_'+pt4.join('_')).replace(/\./g, 'p');
                if(storedData[bezierName]){
                    keyData.bezierData = storedData[bezierName];
                    return;
                }
                var curveSegments = defaultCurveSegments;
                var k, i, len;
                var ptCoord,perc,addedLength = 0;
                var ptDistance;
                var point,lastPoint = null;
                if(pt1.length === 2 && (pt1[0] != pt2[0] || pt1[1] != pt2[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt1[0]+pt3[0],pt1[1]+pt3[1]) && pointOnLine2D(pt1[0],pt1[1],pt2[0],pt2[1],pt2[0]+pt4[0],pt2[1]+pt4[1])){
                    curveSegments = 2;
                }
                var bezierData = new BezierData(curveSegments);
                len = pt3.length;
                for(k=0;k<curveSegments;k+=1){
                    point = new Array(len);
                    perc = k/(curveSegments-1);
                    ptDistance = 0;
                    for(i=0;i<len;i+=1){
                        ptCoord = bm_pow(1-perc,3)*pt1[i]+3*bm_pow(1-perc,2)*perc*(pt1[i] + pt3[i])+3*(1-perc)*bm_pow(perc,2)*(pt2[i] + pt4[i])+bm_pow(perc,3)*pt2[i];
                        point[i] = ptCoord;
                        if(lastPoint !== null){
                            ptDistance += bm_pow(point[i] - lastPoint[i],2);
                        }
                    }
                    ptDistance = bm_sqrt(ptDistance);
                    addedLength += ptDistance;
                    bezierData.points[k] = new PointData(ptDistance,point);
                    lastPoint = point;
                }
                bezierData.segmentLength = addedLength;
                keyData.bezierData = bezierData;
                storedData[bezierName] = bezierData;

            }
        }());

        function getDistancePerc(perc,bezierData){
            var segments = bezierData.segments;
            var len = segments.length;
            var initPos = bm_floor((len-1)*perc);
            var lengthPos = perc*bezierData.addedLength;
            var lPerc = 0;
            if(lengthPos == segments[initPos].l){
                return segments[initPos].p;
            }else{
                var dir = segments[initPos].l > lengthPos ? -1 : 1;
                var flag = true;
                while(flag){
                    if(segments[initPos].l <= lengthPos && segments[initPos+1].l > lengthPos){
                        lPerc = (lengthPos - segments[initPos].l)/(segments[initPos+1].l-segments[initPos].l);
                        flag = false;
                    }else{
                        initPos += dir;
                    }
                    if(initPos < 0 || initPos >= len - 1){
                        flag = false;
                    }
                }
                return segments[initPos].p + (segments[initPos+1].p - segments[initPos].p)*lPerc;
            }
        }

        function SegmentPoints(){
            this.pt1 = new Array(2);
            this.pt2 = new Array(2);
            this.pt3 = new Array(2);
            this.pt4 = new Array(2);
        }

        function getNewSegment(pt1,pt2,pt3,pt4,startPerc,endPerc, bezierData){

            var pts = new SegmentPoints();
            startPerc = startPerc < 0 ? 0 : startPerc > 1 ? 1 : startPerc;
            var t0 = getDistancePerc(startPerc,bezierData);
            endPerc = endPerc > 1 ? 1 : endPerc;
            var t1 = getDistancePerc(endPerc,bezierData);
            var i, len = pt1.length;
            var u0 = 1 - t0;
            var u1 = 1 - t1;
            //Math.round(num * 100) / 100
            for(i=0;i<len;i+=1){
                pts.pt1[i] =  Math.round((u0*u0*u0* pt1[i] + (t0*u0*u0 + u0*t0*u0 + u0*u0*t0) * pt3[i] + (t0*t0*u0 + u0*t0*t0 + t0*u0*t0)* pt4[i] + t0*t0*t0* pt2[i])* 1000) / 1000;
                pts.pt3[i] = Math.round((u0*u0*u1*pt1[i] + (t0*u0*u1 + u0*t0*u1 + u0*u0*t1)* pt3[i] + (t0*t0*u1 + u0*t0*t1 + t0*u0*t1)* pt4[i] + t0*t0*t1* pt2[i])* 1000) / 1000;
                pts.pt4[i] = Math.round((u0*u1*u1* pt1[i] + (t0*u1*u1 + u0*t1*u1 + u0*u1*t1)* pt3[i] + (t0*t1*u1 + u0*t1*t1 + t0*u1*t1)* pt4[i] + t0*t1*t1* pt2[i])* 1000) / 1000;
                pts.pt2[i] = Math.round((u1*u1*u1* pt1[i] + (t1*u1*u1 + u1*t1*u1 + u1*u1*t1)* pt3[i] + (t1*t1*u1 + u1*t1*t1 + t1*u1*t1)*pt4[i] + t1*t1*t1* pt2[i])* 1000) / 1000;
            }
            return pts;
        }

        return {
            //getEasingCurve : getEasingCurve,
            getBezierLength : getBezierLength,
            getNewSegment : getNewSegment,
            buildBezierData : buildBezierData,
            pointOnLine2D : pointOnLine2D,
            pointOnLine3D : pointOnLine3D
        };
    }

    var bez = bezFunction();
    function dataFunctionManager(){

        //var tCanvasHelper = document.createElement('canvas').getContext('2d');

        function completeLayers(layers, comps, fontManager){
            var layerData;
            var animArray, lastFrame;
            var i, len = layers.length;
            var j, jLen, k, kLen;
            for(i=0;i<len;i+=1){
                layerData = layers[i];
                if(!('ks' in layerData) || layerData.completed){
                    continue;
                }
                layerData.completed = true;
                if(layerData.tt){
                    layers[i-1].td = layerData.tt;
                }
                animArray = [];
                lastFrame = -1;
                if(layerData.hasMask){
                    var maskProps = layerData.masksProperties;
                    jLen = maskProps.length;
                    for(j=0;j<jLen;j+=1){
                        if(maskProps[j].pt.k.i){
                            convertPathsToAbsoluteValues(maskProps[j].pt.k);
                        }else{
                            kLen = maskProps[j].pt.k.length;
                            for(k=0;k<kLen;k+=1){
                                if(maskProps[j].pt.k[k].s){
                                    convertPathsToAbsoluteValues(maskProps[j].pt.k[k].s[0]);
                                }
                                if(maskProps[j].pt.k[k].e){
                                    convertPathsToAbsoluteValues(maskProps[j].pt.k[k].e[0]);
                                }
                            }
                        }
                    }
                }
                if(layerData.ty===0){
                    layerData.layers = findCompLayers(layerData.refId, comps);
                    completeLayers(layerData.layers,comps, fontManager);
                }else if(layerData.ty === 4){
                    completeShapes(layerData.shapes);
                }else if(layerData.ty == 5){
                    completeText(layerData, fontManager);
                }
            }
        }

        function findCompLayers(id,comps){
            var i = 0, len = comps.length;
            while(i<len){
                if(comps[i].id === id){
                    return comps[i].layers;
                }
                i += 1;
            }
        }

        function completeShapes(arr){
            var i, len = arr.length;
            var j, jLen;
            var hasPaths = false;
            for(i=len-1;i>=0;i-=1){
                if(arr[i].ty == 'sh'){
                    if(arr[i].ks.k.i){
                        convertPathsToAbsoluteValues(arr[i].ks.k);
                    }else{
                        jLen = arr[i].ks.k.length;
                        for(j=0;j<jLen;j+=1){
                            if(arr[i].ks.k[j].s){
                                convertPathsToAbsoluteValues(arr[i].ks.k[j].s[0]);
                            }
                            if(arr[i].ks.k[j].e){
                                convertPathsToAbsoluteValues(arr[i].ks.k[j].e[0]);
                            }
                        }
                    }
                    hasPaths = true;
                }else if(arr[i].ty == 'gr'){
                    completeShapes(arr[i].it);
                }
            }
            /*if(hasPaths){
             //mx: distance
             //ss: sensitivity
             //dc: decay
             arr.splice(arr.length-1,0,{
             "ty": "ms",
             "mx":20,
             "ss":10,
             "dc":0.001,
             "maxDist":200
             });
             }*/
        }

        function convertPathsToAbsoluteValues(path){
            var i, len = path.i.length;
            for(i=0;i<len;i+=1){
                path.i[i][0] += path.v[i][0];
                path.i[i][1] += path.v[i][1];
                path.o[i][0] += path.v[i][0];
                path.o[i][1] += path.v[i][1];
            }
        }

        function checkVersion(minimum,animVersionString){
            var animVersion = animVersionString ? animVersionString.split('.') : [100,100,100];
            if(minimum[0]>animVersion[0]){
                return true;
            } else if(animVersion[0] > minimum[0]){
                return false;
            }
            if(minimum[1]>animVersion[1]){
                return true;
            } else if(animVersion[1] > minimum[1]){
                return false;
            }
            if(minimum[2]>animVersion[2]){
                return true;
            } else if(animVersion[2] > minimum[2]){
                return false;
            }
        }

        var checkText = (function(){
            var minimumVersion = [4,4,14];

            function updateTextLayer(textLayer){
                var documentData = textLayer.t.d;
                textLayer.t.d = {
                    k: [
                        {
                            s:documentData,
                            t:0
                        }
                    ]
                }
            }

            function iterateLayers(layers){
                var i, len = layers.length;
                for(i=0;i<len;i+=1){
                    if(layers[i].ty === 5){
                        updateTextLayer(layers[i]);
                    }
                }
            }

            return function (animationData){
                if(checkVersion(minimumVersion,animationData.v)){
                    iterateLayers(animationData.layers);
                    if(animationData.assets){
                        var i, len = animationData.assets.length;
                        for(i=0;i<len;i+=1){
                            if(animationData.assets[i].layers){
                                iterateLayers(animationData.assets[i].layers);

                            }
                        }
                    }
                }
            }
        }())

        var checkColors = (function(){
            var minimumVersion = [4,1,9];

            function iterateShapes(shapes){
                var i, len = shapes.length;
                var j, jLen;
                for(i=0;i<len;i+=1){
                    if(shapes[i].ty === 'gr'){
                        iterateShapes(shapes[i].it);
                    }else if(shapes[i].ty === 'fl' || shapes[i].ty === 'st'){
                        if(shapes[i].c.k && shapes[i].c.k[0].i){
                            jLen = shapes[i].c.k.length;
                            for(j=0;j<jLen;j+=1){
                                if(shapes[i].c.k[j].s){
                                    shapes[i].c.k[j].s[0] /= 255;
                                    shapes[i].c.k[j].s[1] /= 255;
                                    shapes[i].c.k[j].s[2] /= 255;
                                    shapes[i].c.k[j].s[3] /= 255;
                                }
                                if(shapes[i].c.k[j].e){
                                    shapes[i].c.k[j].e[0] /= 255;
                                    shapes[i].c.k[j].e[1] /= 255;
                                    shapes[i].c.k[j].e[2] /= 255;
                                    shapes[i].c.k[j].e[3] /= 255;
                                }
                            }
                        } else {
                            shapes[i].c.k[0] /= 255;
                            shapes[i].c.k[1] /= 255;
                            shapes[i].c.k[2] /= 255;
                            shapes[i].c.k[3] /= 255;
                        }
                    }
                }
            }

            function iterateLayers(layers){
                var i, len = layers.length;
                for(i=0;i<len;i+=1){
                    if(layers[i].ty === 4){
                        iterateShapes(layers[i].shapes);
                    }
                }
            }

            return function (animationData){
                if(checkVersion(minimumVersion,animationData.v)){
                    iterateLayers(animationData.layers);
                    if(animationData.assets){
                        var i, len = animationData.assets.length;
                        for(i=0;i<len;i+=1){
                            if(animationData.assets[i].layers){
                                iterateLayers(animationData.assets[i].layers);

                            }
                        }
                    }
                }
            }
        }());

        var checkShapes = (function(){
            var minimumVersion = [4,4,18];



            function completeShapes(arr){
                var i, len = arr.length;
                var j, jLen;
                var hasPaths = false;
                for(i=len-1;i>=0;i-=1){
                    if(arr[i].ty == 'sh'){
                        if(arr[i].ks.k.i){
                            arr[i].ks.k.c = arr[i].closed;
                        }else{
                            jLen = arr[i].ks.k.length;
                            for(j=0;j<jLen;j+=1){
                                if(arr[i].ks.k[j].s){
                                    arr[i].ks.k[j].s[0].c = arr[i].closed;
                                }
                                if(arr[i].ks.k[j].e){
                                    arr[i].ks.k[j].e[0].c = arr[i].closed;
                                }
                            }
                        }
                        hasPaths = true;
                    }else if(arr[i].ty == 'gr'){
                        completeShapes(arr[i].it);
                    }
                }
            }

            function iterateLayers(layers){
                var layerData;
                var i, len = layers.length;
                var j, jLen, k, kLen;
                for(i=0;i<len;i+=1){
                    layerData = layers[i];
                    if(layerData.hasMask){
                        var maskProps = layerData.masksProperties;
                        jLen = maskProps.length;
                        for(j=0;j<jLen;j+=1){
                            if(maskProps[j].pt.k.i){
                                maskProps[j].pt.k.c = maskProps[j].cl;
                            }else{
                                kLen = maskProps[j].pt.k.length;
                                for(k=0;k<kLen;k+=1){
                                    if(maskProps[j].pt.k[k].s){
                                        maskProps[j].pt.k[k].s[0].c = maskProps[j].cl;
                                    }
                                    if(maskProps[j].pt.k[k].e){
                                        maskProps[j].pt.k[k].e[0].c = maskProps[j].cl;
                                    }
                                }
                            }
                        }
                    }
                    if(layerData.ty === 4){
                        completeShapes(layerData.shapes);
                    }
                }
            }

            return function (animationData){
                if(checkVersion(minimumVersion,animationData.v)){
                    iterateLayers(animationData.layers);
                    if(animationData.assets){
                        var i, len = animationData.assets.length;
                        for(i=0;i<len;i+=1){
                            if(animationData.assets[i].layers){
                                iterateLayers(animationData.assets[i].layers);

                            }
                        }
                    }
                }
            }
        }());

        /*function blitPaths(path){
         var i, len = path.i.length;
         for(i=0;i<len;i+=1){
         path.i[i][0] /= blitter;
         path.i[i][1] /= blitter;
         path.o[i][0] /= blitter;
         path.o[i][1] /= blitter;
         path.v[i][0] /= blitter;
         path.v[i][1] /= blitter;
         }
         }

         function blitShapes(arr){
         var i, len = arr.length;
         var j, jLen;
         var hasPaths = false;
         for(i=len-1;i>=0;i-=1){
         if(arr[i].ty == 'sh'){
         if(arr[i].ks.k.i){
         blitPaths(arr[i].ks.k);
         }else{
         jLen = arr[i].ks.k.length;
         for(j=0;j<jLen;j+=1){
         if(arr[i].ks.k[j].s){
         blitPaths(arr[i].ks.k[j].s[0]);
         }
         if(arr[i].ks.k[j].e){
         blitPaths(arr[i].ks.k[j].e[0]);
         }
         }
         }
         hasPaths = true;
         }else if(arr[i].ty == 'gr'){
         blitShapes(arr[i].it);
         }else if(arr[i].ty == 'rc'){
         blitProperty(arr[i].p);
         blitProperty(arr[i].s);
         }else if(arr[i].ty == 'st'){
         blitProperty(arr[i].w);
         }else if(arr[i].ty == 'tr'){
         blitProperty(arr[i].p);
         blitProperty(arr[i].sk);
         blitProperty(arr[i].a);
         }else if(arr[i].ty == 'el'){
         blitProperty(arr[i].p);
         blitProperty(arr[i].s);
         }else if(arr[i].ty == 'rd'){
         blitProperty(arr[i].r);
         }else{

         //console.log(arr[i].ty );
         }
         }
         }

         function blitText(data, fontManager){

         }

         function blitValue(val){
         if(typeof(val) === 'number'){
         val /= blitter;
         } else {
         var i = val.length-1;
         while(i>=0){
         val[i] /= blitter;
         i-=1;
         }
         }
         return val;
         }

         function blitProperty(data){
         if(!data.k.length){
         data.k = blitValue(data.k);
         }else if(typeof(data.k[0]) === 'number'){
         data.k = blitValue(data.k);
         } else {
         var i, len = data.k.length;
         for(i=0;i<len;i+=1){
         if(data.k[i].s){
         //console.log('pre S: ', data.k[i].s);
         data.k[i].s = blitValue(data.k[i].s);
         //console.log('post S: ', data.k[i].s);
         }
         if(data.k[i].e){
         //console.log('pre E: ', data.k[i].e);
         data.k[i].e = blitValue(data.k[i].e);
         //console.log('post E: ', data.k[i].e);
         }
         }
         }
         }

         function blitLayers(layers,comps, fontManager){
         var layerData;
         var animArray, lastFrame;
         var i, len = layers.length;
         var j, jLen, k, kLen;
         for(i=0;i<len;i+=1){
         layerData = layers[i];
         if(!('ks' in layerData)){
         continue;
         }
         blitProperty(layerData.ks.a);
         blitProperty(layerData.ks.p);
         layerData.completed = true;
         if(layerData.tt){
         layers[i-1].td = layerData.tt;
         }
         animArray = [];
         lastFrame = -1;
         if(layerData.hasMask){
         var maskProps = layerData.masksProperties;
         jLen = maskProps.length;
         for(j=0;j<jLen;j+=1){
         if(maskProps[j].pt.k.i){
         blitPaths(maskProps[j].pt.k);
         }else{
         kLen = maskProps[j].pt.k.length;
         for(k=0;k<kLen;k+=1){
         if(maskProps[j].pt.k[k].s){
         blitPaths(maskProps[j].pt.k[k].s[0]);
         }
         if(maskProps[j].pt.k[k].e){
         blitPaths(maskProps[j].pt.k[k].e[0]);
         }
         }
         }
         }
         }
         if(layerData.ty===0){
         layerData.w = Math.round(layerData.w/blitter);
         layerData.h = Math.round(layerData.h/blitter);
         blitLayers(layerData.layers,comps, fontManager);
         }else if(layerData.ty === 4){
         blitShapes(layerData.shapes);
         }else if(layerData.ty == 5){
         blitText(layerData, fontManager);
         }else if(layerData.ty == 1){
         layerData.sh /= blitter;
         layerData.sw /= blitter;
         } else {
         }
         }
         }

         function blitAnimation(animationData,comps, fontManager){
         blitLayers(animationData.layers,comps, fontManager);
         }*/

        function completeData(animationData, fontManager){
            if(animationData.__complete){
                return;
            }
            checkColors(animationData);
            checkText(animationData);
            checkShapes(animationData);
            completeLayers(animationData.layers, animationData.assets, fontManager);
            animationData.__complete = true;
            //blitAnimation(animationData, animationData.assets, fontManager);
        }

        function completeText(data, fontManager){
            var letters;
            var keys = data.t.d.k;
            var k, kLen = keys.length;
            for(k=0;k<kLen;k+=1){
                var documentData = data.t.d.k[k].s;
                letters = [];
                var i, len;
                var newLineFlag, index = 0, val;
                var anchorGrouping = data.t.m.g;
                var currentSize = 0, currentPos = 0, currentLine = 0, lineWidths = [];
                var lineWidth = 0;
                var maxLineWidth = 0;
                var j, jLen;
                var fontData = fontManager.getFontByName(documentData.f);
                var charData, cLength = 0;
                var styles = fontData.fStyle.split(' ');

                var fWeight = 'normal', fStyle = 'normal';
                len = styles.length;
                for(i=0;i<len;i+=1){
                    if (styles[i].toLowerCase() === 'italic') {
                        fStyle = 'italic';
                    }else if (styles[i].toLowerCase() === 'bold') {
                        fWeight = '700';
                    } else if (styles[i].toLowerCase() === 'black') {
                        fWeight = '900';
                    } else if (styles[i].toLowerCase() === 'medium') {
                        fWeight = '500';
                    } else if (styles[i].toLowerCase() === 'regular' || styles[i].toLowerCase() === 'normal') {
                        fWeight = '400';
                    } else if (styles[i].toLowerCase() === 'light' || styles[i].toLowerCase() === 'thin') {
                        fWeight = '200';
                    }
                }
                documentData.fWeight = fWeight;
                documentData.fStyle = fStyle;
                len = documentData.t.length;
                if(documentData.sz){
                    var boxWidth = documentData.sz[0];
                    var lastSpaceIndex = -1;
                    for(i=0;i<len;i+=1){
                        newLineFlag = false;
                        if(documentData.t.charAt(i) === ' '){
                            lastSpaceIndex = i;
                        }else if(documentData.t.charCodeAt(i) === 13){
                            lineWidth = 0;
                            newLineFlag = true;
                        }
                        if(fontManager.chars){
                            charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontData.fFamily);
                            cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
                        }else{
                            //tCanvasHelper.font = documentData.s + 'px '+ fontData.fFamily;
                            cLength = fontManager.measureText(documentData.t.charAt(i), documentData.f, documentData.s);
                        }
                        if(lineWidth + cLength > boxWidth){
                            if(lastSpaceIndex === -1){
                                //i -= 1;
                                documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i);
                                len += 1;
                            } else {
                                i = lastSpaceIndex;
                                documentData.t = documentData.t.substr(0,i) + "\r" + documentData.t.substr(i+1);
                            }
                            lastSpaceIndex = -1;
                            lineWidth = 0;
                        }else {
                            lineWidth += cLength;
                        }
                    }
                    len = documentData.t.length;
                }
                lineWidth = 0;
                cLength = 0;
                for (i = 0;i < len ;i += 1) {
                    newLineFlag = false;
                    if(documentData.t.charAt(i) === ' '){
                        val = '\u00A0';
                    }else if(documentData.t.charCodeAt(i) === 13){
                        lineWidths.push(lineWidth);
                        maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
                        lineWidth = 0;
                        val = '';
                        newLineFlag = true;
                        currentLine += 1;
                    }else{
                        val = documentData.t.charAt(i);
                    }
                    if(fontManager.chars){
                        charData = fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, fontManager.getFontByName(documentData.f).fFamily);
                        cLength = newLineFlag ? 0 : charData.w*documentData.s/100;
                    }else{
                        //var charWidth = fontManager.measureText(val, documentData.f, documentData.s);
                        //tCanvasHelper.font = documentData.s + 'px '+ fontManager.getFontByName(documentData.f).fFamily;
                        cLength = fontManager.measureText(val, documentData.f, documentData.s);
                    }

                    //
                    lineWidth += cLength;
                    letters.push({l:cLength,an:cLength,add:currentSize,n:newLineFlag, anIndexes:[], val: val, line: currentLine});
                    if(anchorGrouping == 2){
                        currentSize += cLength;
                        if(val == '' || val == '\u00A0' || i == len - 1){
                            if(val == '' || val == '\u00A0'){
                                currentSize -= cLength;
                            }
                            while(currentPos<=i){
                                letters[currentPos].an = currentSize;
                                letters[currentPos].ind = index;
                                letters[currentPos].extra = cLength;
                                currentPos += 1;
                            }
                            index += 1;
                            currentSize = 0;
                        }
                    }else if(anchorGrouping == 3){
                        currentSize += cLength;
                        if(val == '' || i == len - 1){
                            if(val == ''){
                                currentSize -= cLength;
                            }
                            while(currentPos<=i){
                                letters[currentPos].an = currentSize;
                                letters[currentPos].ind = index;
                                letters[currentPos].extra = cLength;
                                currentPos += 1;
                            }
                            currentSize = 0;
                            index += 1;
                        }
                    }else{
                        letters[index].ind = index;
                        letters[index].extra = 0;
                        index += 1;
                    }
                }
                documentData.l = letters;
                maxLineWidth = lineWidth > maxLineWidth ? lineWidth : maxLineWidth;
                lineWidths.push(lineWidth);
                if(documentData.sz){
                    documentData.boxWidth = documentData.sz[0];
                    documentData.justifyOffset = 0;
                }else{
                    documentData.boxWidth = maxLineWidth;
                    switch(documentData.j){
                        case 1:
                            documentData.justifyOffset = - documentData.boxWidth;
                            break;
                        case 2:
                            documentData.justifyOffset = - documentData.boxWidth/2;
                            break;
                        default:
                            documentData.justifyOffset = 0;
                    }
                }
                documentData.lineWidths = lineWidths;

                var animators = data.t.a;
                jLen = animators.length;
                var based, ind, indexes = [];
                for(j=0;j<jLen;j+=1){
                    if(animators[j].a.sc){
                        documentData.strokeColorAnim = true;
                    }
                    if(animators[j].a.sw){
                        documentData.strokeWidthAnim = true;
                    }
                    if(animators[j].a.fc || animators[j].a.fh || animators[j].a.fs || animators[j].a.fb){
                        documentData.fillColorAnim = true;
                    }
                    ind = 0;
                    based = animators[j].s.b;
                    for(i=0;i<len;i+=1){
                        letters[i].anIndexes[j] = ind;
                        if((based == 1 && letters[i].val != '') || (based == 2 && letters[i].val != '' && letters[i].val != '\u00A0') || (based == 3 && (letters[i].n || letters[i].val == '\u00A0' || i == len - 1)) || (based == 4 && (letters[i].n || i == len - 1))){
                            if(animators[j].s.rn === 1){
                                indexes.push(ind);
                            }
                            ind += 1;
                        }
                    }
                    data.t.a[j].s.totalChars = ind;
                    var currentInd = -1, newInd;
                    if(animators[j].s.rn === 1){
                        for(i = 0; i < len; i += 1){
                            if(currentInd != letters[i].anIndexes[j]){
                                currentInd = letters[i].anIndexes[j];
                                newInd = indexes.splice(Math.floor(Math.random()*indexes.length),1)[0];
                            }
                            letters[i].anIndexes[j] = newInd;
                        }
                    }
                }
                if(jLen === 0 && !('m' in data.t.p)){
                    data.singleShape = true;
                }
                documentData.yOffset = documentData.lh || documentData.s*1.2;
                documentData.ascent = fontData.ascent*documentData.s/100;
            }

        }

        var moduleOb = {};
        moduleOb.completeData = completeData;

        return moduleOb;
    }

    var dataManager = dataFunctionManager();
    var FontManager = (function(){

        var maxWaitingTime = 5000;

        function setUpNode(font, family){
            var parentNode = document.createElement('span');
            parentNode.style.fontFamily    = family;
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            parentNode.style.position      = 'absolute';
            parentNode.style.left          = '-10000px';
            parentNode.style.top           = '-10000px';
            // Large font size makes even subtle changes obvious
            parentNode.style.fontSize      = '300px';
            // Reset any font properties
            parentNode.style.fontVariant   = 'normal';
            parentNode.style.fontStyle     = 'normal';
            parentNode.style.fontWeight    = 'normal';
            parentNode.style.letterSpacing = '0';
            parentNode.appendChild(node);
            document.body.appendChild(parentNode);

            // Remember width with no applied web font
            var width = node.offsetWidth;
            node.style.fontFamily = font + ', '+family;
            return {node:node, w:width, parent:parentNode};
        }

        function checkLoadedFonts() {
            var i, len = this.fonts.length;
            var node, w;
            var loadedCount = len;
            for(i=0;i<len; i+= 1){
                if(this.fonts[i].loaded){
                    loadedCount -= 1;
                    continue;
                }
                if(this.fonts[i].fOrigin === 't'){
                    if(window.Typekit && window.Typekit.load && this.typekitLoaded === 0){
                        this.typekitLoaded = 1;
                        try{window.Typekit.load({
                            async: true,
                            active: function() {
                                this.typekitLoaded = 2;
                            }.bind(this)
                        });}catch(e){}
                    }
                    if(this.typekitLoaded === 2) {
                        this.fonts[i].loaded = true;
                    }
                } else if(this.fonts[i].fOrigin === 'n'){
                    this.fonts[i].loaded = true;
                } else{
                    node = this.fonts[i].monoCase.node;
                    w = this.fonts[i].monoCase.w;
                    if(node.offsetWidth !== w){
                        loadedCount -= 1;
                        this.fonts[i].loaded = true;
                    }else{
                        node = this.fonts[i].sansCase.node;
                        w = this.fonts[i].sansCase.w;
                        if(node.offsetWidth !== w){
                            loadedCount -= 1;
                            this.fonts[i].loaded = true;
                        }
                    }
                    if(this.fonts[i].loaded){
                        this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
                        this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
                    }
                }
            }

            if(loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime){
                setTimeout(checkLoadedFonts.bind(this),20);
            }else{
                setTimeout(function(){this.loaded = true;}.bind(this),0);

            }
        };

        function createHelper(def, fontData){
            var tHelper = document.createElementNS(svgNS,'text');
            tHelper.style.fontSize = '100px';
            tHelper.style.fontFamily = fontData.fFamily;
            tHelper.textContent = '1';
            if(fontData.fClass){
                tHelper.style.fontFamily = 'inherit';
                tHelper.className = fontData.fClass;
            } else {
                tHelper.style.fontFamily = fontData.fFamily;
            }
            def.appendChild(tHelper);
            var tCanvasHelper = document.createElement('canvas').getContext('2d');
            tCanvasHelper.font = '100px '+ fontData.fFamily;
            return tCanvasHelper;
            return tHelper;
        }

        function addFonts(fontData, defs){
            if(!fontData){
                this.loaded = true;
                return;
            }
            if(this.chars){
                this.loaded = true;
                this.fonts = fontData.list;
                return;
            }

            var fontArr = fontData.list;
            var i, len = fontArr.length;
            for(i=0; i<len; i+= 1){
                fontArr[i].loaded = false;
                fontArr[i].monoCase = setUpNode(fontArr[i].fFamily,'monospace');
                fontArr[i].sansCase = setUpNode(fontArr[i].fFamily,'sans-serif');
                if(!fontArr[i].fPath) {
                    fontArr[i].loaded = true;
                }else if(fontArr[i].fOrigin === 'p'){
                    var s = document.createElement('style');
                    s.type = "text/css";
                    s.innerHTML = "@font-face {" + "font-family: "+fontArr[i].fFamily+"; font-style: normal; src: url('"+fontArr[i].fPath+"');}";
                    defs.appendChild(s);
                } else if(fontArr[i].fOrigin === 'g'){
                    //<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' type='text/css'>
                    var l = document.createElement('link');
                    l.type = "text/css";
                    l.rel = "stylesheet";
                    l.href = fontArr[i].fPath;
                    defs.appendChild(l);
                } else if(fontArr[i].fOrigin === 't'){
                    //<link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet' type='text/css'>
                    var sc = document.createElement('script');
                    sc.setAttribute('src',fontArr[i].fPath);
                    defs.appendChild(sc);
                }
                fontArr[i].helper = createHelper(defs,fontArr[i]);
                this.fonts.push(fontArr[i]);
            }
            checkLoadedFonts.bind(this)();
        }

        function addChars(chars){
            if(!chars){
                return;
            }
            if(!this.chars){
                this.chars = [];
            }
            var i, len = chars.length;
            var j, jLen = this.chars.length, found;
            for(i=0;i<len;i+=1){
                j = 0;
                found = false;
                while(j<jLen){
                    if(this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch){
                        found = true;
                    }
                    j += 1;
                }
                if(!found){
                    this.chars.push(chars[i]);
                    jLen += 1;
                }
            }
        }

        function getCharData(char, style, font){
            var i = 0, len = this.chars.length;
            while( i < len) {
                if(this.chars[i].ch === char && this.chars[i].style === style && this.chars[i].fFamily === font){
                    return this.chars[i];
                }
                i+= 1;
            }
        }

        function measureText(char, fontName, size){
            var fontData = this.getFontByName(fontName);
            var tHelper = fontData.helper;
            //tHelper.textContent = char;
            return tHelper.measureText(char).width*size/100;
            //return tHelper.getComputedTextLength()*size/100;
        }

        function getFontByName(name){
            var i = 0, len = this.fonts.length;
            while(i<len){
                if(this.fonts[i].fName === name) {
                    return this.fonts[i];
                }
                i += 1;
            }
            return 'sans-serif';
        }

        var Font = function(){
            this.fonts = [];
            this.chars = null;
            this.typekitLoaded = 0;
            this.loaded = false;
            this.initTime = Date.now();
        };
        Font.prototype.addChars = addChars;
        Font.prototype.addFonts = addFonts;
        Font.prototype.getCharData = getCharData;
        Font.prototype.getFontByName = getFontByName;
        Font.prototype.measureText = measureText;

        return Font;

    }());
    var PropertyFactory = (function(){

        var initFrame = -999999;

        function getValue(){
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            var frameNum = this.comp.renderedFrame - this.offsetTime;
            if(frameNum === this.lastFrame || (this.lastFrame !== initFrame && ((this.lastFrame >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime && frameNum >= this.keyframes[this.keyframes.length- 1].t-this.offsetTime) || (this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime)))){

            }else{
                var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
                var keyData, nextKeyData;

                while(flag){
                    keyData = this.keyframes[i];
                    nextKeyData = this.keyframes[i+1];
                    if(i == len-1 && frameNum >= nextKeyData.t - this.offsetTime){
                        if(keyData.h){
                            keyData = nextKeyData;
                        }
                        break;
                    }
                    if((nextKeyData.t - this.offsetTime) > frameNum){
                        break;
                    }
                    if(i < len - 1){
                        i += dir;
                    }else{
                        flag = false;
                    }
                }

                var k, kLen,perc,jLen, j = 0, fnc;
                if(keyData.to){

                    if(!keyData.bezierData){
                        bez.buildBezierData(keyData);
                    }
                    var bezierData = keyData.bezierData;
                    if(frameNum >= nextKeyData.t-this.offsetTime || frameNum < keyData.t-this.offsetTime){
                        var ind = frameNum >= nextKeyData.t-this.offsetTime ? bezierData.points.length - 1 : 0;
                        kLen = bezierData.points[ind].point.length;
                        for(k = 0; k < kLen; k += 1){
                            this.v[k] = this.mult ? bezierData.points[ind].point[k]*this.mult : bezierData.points[ind].point[k];
                            this.pv[k] = bezierData.points[ind].point[k];
                            if(this.lastPValue[k] !== this.pv[k]) {
                                this.mdf = true;
                                this.lastPValue[k] = this.pv[k];
                            }
                        }
                    }else{
                        if(keyData.__fnct){
                            fnc = keyData.__fnct;
                        }else{
                            fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n).get;
                            keyData.__fnct = fnc;
                        }
                        perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                        var distanceInLine = bezierData.segmentLength*perc;

                        var segmentPerc;
                        var addedLength = 0;
                        dir = 1;
                        flag = true;
                        jLen = bezierData.points.length;
                        while(flag){
                            addedLength +=bezierData.points[j].partialLength*dir;
                            if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                                kLen = bezierData.points[j].point.length;
                                for(k=0;k<kLen;k+=1){
                                    this.v[k] = this.mult ? bezierData.points[j].point[k]*this.mult : bezierData.points[j].point[k];
                                    this.pv[k] = bezierData.points[j].point[k];
                                    if(this.lastPValue[k] !== this.pv[k]) {
                                        this.mdf = true;
                                        this.lastPValue[k] = this.pv[k];
                                    }
                                }
                                break;
                            }else if(distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                                segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                                kLen = bezierData.points[j].point.length;
                                for(k=0;k<kLen;k+=1){
                                    this.v[k] = this.mult ? (bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc)*this.mult : bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;
                                    this.pv[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;

                                    if(this.lastPValue[k] !== this.pv[k]) {
                                        this.mdf = true;
                                        this.lastPValue[k] = this.pv[k];
                                    }
                                }
                                break;
                            }
                            if(j < jLen - 1 && dir == 1 || j > 0 && dir == -1){
                                j += dir;
                            }else{
                                flag = false;
                            }
                        }
                    }
                }else{
                    var outX,outY,inX,inY, isArray = false, keyValue;
                    len = keyData.s.length;
                    for(i=0;i<len;i+=1){
                        if(keyData.h !== 1){
                            if(keyData.o.x instanceof Array){
                                isArray = true;
                                if(!keyData.__fnct){
                                    keyData.__fnct = [];
                                }
                                if(!keyData.__fnct[i]){
                                    outX = keyData.o.x[i] || keyData.o.x[0];
                                    outY = keyData.o.y[i] || keyData.o.y[0];
                                    inX = keyData.i.x[i] || keyData.i.x[0];
                                    inY = keyData.i.y[i] || keyData.i.y[0];
                                }
                            }else{
                                isArray = false;
                                if(!keyData.__fnct) {
                                    outX = keyData.o.x;
                                    outY = keyData.o.y;
                                    inX = keyData.i.x;
                                    inY = keyData.i.y;
                                }
                            }
                            if(isArray){
                                if(keyData.__fnct[i]){
                                    fnc = keyData.__fnct[i];
                                }else{
                                    //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                    fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                    keyData.__fnct[i] = fnc;
                                }
                            }else{
                                if(keyData.__fnct){
                                    fnc = keyData.__fnct;
                                }else{
                                    //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                    fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                    keyData.__fnct = fnc;
                                }
                            }
                            if(frameNum >= nextKeyData.t-this.offsetTime){
                                perc = 1;
                            }else if(frameNum < keyData.t-this.offsetTime){
                                perc = 0;
                            }else{
                                perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                            }
                        }
                        if(this.sh && keyData.h !== 1){
                            var initP = keyData.s[i];
                            var endP = keyData.e[i];
                            if(initP-endP < -180){
                                initP += 360;
                            } else if(initP-endP > 180){
                                initP -= 360;
                            }
                            keyValue = initP+(endP-initP)*perc;
                        } else {
                            keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                        }
                        if(len === 1){
                            this.v = this.mult ? keyValue*this.mult : keyValue;
                            this.pv = keyValue;
                            if(this.lastPValue != this.pv){
                                this.mdf = true;
                                this.lastPValue = this.pv;
                            }
                        }else{
                            this.v[i] = this.mult ? keyValue*this.mult : keyValue;
                            this.pv[i] = keyValue;
                            if(this.lastPValue[i] !== this.pv[i]){
                                this.mdf = true;
                                this.lastPValue[i] = this.pv[i];
                            }
                        }
                    }
                }
            }
            this.lastFrame = frameNum;
            this.frameId = this.elem.globalData.frameId;
        }

        function getNoValue(){}

        function ValueProperty(elem,data, mult){
            this.mult = mult;
            this.v = mult ? data.k * mult : data.k;
            this.pv = data.k;
            this.mdf = false;
            this.comp = elem.comp;
            this.k = false;
            this.kf = false;
            this.vel = 0;
            this.getValue = getNoValue;
        }

        function MultiDimensionalProperty(elem,data, mult){
            this.mult = mult;
            this.data = data;
            this.mdf = false;
            this.comp = elem.comp;
            this.k = false;
            this.kf = false;
            this.frameId = -1;
            this.v = new Array(data.k.length);
            this.pv = new Array(data.k.length);
            this.lastValue = new Array(data.k.length);
            var arr = Array.apply(null, {length:data.k.length});
            this.vel = arr.map(function () { return 0 });
            var i, len = data.k.length;
            for(i = 0;i<len;i+=1){
                this.v[i] = mult ? data.k[i] * mult : data.k[i];
                this.pv[i] = data.k[i];
            }
            this.getValue = getNoValue;
        }

        function KeyframedValueProperty(elem, data, mult){
            this.keyframes = data.k;
            this.offsetTime = elem.data.st;
            this.lastValue = -99999;
            this.lastPValue = -99999;
            this.frameId = -1;
            this.k = true;
            this.kf = true;
            this.data = data;
            this.mult = mult;
            this.elem = elem;
            this.comp = elem.comp;
            this.lastFrame = initFrame;
            this.v = mult ? data.k[0].s[0]*mult : data.k[0].s[0];
            this.pv = data.k[0].s[0];
            this.getValue = getValue;
        }

        function KeyframedMultidimensionalProperty(elem, data, mult){
            var i, len = data.k.length;
            var s, e,to,ti;
            for(i=0;i<len-1;i+=1){
                if(data.k[i].to && data.k[i].s && data.k[i].e ){
                    s = data.k[i].s;
                    e = data.k[i].e;
                    to = data.k[i].to;
                    ti = data.k[i].ti;
                    if((s.length === 2 && !(s[0] === e[0] && s[1] === e[1]) && bez.pointOnLine2D(s[0],s[1],e[0],e[1],s[0] + to[0],s[1] + to[1]) && bez.pointOnLine2D(s[0],s[1],e[0],e[1],e[0] + ti[0],e[1] + ti[1])) || (s.length === 3 && !(s[0] === e[0] && s[1] === e[1] && s[2] === e[2]) && bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],s[0] + to[0],s[1] + to[1],s[2] + to[2]) && bez.pointOnLine3D(s[0],s[1],s[2],e[0],e[1],e[2],e[0] + ti[0],e[1] + ti[1],e[2] + ti[2]))){
                        data.k[i].to = null;
                        data.k[i].ti = null;
                    }
                }
            }
            this.keyframes = data.k;
            this.offsetTime = elem.data.st;
            this.k = true;
            this.kf = true;
            this.mult = mult;
            this.elem = elem;
            this.comp = elem.comp;
            this.getValue = getValue;
            this.frameId = -1;
            this.v = new Array(data.k[0].s.length);
            this.pv = new Array(data.k[0].s.length);
            this.lastValue = new Array(data.k[0].s.length);
            this.lastPValue = new Array(data.k[0].s.length);
            this.lastFrame = initFrame;
        }

        var TransformProperty = (function(){
            function positionGetter(){
                if(this.p.k){
                    this.p.getValue();
                }
                if(!this.p.v.key){
                    this.p.v.key = function(pos){
                        if(!this.p.v.numKeys){
                            return 0;
                        } else {
                            return this.p.keyframes[pos-1].t;
                        }
                    }.bind(this);
                }
                if(!this.p.v.numKeys){
                    this.p.v.numKeys = this.p.keyframes ? this.p.keyframes.length : 0;
                }
                if(!this.p.v.valueAtTime){
                    this.p.v.valueAtTime = this.p.getValueAtTime.bind(this.p);
                }
                return this.p.v;
            }
            function xPositionGetter(){
                if(this.px.k){
                    this.px.getValue();
                }
                return this.px.v;
            }
            function yPositionGetter(){
                if(this.py.k){
                    this.py.getValue();
                }
                return this.py.v;
            }
            function zPositionGetter(){
                if(this.pz.k){
                    this.pz.getValue();
                }
                return this.pz.v;
            }
            function anchorGetter(){
                if(this.a.k){
                    this.a.getValue();
                }
                return this.a.v;
            }
            function orientationGetter(){
                if(this.or.k){
                    this.or.getValue();
                }
                return this.or.v;
            }
            function rotationGetter(){
                if(this.r.k){
                    this.r.getValue();
                }
                return this.r.v/degToRads;
            }
            function scaleGetter(){
                if(this.s.k){
                    this.s.getValue();
                }
                return this.s.v;
            }
            function opacityGetter(){
                if(this.o.k){
                    this.o.getValue();
                }
                return this.o.v;
            }
            function skewGetter(){
                if(this.sk.k){
                    this.sk.getValue();
                }
                return this.sk.v;
            }
            function skewAxisGetter(){
                if(this.sa.k){
                    this.sa.getValue();
                }
                return this.sa.v;
            }
            function applyToMatrix(mat){
                var i, len = this.dynamicProperties.length;
                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.a){
                    mat.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                }
                if(this.s){
                    mat.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                }
                if(this.r){
                    mat.rotate(-this.r.v);
                }else{
                    mat.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                }
                if(this.data.p.s){
                    if(this.data.p.z) {
                        mat.translate(this.px.v, this.py.v, -this.pz.v);
                    } else {
                        mat.translate(this.px.v, this.py.v, 0);
                    }
                }else{
                    mat.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                }
            }
            function processKeys(){
                if(this.elem.globalData.frameId === this.frameId){
                    return;
                }

                this.mdf = false;
                var i, len = this.dynamicProperties.length;

                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.mdf){
                    this.v.reset();
                    if(this.a){
                        this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                    }
                    if(this.s){
                        this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                    }
                    if(this.sk){
                        this.v.skewFromAxis(-this.sk.v,this.sa.v);
                    }
                    if(this.r){
                        this.v.rotate(-this.r.v);
                    }else{
                        this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                    }
                    if(this.autoOriented && this.p.keyframes && this.p.getValueAtTime){
                        var v1,v2;
                        if(this.p.lastFrame+this.p.offsetTime < this.p.keyframes[0].t){
                            v1 = this.p.getValueAtTime(this.p.keyframes[0].t+0.01,0);
                            v2 = this.p.getValueAtTime(this.p.keyframes[0].t, 0);
                        }else if(this.p.lastFrame+this.p.offsetTime > this.p.keyframes[this.p.keyframes.length - 1].t){
                            v1 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t,0);
                            v2 = this.p.getValueAtTime(this.p.keyframes[this.p.keyframes.length - 1].t-0.01, 0);
                        } else {
                            v1 = this.p.pv;
                            v2 = this.p.getValueAtTime(this.p.lastFrame+this.p.offsetTime - 0.01, this.p.offsetTime);
                        }
                        //var prevV = this.p.getValueAtTime(this.p.lastFrame - 0.01, true);
                        this.v.rotate(-Math.atan2(v1[1] - v2[1], v1[0] - v2[0]));
                    }
                    if(this.data.p.s){
                        if(this.data.p.z) {
                            this.v.translate(this.px.v, this.py.v, -this.pz.v);
                        } else {
                            this.v.translate(this.px.v, this.py.v, 0);
                        }
                    }else{
                        this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                    }
                }
                this.frameId = this.elem.globalData.frameId;
            }

            function setInverted(){
                this.inverted = true;
                this.iv = new Matrix();
                if(!this.k){
                    if(this.data.p.s){
                        this.iv.translate(this.px.v,this.py.v,-this.pz.v);
                    }else{
                        this.iv.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                    }
                    if(this.r){
                        this.iv.rotate(-this.r.v);
                    }else{
                        this.iv.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
                    }
                    if(this.s){
                        this.iv.scale(this.s.v[0],this.s.v[1],1);
                    }
                    if(this.a){
                        this.iv.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                    }
                }
            }

            function autoOrient(){
                //
                //var prevP = this.getValueAtTime();
            }

            return function TransformProperty(elem,data,arr){
                this.elem = elem;
                this.frameId = -1;
                this.dynamicProperties = [];
                this.mdf = false;
                this.data = data;
                this.getValue = processKeys;
                this.applyToMatrix = applyToMatrix;
                this.setInverted = setInverted;
                this.autoOrient = autoOrient;
                this.v = new Matrix();
                if(data.p.s){
                    this.px = PropertyFactory.getProp(elem,data.p.x,0,0,this.dynamicProperties);
                    this.py = PropertyFactory.getProp(elem,data.p.y,0,0,this.dynamicProperties);
                    if(data.p.z){
                        this.pz = PropertyFactory.getProp(elem,data.p.z,0,0,this.dynamicProperties);
                    }
                }else{
                    this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
                }
                if(data.r) {
                    this.r = PropertyFactory.getProp(elem, data.r, 0, degToRads, this.dynamicProperties);
                } else if(data.rx) {
                    this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this.dynamicProperties);
                    this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this.dynamicProperties);
                    this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this.dynamicProperties);
                    this.or = PropertyFactory.getProp(elem, data.or, 0, degToRads, this.dynamicProperties);
                }
                if(data.sk){
                    this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this.dynamicProperties);
                    this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this.dynamicProperties);
                }
                if(data.a) {
                    this.a = PropertyFactory.getProp(elem,data.a,1,0,this.dynamicProperties);
                }
                if(data.s) {
                    this.s = PropertyFactory.getProp(elem,data.s,1,0.01,this.dynamicProperties);
                }
                if(data.o){
                    this.o = PropertyFactory.getProp(elem,data.o,0,0.01,arr);
                } else {
                    this.o = {mdf:false,v:1};
                }
                if(this.dynamicProperties.length){
                    arr.push(this);
                }else{
                    if(this.a){
                        this.v.translate(-this.a.v[0],-this.a.v[1],this.a.v[2]);
                    }
                    if(this.s){
                        this.v.scale(this.s.v[0],this.s.v[1],this.s.v[2]);
                    }
                    if(this.sk){
                        this.v.skewFromAxis(-this.sk.v,this.sa.v);
                    }
                    if(this.r){
                        this.v.rotate(-this.r.v);
                    }else{
                        this.v.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]);
                    }
                    if(this.data.p.s){
                        if(data.p.z) {
                            this.v.translate(this.px.v, this.py.v, -this.pz.v);
                        } else {
                            this.v.translate(this.px.v, this.py.v, 0);
                        }
                    }else{
                        this.v.translate(this.p.v[0],this.p.v[1],-this.p.v[2]);
                    }
                }
                Object.defineProperty(this, "position", { get: positionGetter});
                Object.defineProperty(this, "xPosition", { get: xPositionGetter});
                Object.defineProperty(this, "yPosition", { get: yPositionGetter});
                Object.defineProperty(this, "orientation", { get: orientationGetter});
                Object.defineProperty(this, "anchorPoint", { get: anchorGetter});
                Object.defineProperty(this, "rotation", { get: rotationGetter});
                Object.defineProperty(this, "scale", { get: scaleGetter});
                Object.defineProperty(this, "opacity", { get: opacityGetter});
                Object.defineProperty(this, "skew", { get: skewGetter});
                Object.defineProperty(this, "skewAxis", { get: skewAxisGetter});
            }
        }());

        function getProp(elem,data,type, mult, arr) {
            var p;
            if(type === 2){
                p = new TransformProperty(elem, data, arr);
            } else if(data.a === 0){
                if(type === 0) {
                    p = new ValueProperty(elem,data,mult);
                } else {
                    p = new MultiDimensionalProperty(elem,data, mult);
                }
            } else if(data.a === 1){
                if(type === 0) {
                    p = new KeyframedValueProperty(elem,data,mult);
                } else {
                    p = new KeyframedMultidimensionalProperty(elem,data, mult);
                }
            } else if(!data.k.length){
                p = new ValueProperty(elem,data, mult);
            }else if(typeof(data.k[0]) === 'number'){
                p = new MultiDimensionalProperty(elem,data, mult);
            }else{
                switch(type){
                    case 0:
                        p = new KeyframedValueProperty(elem,data,mult);
                        break;
                    case 1:
                        p = new KeyframedMultidimensionalProperty(elem,data,mult);
                        break;
                }
            }
            if(p.k){
                arr.push(p);
            }
            return p;
        }

        var getGradientProp = (function(){

            function getValue(forceRender){
                this.prop.getValue();
                this.cmdf = false;
                this.omdf = false;
                if(this.prop.mdf || forceRender){
                    var i, len = this.data.p*4;
                    var mult, val;
                    for(i=0;i<len;i+=1){
                        mult = i%4 === 0 ? 100 : 255;
                        val = Math.round(this.prop.v[i]*mult);
                        if(this.c[i] !== val){
                            this.c[i] = val;
                            this.cmdf = true;
                        }
                    }
                    if(this.o.length){
                        len = this.prop.v.length;
                        for(i=this.data.p*4;i<len;i+=1){
                            mult = i%2 === 0 ? 100 : 1;
                            val = i%2 === 0 ?  Math.round(this.prop.v[i]*100):this.prop.v[i];
                            if(this.o[i-this.data.p*4] !== val){
                                this.o[i-this.data.p*4] = val;
                                this.omdf = true;
                            }
                        }
                    }
                }

            }

            function gradientProp(elem,data,arr){
                this.prop = getProp(elem,data.k,1,null,[]);
                this.data = data;
                this.k = this.prop.k;
                this.c = Array.apply(null,{length:data.p*4});
                var cLength = data.k.k[0].s ? (data.k.k[0].s.length - data.p*4) : data.k.k.length - data.p*4;
                this.o = Array.apply(null,{length:cLength});
                this.cmdf = false;
                this.omdf = false;
                this.getValue = getValue;
                if(this.prop.k){
                    arr.push(this);
                }
                this.getValue(true);
            }

            return function getGradientProp(elem,data,arr){
                return new gradientProp(elem,data,arr);
            }
        }());




        var DashProperty = (function(){

            function processKeys(forceRender){
                var i = 0, len = this.dataProps.length;

                if(this.elem.globalData.frameId === this.frameId && !forceRender){
                    return;
                }
                this.mdf = false;
                this.frameId = this.elem.globalData.frameId;
                while(i<len){
                    if(this.dataProps[i].p.mdf){
                        this.mdf = true;
                        break;
                    }
                    i+=1;
                }
                if(this.mdf || forceRender){
                    if(this.renderer === 'svg') {
                        this.dasharray = '';
                    }
                    for(i=0;i<len;i+=1){
                        if(this.dataProps[i].n != 'o'){
                            if(this.renderer === 'svg') {
                                this.dasharray += ' ' + this.dataProps[i].p.v;
                            }else{
                                this.dasharray[i] = this.dataProps[i].p.v;
                            }
                        }else{
                            this.dashoffset = this.dataProps[i].p.v;
                        }
                    }
                }
            }

            return function(elem, data,renderer, dynamicProperties){
                this.elem = elem;
                this.frameId = -1;
                this.dataProps = new Array(data.length);
                this.renderer = renderer;
                this.mdf = false;
                this.k = false;
                if(this.renderer === 'svg'){
                    this.dasharray = '';
                }else{

                    this.dasharray = new Array(data.length - 1);
                }
                this.dashoffset = 0;
                var i, len = data.length, prop;
                for(i=0;i<len;i+=1){
                    prop = PropertyFactory.getProp(elem,data[i].v,0, 0, dynamicProperties);
                    this.k = prop.k ? true : this.k;
                    this.dataProps[i] = {n:data[i].n,p:prop};
                }
                this.getValue = processKeys;
                if(this.k){
                    dynamicProperties.push(this);
                }else{
                    this.getValue(true);
                }

            }
        }());

        function getDashProp(elem, data,renderer, dynamicProperties) {
            return new DashProperty(elem, data,renderer, dynamicProperties);
        };

        var TextSelectorProp = (function(){
            var max = Math.max;
            var min = Math.min;
            var floor = Math.floor;
            function updateRange(){
                if(this.dynamicProperties.length){
                    var i, len = this.dynamicProperties.length;
                    for(i=0;i<len;i+=1){
                        this.dynamicProperties[i].getValue();
                        if(this.dynamicProperties[i].mdf){
                            this.mdf = true;
                        }
                    }
                }
                var totalChars = this.data.totalChars;
                var divisor = this.data.r === 2 ? 1 : 100/totalChars;
                var o = this.o.v/divisor;
                var s = this.s.v/divisor + o;
                var e = (this.e.v/divisor) + o;
                if(s>e){
                    var _s = s;
                    s = e;
                    e = _s;
                }
                this.finalS = s;
                this.finalE = e;
            }

            function getMult(ind){
                //var easer = bez.getEasingCurve(this.ne.v/100,0,1-this.xe.v/100,1);
                var easer = BezierFactory.getBezierEasing(this.ne.v/100,0,1-this.xe.v/100,1).get;
                var mult = 0;
                var s = this.finalS;
                var e = this.finalE;
                var type = this.data.sh;
                if(type == 2){
                    if(e === s){
                        mult = ind >= e ? 1 : 0;
                    }else{
                        mult = max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                    }
                    mult = easer(mult);
                }else if(type == 3){
                    if(e === s){
                        mult = ind >= e ? 0 : 1;
                    }else{
                        mult = 1 - max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                    }

                    mult = easer(mult);
                }else if(type == 4){
                    if(e === s){
                        mult = 0;
                    }else{
                        mult = max(0,min(0.5/(e-s) + (ind-s)/(e-s),1));
                        if(mult<.5){
                            mult *= 2;
                        }else{
                            mult = 1 - 2*(mult-0.5);
                        }
                    }
                    mult = easer(mult);
                }else if(type == 5){
                    if(e === s){
                        mult = 0;
                    }else{
                        var tot = e - s;
                        /*ind += 0.5;
                         mult = -4/(tot*tot)*(ind*ind)+(4/tot)*ind;*/
                        ind = min(max(0,ind+0.5-s),e-s);
                        var x = -tot/2+ind;
                        var a = tot/2;
                        mult = Math.sqrt(1 - (x*x)/(a*a));
                    }
                    mult = easer(mult);
                }else if(type == 6){
                    if(e === s){
                        mult = 0;
                    }else{
                        ind = min(max(0,ind+0.5-s),e-s);
                        mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind)/(e-s)))))/2;
                        /*
                         ind = Math.min(Math.max(s,ind),e-1);
                         mult = (1+(Math.cos((Math.PI+Math.PI*2*(ind-s)/(e-1-s)))))/2;
                         mult = Math.max(mult,(1/(e-1-s))/(e-1-s));*/
                    }
                    mult = easer(mult);
                }else {
                    if(ind >= floor(s)){
                        if(ind-s < 0){
                            mult = 1 - (s - ind);
                        }else{
                            mult = max(0,min(e-ind,1));
                        }
                    }
                    mult = easer(mult);
                }
                return mult*this.a.v;
            }

            return function TextSelectorProp(elem,data, arr){
                this.mdf = false;
                this.k = false;
                this.data = data;
                this.dynamicProperties = [];
                this.getValue = updateRange;
                this.getMult = getMult;
                this.comp = elem.comp;
                this.finalS = 0;
                this.finalE = 0;
                this.s = PropertyFactory.getProp(elem,data.s || {k:0},0,0,this.dynamicProperties);
                if('e' in data){
                    this.e = PropertyFactory.getProp(elem,data.e,0,0,this.dynamicProperties);
                }else{
                    this.e = {v:data.r === 2 ? data.totalChars : 100};
                }
                this.o = PropertyFactory.getProp(elem,data.o || {k:0},0,0,this.dynamicProperties);
                this.xe = PropertyFactory.getProp(elem,data.xe || {k:0},0,0,this.dynamicProperties);
                this.ne = PropertyFactory.getProp(elem,data.ne || {k:0},0,0,this.dynamicProperties);
                this.a = PropertyFactory.getProp(elem,data.a,0,0.01,this.dynamicProperties);
                if(this.dynamicProperties.length){
                    arr.push(this);
                }else{
                    this.getValue();
                }
            }
        }());

        function getTextSelectorProp(elem, data,arr) {
            return new TextSelectorProp(elem, data, arr);
        };

        var ob = {};
        ob.getProp = getProp;
        ob.getDashProp = getDashProp;
        ob.getTextSelectorProp = getTextSelectorProp;
        ob.getGradientProp = getGradientProp;
        return ob;
    }());
    var ShapePropertyFactory = (function(){

        var initFrame = -999999;

        function interpolateShape() {
            if(this.elem.globalData.frameId === this.frameId){
                return;
            }
            this.mdf = false;
            var frameNum = this.comp.renderedFrame - this.offsetTime;
            if(this.lastFrame !== initFrame && ((this.lastFrame < this.keyframes[0].t-this.offsetTime && frameNum < this.keyframes[0].t-this.offsetTime) || (this.lastFrame > this.keyframes[this.keyframes.length - 1].t-this.offsetTime && frameNum > this.keyframes[this.keyframes.length - 1].t-this.offsetTime))){
            }else{
                var keyPropS,keyPropE,isHold;
                if(frameNum < this.keyframes[0].t-this.offsetTime){
                    keyPropS = this.keyframes[0].s[0];
                    isHold = true;
                }else if(frameNum >= this.keyframes[this.keyframes.length - 1].t-this.offsetTime){
                    if(this.keyframes[this.keyframes.length - 2].h === 1){
                        //keyPropS = this.keyframes[this.keyframes.length - 1].s ? this.keyframes[this.keyframes.length - 1].s[0] : this.keyframes[this.keyframes.length - 2].s[0];
                        keyPropS = this.keyframes[this.keyframes.length - 1].s[0];
                    }else{
                        keyPropS = this.keyframes[this.keyframes.length - 2].e[0];
                    }
                    isHold = true;
                }else{
                    var i = 0,len = this.keyframes.length- 1,flag = true,keyData,nextKeyData, j, jLen, k, kLen;
                    while(flag){
                        keyData = this.keyframes[i];
                        nextKeyData = this.keyframes[i+1];
                        if((nextKeyData.t - this.offsetTime) > frameNum){
                            break;
                        }
                        if(i < len - 1){
                            i += 1;
                        }else{
                            flag = false;
                        }
                    }
                    isHold = keyData.h === 1;
                    if(isHold && i === len){
                        keyData = nextKeyData;
                    }

                    var perc;
                    if(!isHold){
                        var fnc;
                        if(keyData.__fnct){
                            fnc = keyData.__fnct;
                        }else{
                            //fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y);
                            fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y).get;
                            keyData.__fnct = fnc;
                        }
                        if(frameNum >= nextKeyData.t-this.offsetTime){
                            perc = 1;
                        }else if(frameNum < keyData.t-this.offsetTime){
                            perc = 0;
                        }else{
                            perc = fnc((frameNum-(keyData.t-this.offsetTime))/((nextKeyData.t-this.offsetTime)-(keyData.t-this.offsetTime)));
                        }
                        keyPropE = keyData.e[0];
                    }
                    keyPropS = keyData.s[0];
                }
                jLen = this.v.i.length;
                kLen = keyPropS.i[0].length;
                var hasModified = false;
                var vertexValue;
                for(j=0;j<jLen;j+=1){
                    for(k=0;k<kLen;k+=1){
                        if(isHold){
                            vertexValue = keyPropS.i[j][k];
                            if(this.v.i[j][k] !== vertexValue){
                                this.v.i[j][k] = vertexValue;
                                this.pv.i[j][k] = vertexValue;
                                hasModified = true;
                            }
                            vertexValue = keyPropS.o[j][k];
                            if(this.v.o[j][k] !== vertexValue){
                                this.v.o[j][k] = vertexValue;
                                this.pv.o[j][k] = vertexValue;
                                hasModified = true;
                            }
                            vertexValue = keyPropS.v[j][k];
                            if(this.v.v[j][k] !== vertexValue){
                                this.v.v[j][k] = vertexValue;
                                this.pv.v[j][k] = vertexValue;
                                hasModified = true;
                            }
                        }else{
                            vertexValue = keyPropS.i[j][k]+(keyPropE.i[j][k]-keyPropS.i[j][k])*perc;
                            if(this.v.i[j][k] !== vertexValue){
                                this.v.i[j][k] = vertexValue;
                                this.pv.i[j][k] = vertexValue;
                                hasModified = true;
                            }
                            vertexValue = keyPropS.o[j][k]+(keyPropE.o[j][k]-keyPropS.o[j][k])*perc;
                            if(this.v.o[j][k] !== vertexValue){
                                this.v.o[j][k] = vertexValue;
                                this.pv.o[j][k] = vertexValue;
                                hasModified = true;
                            }
                            vertexValue = keyPropS.v[j][k]+(keyPropE.v[j][k]-keyPropS.v[j][k])*perc;
                            if(this.v.v[j][k] !== vertexValue){
                                this.v.v[j][k] = vertexValue;
                                this.pv.v[j][k] = vertexValue;
                                hasModified = true;
                            }
                        }
                    }
                }
                this.mdf = hasModified;
                this.paths.length = 0;
                this.v.c = keyPropS.c;
                this.paths[0] = this.v;
            }

            this.lastFrame = frameNum;
            this.frameId = this.elem.globalData.frameId;
        }

        function getShapeValue(){
            return this.v;
        }

        function resetShape(){
            this.resetPaths.length = 1;
            this.resetPaths[0] = this.v;
            this.paths = this.resetPaths;
            if(!this.k){
                this.mdf = false;
            }
        }

        function ShapeProperty(elem, data, type){
            this.resetPaths = [];
            this.comp = elem.comp;
            this.k = false;
            this.mdf = false;
            this.numNodes = type === 3 ? data.pt.k.v.length : data.ks.k.v.length;
            this.v = type === 3 ? data.pt.k : data.ks.k;
            this.getValue = getShapeValue;
            this.pv = this.v;
            this.paths = [this.v];
            this.reset = resetShape;
        }

        function KeyframedShapeProperty(elem,data,type){
            this.resetPaths = [];
            this.comp = elem.comp;
            this.elem = elem;
            this.offsetTime = elem.data.st;
            this.getValue = interpolateShape;
            this.keyframes = type === 3 ? data.pt.k : data.ks.k;
            this.k = true;
            var i, len = this.keyframes[0].s[0].i.length;
            var jLen = this.keyframes[0].s[0].i[0].length;
            this.numNodes = len;
            this.v = {
                i: Array.apply(null,{length:len}),
                o: Array.apply(null,{length:len}),
                v: Array.apply(null,{length:len}),
                c: this.keyframes[0].s[0].c
            };
            this.pv = {
                i: Array.apply(null,{length:len}),
                o: Array.apply(null,{length:len}),
                v: Array.apply(null,{length:len}),
                c: this.keyframes[0].s[0].c
            };
            for(i=0;i<len;i+=1){
                this.v.i[i] = Array.apply(null,{length:jLen});
                this.v.o[i] = Array.apply(null,{length:jLen});
                this.v.v[i] = Array.apply(null,{length:jLen});
                this.pv.i[i] = Array.apply(null,{length:jLen});
                this.pv.o[i] = Array.apply(null,{length:jLen});
                this.pv.v[i] = Array.apply(null,{length:jLen});
            }
            this.paths = [];
            this.lastFrame = initFrame;
            this.reset = resetShape;
        }

        var EllShapeProperty = (function(){

            var cPoint = roundCorner;

            function convertEllToPath(){
                var p0 = this.p.v[0], p1 = this.p.v[1], s0 = this.s.v[0]/2, s1 = this.s.v[1]/2;
                if(this.d !== 2 && this.d !== 3){
                    this.v.v[0] = [p0,p1-s1];
                    this.v.i[0] = [p0 - s0*cPoint,p1 - s1];
                    this.v.o[0] = [p0 + s0*cPoint,p1 - s1];
                    this.v.v[1] = [p0 + s0,p1];
                    this.v.i[1] = [p0 + s0,p1 - s1*cPoint];
                    this.v.o[1] = [p0 + s0,p1 + s1*cPoint];
                    this.v.v[2] = [p0,p1+s1];
                    this.v.i[2] = [p0 + s0*cPoint,p1 + s1];
                    this.v.o[2] = [p0 - s0*cPoint,p1 + s1];
                    this.v.v[3] = [p0 - s0,p1];
                    this.v.i[3] = [p0 - s0,p1 + s1*cPoint];
                    this.v.o[3] = [p0 - s0,p1 - s1*cPoint];
                }else{
                    this.v.v[0] = [p0,p1-s1];
                    this.v.o[0] = [p0 - s0*cPoint,p1 - s1];
                    this.v.i[0] = [p0 + s0*cPoint,p1 - s1];
                    this.v.v[1] = [p0 - s0,p1];
                    this.v.o[1] = [p0 - s0,p1 + s1*cPoint];
                    this.v.i[1] = [p0 - s0,p1 - s1*cPoint];
                    this.v.v[2] = [p0,p1+s1];
                    this.v.o[2] = [p0 + s0*cPoint,p1 + s1];
                    this.v.i[2] = [p0 - s0*cPoint,p1 + s1];
                    this.v.v[3] = [p0 + s0,p1];
                    this.v.o[3] = [p0 + s0,p1 - s1*cPoint];
                    this.v.i[3] = [p0 + s0,p1 + s1*cPoint];
                }
                this.paths.length = 0;
                this.paths[0] = this.v;
            }

            function processKeys(frameNum){
                var i, len = this.dynamicProperties.length;
                if(this.elem.globalData.frameId === this.frameId){
                    return;
                }
                this.mdf = false;
                this.frameId = this.elem.globalData.frameId;

                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue(frameNum);
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.mdf){
                    this.convertEllToPath();
                    this.paths.length = 0;
                    this.paths[0] = this.v;
                }
            }

            return function EllShapeProperty(elem,data) {
                this.v = {
                    v: Array.apply(null,{length:4}),
                    i: Array.apply(null,{length:4}),
                    o: Array.apply(null,{length:4}),
                    c: true
                };
                this.numNodes = 4;
                this.d = data.d;
                this.dynamicProperties = [];
                this.resetPaths = [];
                this.paths = [];
                this.elem = elem;
                this.comp = elem.comp;
                this.frameId = -1;
                this.mdf = false;
                this.getValue = processKeys;
                this.convertEllToPath = convertEllToPath;
                this.reset = resetShape;
                this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
                this.s = PropertyFactory.getProp(elem,data.s,1,0,this.dynamicProperties);
                if(this.dynamicProperties.length){
                    this.k = true;
                }else{
                    this.convertEllToPath();
                }
            }
        }());

        var StarShapeProperty = (function() {

            function convertPolygonToPath(){
                var numPts = Math.floor(this.pt.v);
                var angle = Math.PI*2/numPts;
                this.v.v.length = numPts;
                this.v.i.length = numPts;
                this.v.o.length = numPts;
                var rad = this.or.v;
                var roundness = this.os.v;
                var perimSegment = 2*Math.PI*rad/(numPts*4);
                var i, currentAng = -Math.PI/ 2;
                var dir = this.data.d === 3 ? -1 : 1;
                currentAng += this.r.v;
                for(i=0;i<numPts;i+=1){
                    var x = rad * Math.cos(currentAng);
                    var y = rad * Math.sin(currentAng);
                    var ox = x === 0 && y === 0 ? 0 : y/Math.sqrt(x*x + y*y);
                    var oy = x === 0 && y === 0 ? 0 : -x/Math.sqrt(x*x + y*y);
                    x +=  + this.p.v[0];
                    y +=  + this.p.v[1];
                    this.v.v[i] = [x,y];
                    this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                    this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                    currentAng += angle*dir;
                }
                this.numNodes = numPts;
                this.paths.length = 0;
                this.paths[0] = this.v;
            }

            function convertStarToPath() {
                var numPts = Math.floor(this.pt.v)*2;
                var angle = Math.PI*2/numPts;
                this.v.v.length = numPts;
                this.v.i.length = numPts;
                this.v.o.length = numPts;
                var longFlag = true;
                var longRad = this.or.v;
                var shortRad = this.ir.v;
                var longRound = this.os.v;
                var shortRound = this.is.v;
                var longPerimSegment = 2*Math.PI*longRad/(numPts*2);
                var shortPerimSegment = 2*Math.PI*shortRad/(numPts*2);
                var i, rad,roundness,perimSegment, currentAng = -Math.PI/ 2;
                currentAng += this.r.v;
                var dir = this.data.d === 3 ? -1 : 1;
                for(i=0;i<numPts;i+=1){
                    rad = longFlag ? longRad : shortRad;
                    roundness = longFlag ? longRound : shortRound;
                    perimSegment = longFlag ? longPerimSegment : shortPerimSegment;
                    var x = rad * Math.cos(currentAng);
                    var y = rad * Math.sin(currentAng);
                    var ox = x === 0 && y === 0 ? 0 : y/Math.sqrt(x*x + y*y);
                    var oy = x === 0 && y === 0 ? 0 : -x/Math.sqrt(x*x + y*y);
                    x +=  + this.p.v[0];
                    y +=  + this.p.v[1];
                    this.v.v[i] = [x,y];
                    this.v.i[i] = [x+ox*perimSegment*roundness*dir,y+oy*perimSegment*roundness*dir];
                    this.v.o[i] = [x-ox*perimSegment*roundness*dir,y-oy*perimSegment*roundness*dir];
                    longFlag = !longFlag;
                    currentAng += angle*dir;
                }
                this.numNodes = numPts;
                this.paths.length = 0;
                this.paths[0] = this.v;
            }

            function processKeys() {
                if(this.elem.globalData.frameId === this.frameId){
                    return;
                }
                this.mdf = false;
                this.frameId = this.elem.globalData.frameId;
                var i, len = this.dynamicProperties.length;

                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue();
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.mdf){
                    this.convertToPath();
                }
            }

            return function StarShapeProperty(elem,data) {
                this.v = {
                    v: [],
                    i: [],
                    o: [],
                    c: true
                };
                this.resetPaths = [];
                this.elem = elem;
                this.comp = elem.comp;
                this.data = data;
                this.frameId = -1;
                this.d = data.d;
                this.dynamicProperties = [];
                this.mdf = false;
                this.getValue = processKeys;
                this.reset = resetShape;
                if(data.sy === 1){
                    this.ir = PropertyFactory.getProp(elem,data.ir,0,0,this.dynamicProperties);
                    this.is = PropertyFactory.getProp(elem,data.is,0,0.01,this.dynamicProperties);
                    this.convertToPath = convertStarToPath;
                } else {
                    this.convertToPath = convertPolygonToPath;
                }
                this.pt = PropertyFactory.getProp(elem,data.pt,0,0,this.dynamicProperties);
                this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
                this.r = PropertyFactory.getProp(elem,data.r,0,degToRads,this.dynamicProperties);
                this.or = PropertyFactory.getProp(elem,data.or,0,0,this.dynamicProperties);
                this.os = PropertyFactory.getProp(elem,data.os,0,0.01,this.dynamicProperties);
                this.paths = [];
                if(this.dynamicProperties.length){
                    this.k = true;
                }else{
                    this.convertToPath();
                }
            }
        }());

        var RectShapeProperty = (function() {
            function processKeys(frameNum){
                if(this.elem.globalData.frameId === this.frameId){
                    return;
                }
                this.mdf = false;
                this.frameId = this.elem.globalData.frameId;
                var i, len = this.dynamicProperties.length;

                for(i=0;i<len;i+=1){
                    this.dynamicProperties[i].getValue(frameNum);
                    if(this.dynamicProperties[i].mdf){
                        this.mdf = true;
                    }
                }
                if(this.mdf){
                    this.convertRectToPath();
                }

            }

            function convertRectToPath(){
                var p0 = this.p.v[0], p1 = this.p.v[1], v0 = this.s.v[0]/2, v1 = this.s.v[1]/2;
                var round = bm_min(v0,v1,this.r.v);
                var cPoint = round*(1-roundCorner);
                if(round === 0){
                    this.v.v.length = 4;
                    this.v.i.length = 4;
                    this.v.o.length = 4;
                } else {
                    this.v.v.length = 8;
                    this.v.i.length = 8;
                    this.v.o.length = 8;
                }

                if(this.d === 2 || this.d === 1) {

                    this.v.v[0] = [p0+v0,p1-v1+round];
                    this.v.o[0] = this.v.v[0];
                    this.v.i[0] = [p0+v0,p1-v1+cPoint];

                    this.v.v[1] = [p0+v0,p1+v1-round];
                    this.v.o[1] = [p0+v0,p1+v1-cPoint];
                    this.v.i[1] = this.v.v[1];

                    if(round!== 0){
                        this.v.v[2] = [p0+v0-round,p1+v1];
                        this.v.o[2] = this.v.v[2];
                        this.v.i[2] = [p0+v0-cPoint,p1+v1];
                        this.v.v[3] = [p0-v0+round,p1+v1];
                        this.v.o[3] = [p0-v0+cPoint,p1+v1];
                        this.v.i[3] = this.v.v[3];
                        this.v.v[4] = [p0-v0,p1+v1-round];
                        this.v.o[4] = this.v.v[4];
                        this.v.i[4] = [p0-v0,p1+v1-cPoint];
                        this.v.v[5] = [p0-v0,p1-v1+round];
                        this.v.o[5] = [p0-v0,p1-v1+cPoint];
                        this.v.i[5] = this.v.v[5];
                        this.v.v[6] = [p0-v0+round,p1-v1];
                        this.v.o[6] = this.v.v[6];
                        this.v.i[6] = [p0-v0+cPoint,p1-v1];
                        this.v.v[7] = [p0+v0-round,p1-v1];
                        this.v.o[7] = [p0+v0-cPoint,p1-v1];
                        this.v.i[7] = this.v.v[7];
                    } else {
                        this.v.v[2] = [p0-v0+round,p1+v1];
                        this.v.o[2] = [p0-v0+cPoint,p1+v1];
                        this.v.i[2] = this.v.v[2];
                        this.v.v[3] = [p0-v0,p1-v1+round];
                        this.v.o[3] = [p0-v0,p1-v1+cPoint];
                        this.v.i[3] = this.v.v[3];
                    }
                }else{
                    this.v.v[0] = [p0+v0,p1-v1+round];
                    this.v.o[0] = [p0+v0,p1-v1+cPoint];
                    this.v.i[0] = this.v.v[0];

                    if(round!== 0){
                        this.v.v[1] = [p0+v0-round,p1-v1];
                        this.v.o[1] = this.v.v[1];
                        this.v.i[1] = [p0+v0-cPoint,p1-v1];

                        this.v.v[2] = [p0-v0+round,p1-v1];
                        this.v.o[2] = [p0-v0+cPoint,p1-v1];
                        this.v.i[2] = this.v.v[2];

                        this.v.v[3] = [p0-v0,p1-v1+round];
                        this.v.o[3] = this.v.v[3];
                        this.v.i[3] = [p0-v0,p1-v1+cPoint];

                        this.v.v[4] = [p0-v0,p1+v1-round];
                        this.v.o[4] = [p0-v0,p1+v1-cPoint];
                        this.v.i[4] = this.v.v[4];

                        this.v.v[5] = [p0-v0+round,p1+v1];
                        this.v.o[5] = this.v.v[5];
                        this.v.i[5] = [p0-v0+cPoint,p1+v1];

                        this.v.v[6] = [p0+v0-round,p1+v1];
                        this.v.o[6] = [p0+v0-cPoint,p1+v1];
                        this.v.i[6] = this.v.v[6];

                        this.v.v[7] = [p0+v0,p1+v1-round];
                        this.v.o[7] = this.v.v[7];
                        this.v.i[7] = [p0+v0,p1+v1-cPoint];
                    } else {
                        this.v.v[1] = [p0-v0+round,p1-v1];
                        this.v.o[1] = [p0-v0+cPoint,p1-v1];
                        this.v.i[1] = this.v.v[1];
                        this.v.v[2] = [p0-v0,p1+v1-round];
                        this.v.o[2] = [p0-v0,p1+v1-cPoint];
                        this.v.i[2] = this.v.v[2];
                        this.v.v[3] = [p0+v0-round,p1+v1];
                        this.v.o[3] = [p0+v0-cPoint,p1+v1];
                        this.v.i[3] = this.v.v[3];

                    }
                }
                this.paths.length = 0;
                this.paths[0] = this.v;
            }

            return function RectShapeProperty(elem,data) {
                this.v = {
                    v: Array.apply(null,{length:8}),
                    i: Array.apply(null,{length:8}),
                    o: Array.apply(null,{length:8}),
                    c: true
                };
                this.resetPaths = [];
                this.paths = [];
                this.numNodes = 8;
                this.elem = elem;
                this.comp = elem.comp;
                this.frameId = -1;
                this.d = data.d;
                this.dynamicProperties = [];
                this.mdf = false;
                this.getValue = processKeys;
                this.convertRectToPath = convertRectToPath;
                this.reset = resetShape;
                this.p = PropertyFactory.getProp(elem,data.p,1,0,this.dynamicProperties);
                this.s = PropertyFactory.getProp(elem,data.s,1,0,this.dynamicProperties);
                this.r = PropertyFactory.getProp(elem,data.r,0,0,this.dynamicProperties);
                if(this.dynamicProperties.length){
                    this.k = true;
                }else{
                    this.convertRectToPath();
                }
            }
        }());

        function getShapeProp(elem,data,type, arr){
            var prop;
            if(type === 3 || type === 4){
                var dataProp = type === 3 ? data.pt : data.ks;
                var keys = dataProp.k;
                if(dataProp.a === 1 || keys.length){
                    prop = new KeyframedShapeProperty(elem, data, type);
                }else{
                    prop = new ShapeProperty(elem, data, type);
                }
            }else if(type === 5){
                prop = new RectShapeProperty(elem, data);
            }else if(type === 6){
                prop = new EllShapeProperty(elem, data);
            }else if(type === 7){
                prop = new StarShapeProperty(elem, data);
            }
            if(prop.k){
                arr.push(prop);
            }
            return prop;
        }

        var ob = {};
        ob.getShapeProp = getShapeProp;
        return ob;
    }());
    var ShapeModifiers = (function(){
        var ob = {};
        var modifiers = {};
        ob.registerModifier = registerModifier;
        ob.getModifier = getModifier;

        function registerModifier(nm,factory){
            if(!modifiers[nm]){
                modifiers[nm] = factory;
            }
        }

        function getModifier(nm,elem, data, dynamicProperties){
            return new modifiers[nm](elem, data, dynamicProperties);
        }

        return ob;
    }());

    function ShapeModifier(){}
    ShapeModifier.prototype.initModifierProperties = function(){};
    ShapeModifier.prototype.addShapeToModifier = function(){};
    ShapeModifier.prototype.addShape = function(shape){
        if(!this.closed){
            this.shapes.push({shape:shape,last:[]});
            this.addShapeToModifier(shape);
        }
    }
    ShapeModifier.prototype.init = function(elem,data,dynamicProperties){
        this.elem = elem;
        this.frameId = -1;
        this.shapes = [];
        this.dynamicProperties = [];
        this.mdf = false;
        this.closed = false;
        this.k = false;
        this.isTrimming = false;
        this.comp = elem.comp;
        this.initModifierProperties(elem,data);
        if(this.dynamicProperties.length){
            this.k = true;
            dynamicProperties.push(this);
        }else{
            this.getValue(true);
        }
    }
    function TrimModifier(){};
    extendPrototype(ShapeModifier,TrimModifier);
    TrimModifier.prototype.processKeys = function(forceRender){
        if(this.elem.globalData.frameId === this.frameId && !forceRender){
            return;
        }
        this.mdf = forceRender ? true : false;
        this.frameId = this.elem.globalData.frameId;
        var i, len = this.dynamicProperties.length;

        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue();
            if(this.dynamicProperties[i].mdf){
                this.mdf = true;
            }
        }
        if(this.mdf || forceRender){
            var o = (this.o.v%360)/360;
            if(o < 0){
                o += 1;
            }
            var s = this.s.v + o;
            var e = this.e.v + o;
            if(s == e){

            }
            if(s>e){
                var _s = s;
                s = e;
                e = _s;
            }
            this.sValue = s;
            this.eValue = e;
            this.oValue = o;
        }
    }
    TrimModifier.prototype.initModifierProperties = function(elem,data){
        this.sValue = 0;
        this.eValue = 0;
        this.oValue = 0;
        this.getValue = this.processKeys;
        this.s = PropertyFactory.getProp(elem,data.s,0,0.01,this.dynamicProperties);
        this.e = PropertyFactory.getProp(elem,data.e,0,0.01,this.dynamicProperties);
        this.o = PropertyFactory.getProp(elem,data.o,0,0,this.dynamicProperties);
        this.m = data.m;
        if(!this.dynamicProperties.length){
            this.getValue(true);
        }
    };

    TrimModifier.prototype.getSegmentsLength = function(keyframes){
        var closed = keyframes.c;
        var pathV = keyframes.v;
        var pathO = keyframes.o;
        var pathI = keyframes.i;
        var i, len = pathV.length;
        var lengths = [];
        var totalLength = 0;
        for(i=0;i<len-1;i+=1){
            lengths[i] = bez.getBezierLength(pathV[i],pathV[i+1],pathO[i],pathI[i+1]);
            totalLength += lengths[i].addedLength;
        }
        if(closed){
            lengths[i] = bez.getBezierLength(pathV[i],pathV[0],pathO[i],pathI[0]);
            totalLength += lengths[i].addedLength;
        }
        return {lengths:lengths,totalLength:totalLength};
    }

    TrimModifier.prototype.calculateShapeEdges = function(s, e, shapeLength, addedLength, totalModifierLength) {
        var segments = []
        if(e <= 1){
            segments.push({
                s: s,
                e: e
            })
        }else if(s >= 1){
            segments.push({
                s: s - 1,
                e: e - 1
            })
        }else{
            segments.push({
                s: s,
                e: 1
            })
            segments.push({
                s: 0,
                e: e - 1
            })
        }
        var shapeSegments = [];
        var i, len = segments.length, segmentOb;
        for(i = 0; i < len; i += 1) {
            segmentOb = segments[i];
            if (segmentOb.e * totalModifierLength < addedLength || segmentOb.s * totalModifierLength > addedLength + shapeLength) {

            } else {
                var shapeS, shapeE;
                if(segmentOb.s * totalModifierLength <= addedLength) {
                    shapeS = 0;
                } else {
                    shapeS = (segmentOb.s * totalModifierLength - addedLength) / shapeLength;
                }
                if(segmentOb.e * totalModifierLength >= addedLength + shapeLength) {
                    shapeE = 1;
                } else {
                    shapeE = ((segmentOb.e * totalModifierLength - addedLength) / shapeLength);
                }
                shapeSegments.push([shapeS, shapeE]);
            }
        }
        //console.log(shapeSegments);
        if(!shapeSegments.length){
            shapeSegments.push([0,0]);
        }
        return shapeSegments;
    }

    TrimModifier.prototype.processShapes = function(firstFrame){
        var shapePaths;
        var i, len = this.shapes.length;
        var j, jLen;
        var s = this.sValue;
        var e = this.eValue;
        var pathsData,pathData, totalShapeLength, totalModifierLength = 0;


        if(e === s){
            for(i=0;i<len;i+=1){
                this.shapes[i].shape.paths = [];
                this.shapes[i].shape.mdf = true;
            }
        } else if((e === 1 && s === 0) || (e===0 && s === 1)){
            for(i=0;i<len;i+=1){
                shapeData = this.shapes[i];
                if(shapeData.shape.paths !== shapeData.last){
                    shapeData.shape.mdf = true;
                    shapeData.last = shapeData.shape.paths;
                }
            }
        } else {
            var segments = [], shapeData, newShapes;
            for(i=0;i<len;i+=1){
                shapeData = this.shapes[i];
                if(!shapeData.shape.mdf && !this.mdf && !firstFrame && this.m !== 2){
                    shapeData.shape.paths = shapeData.last;
                } else {
                    shapePaths = shapeData.shape.paths;
                    jLen = shapePaths.length;
                    totalShapeLength = 0;
                    if(!shapeData.shape.mdf && shapeData.pathsData){
                        totalShapeLength = shapeData.totalShapeLength;
                    } else {
                        pathsData = [];
                        for(j=0;j<jLen;j+=1){
                            pathData = this.getSegmentsLength(shapePaths[j]);
                            pathsData.push(pathData);
                            totalShapeLength += pathData.totalLength;
                        }
                        shapeData.totalShapeLength = totalShapeLength;
                        shapeData.pathsData = pathsData;
                    }

                    totalModifierLength += totalShapeLength;
                    shapeData.shape.mdf = true;
                }
            }
            var shapeS = s, shapeE = e, addedLength = 0;
            var j, jLen;
            for(i = len - 1; i >= 0; i -= 1){
                newShapes = [];
                shapeData = this.shapes[i];
                if (shapeData.shape.mdf) {
                    if(this.m === 2 && len > 1) {
                        var edges = this.calculateShapeEdges(s, e, shapeData.totalShapeLength, addedLength, totalModifierLength);
                        addedLength += shapeData.totalShapeLength;
                    } else {
                        edges = [[shapeS, shapeE]]
                    }
                    jLen = edges.length;
                    for (j = 0; j < jLen; j += 1) {
                        shapeS = edges[j][0];
                        shapeE = edges[j][1];
                        segments.length = 0;
                        if(shapeE <= 1){
                            segments.push({
                                s:shapeData.totalShapeLength * shapeS,
                                e:shapeData.totalShapeLength * shapeE
                            })
                        }else if(shapeS >= 1){
                            segments.push({
                                s:shapeData.totalShapeLength * (shapeS - 1),
                                e:shapeData.totalShapeLength * (shapeE - 1)
                            })
                        }else{
                            segments.push({
                                s:shapeData.totalShapeLength * shapeS,
                                e:shapeData.totalShapeLength
                            })
                            segments.push({
                                s:0,
                                e:shapeData.totalShapeLength*(shapeE - 1)
                            })
                        }
                        var newShapeData = this.addShapes(shapeData,segments[0]);
                        if (segments[0].s !== segments[0].e) {
                            var lastPos;
                            newShapes.push(newShapeData);
                            if(segments.length > 1){
                                if(shapeData.shape.v.c){
                                    this.addShapes(shapeData,segments[1], newShapeData);
                                } else {
                                    newShapeData.i[0] = [newShapeData.v[0][0],newShapeData.v[0][1]];
                                    lastPos = newShapeData.v.length-1;
                                    newShapeData.o[lastPos] = [newShapeData.v[lastPos][0],newShapeData.v[lastPos][1]];
                                    newShapeData = this.addShapes(shapeData,segments[1]);
                                    newShapes.push(newShapeData);
                                }
                            }
                            newShapeData.i[0] = [newShapeData.v[0][0],newShapeData.v[0][1]];
                            lastPos = newShapeData.v.length-1;
                            newShapeData.o[lastPos] = [newShapeData.v[lastPos][0],newShapeData.v[lastPos][1]];
                        }

                    }
                    shapeData.last = newShapes;
                    shapeData.shape.paths = newShapes;
                }
            }
        }
        if(!this.dynamicProperties.length){
            this.mdf = false;
        }
    }

    TrimModifier.prototype.addSegment = function(pt1,pt2,pt3,pt4,shapePath,pos) {
        shapePath.o[pos] = pt2;
        shapePath.i[pos+1] = pt3;
        shapePath.v[pos+1] = pt4;
        shapePath.v[pos] = pt1;
    }

    TrimModifier.prototype.addShapes = function(shapeData, shapeSegment, shapePath){
        var pathsData = shapeData.pathsData;
        var shapePaths = shapeData.shape.paths;
        var i, len = shapePaths.length, j, jLen;
        var addedLength = 0;
        var currentLengthData,segmentCount;
        var lengths;
        var segment;
        if(!shapePath){
            shapePath = {
                c: false,
                v:[],
                i:[],
                o:[]
            };
            segmentCount = 0;
        } else {
            segmentCount = shapePath.v.length - 1;
        }
        for(i=0;i<len;i+=1){
            lengths = pathsData[i].lengths;
            jLen = shapePaths[i].c ? lengths.length : lengths.length + 1;
            for(j=1;j<jLen;j+=1){
                currentLengthData = lengths[j-1];
                if(addedLength + currentLengthData.addedLength < shapeSegment.s){
                    addedLength += currentLengthData.addedLength;
                } else if(addedLength > shapeSegment.e){
                    break;
                } else {
                    if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + currentLengthData.addedLength){
                        this.addSegment(shapePaths[i].v[j-1],shapePaths[i].o[j-1],shapePaths[i].i[j],shapePaths[i].v[j],shapePath,segmentCount);

                    } else {
                        segment = bez.getNewSegment(shapePaths[i].v[j-1],shapePaths[i].v[j],shapePaths[i].o[j-1],shapePaths[i].i[j], (shapeSegment.s - addedLength)/currentLengthData.addedLength,(shapeSegment.e - addedLength)/currentLengthData.addedLength, lengths[j-1]);
                        this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                    }
                    addedLength += currentLengthData.addedLength;
                    segmentCount += 1;
                }
            }
            if(shapePaths[i].c){
                if(addedLength <= shapeSegment.e){
                    var segmentLength = lengths[j-1].addedLength;
                    if(shapeSegment.s <= addedLength && shapeSegment.e >= addedLength + segmentLength){
                        this.addSegment(shapePaths[i].v[j-1],shapePaths[i].o[j-1],shapePaths[i].i[0],shapePaths[i].v[0],shapePath,segmentCount);
                    }else{
                        segment = bez.getNewSegment(shapePaths[i].v[j-1],shapePaths[i].v[0],shapePaths[i].o[j-1],shapePaths[i].i[0], (shapeSegment.s - addedLength)/segmentLength,(shapeSegment.e - addedLength)/segmentLength, lengths[j-1]);
                        this.addSegment(segment.pt1,segment.pt3,segment.pt4,segment.pt2,shapePath,segmentCount);
                    }
                }
            }
        }
        return shapePath;

    }


    ShapeModifiers.registerModifier('tm',TrimModifier);
    function RoundCornersModifier(){};
    extendPrototype(ShapeModifier,RoundCornersModifier);
    RoundCornersModifier.prototype.processKeys = function(forceRender){
        if(this.elem.globalData.frameId === this.frameId && !forceRender){
            return;
        }
        this.mdf = forceRender ? true : false;
        this.frameId = this.elem.globalData.frameId;
        var i, len = this.dynamicProperties.length;

        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue();
            if(this.dynamicProperties[i].mdf){
                this.mdf = true;
            }
        }
    }
    RoundCornersModifier.prototype.initModifierProperties = function(elem,data){
        this.getValue = this.processKeys;
        this.rd = PropertyFactory.getProp(elem,data.r,0,null,this.dynamicProperties);
        if(!this.dynamicProperties.length){
            this.getValue(true);
        }
    };

    RoundCornersModifier.prototype.processPath = function(path, round){
        var i, len = path.v.length;
        var vValues = [],oValues = [],iValues = [];
        var currentV,currentI,currentO,closerV, newV,newO,newI,distance,newPosPerc;
        for(i=0;i<len;i+=1){
            currentV = path.v[i];
            currentO = path.o[i];
            currentI = path.i[i];
            if(currentV[0]===currentO[0] && currentV[1]===currentO[1] && currentV[0]===currentI[0] && currentV[1]===currentI[1]){
                if((i===0 || i === len - 1) && !path.c){
                    vValues.push(currentV);
                    oValues.push(currentO);
                    iValues.push(currentI);
                } else {
                    if(i===0){
                        closerV = path.v[len-1];
                    } else {
                        closerV = path.v[i-1];
                    }
                    distance = Math.sqrt(Math.pow(currentV[0]-closerV[0],2)+Math.pow(currentV[1]-closerV[1],2));
                    newPosPerc = distance ? Math.min(distance/2,round)/distance : 0;
                    newV = [currentV[0]+(closerV[0]-currentV[0])*newPosPerc,currentV[1]-(currentV[1]-closerV[1])*newPosPerc];
                    newI = newV;
                    newO = [newV[0]-(newV[0]-currentV[0])*roundCorner,newV[1]-(newV[1]-currentV[1])*roundCorner];
                    vValues.push(newV);
                    oValues.push(newO);
                    iValues.push(newI);

                    if(i === len - 1){
                        closerV = path.v[0];
                    } else {
                        closerV = path.v[i+1];
                    }
                    distance = Math.sqrt(Math.pow(currentV[0]-closerV[0],2)+Math.pow(currentV[1]-closerV[1],2));
                    newPosPerc = distance ? Math.min(distance/2,round)/distance : 0;
                    newV = [currentV[0]+(closerV[0]-currentV[0])*newPosPerc,currentV[1]+(closerV[1]-currentV[1])*newPosPerc];
                    newI = [newV[0]-(newV[0]-currentV[0])*roundCorner,newV[1]-(newV[1]-currentV[1])*roundCorner];
                    newO = newV;
                    vValues.push(newV);
                    oValues.push(newO);
                    iValues.push(newI);
                }
            } else {
                vValues.push(path.v[i]);
                oValues.push(path.o[i]);
                iValues.push(path.i[i]);
            }
        }
        return {
            v:vValues,
            o:oValues,
            i:iValues,
            c:path.c
        };
    }

    RoundCornersModifier.prototype.processShapes = function(){
        var shapePaths;
        var i, len = this.shapes.length;
        var j, jLen;
        var rd = this.rd.v;

        if(rd !== 0){
            var shapeData, newPaths;
            for(i=0;i<len;i+=1){
                newPaths = [];
                shapeData = this.shapes[i];
                if(!shapeData.shape.mdf && !this.mdf){
                    shapeData.shape.paths = shapeData.last;
                } else {
                    shapeData.shape.mdf = true;
                    shapePaths = shapeData.shape.paths;
                    jLen = shapePaths.length;
                    for(j=0;j<jLen;j+=1){
                        newPaths.push(this.processPath(shapePaths[j],rd));
                    }
                    shapeData.shape.paths = newPaths;
                    shapeData.last = newPaths;
                }
            }

        }
        if(!this.dynamicProperties.length){
            this.mdf = false;
        }
    }


    ShapeModifiers.registerModifier('rd',RoundCornersModifier);
    var ImagePreloader = (function(){

        function imageLoaded(){
            this.loadedAssets += 1;
            if(this.loadedAssets === this.totalImages){
            }
        }

        function getAssetsPath(assetData){
            var path = '';
            if(this.assetsPath){
                var imagePath = assetData.p;
                if(imagePath.indexOf('images/') !== -1){
                    imagePath = imagePath.split('/')[1];
                }
                path = this.assetsPath + imagePath;
            } else {
                path = this.path;
                path += assetData.u ? assetData.u : '';
                path += assetData.p;
            }
            return path;
        }

        function loadImage(path){
            var img = document.createElement('img');
            img.addEventListener('load', imageLoaded.bind(this), false);
            img.addEventListener('error', imageLoaded.bind(this), false);
            img.src = path;
        }
        function loadAssets(assets){
            this.totalAssets = assets.length;
            var i;
            for(i=0;i<this.totalAssets;i+=1){
                if(!assets[i].layers){
                    loadImage.bind(this)(getAssetsPath.bind(this)(assets[i]));
                    this.totalImages += 1;
                }
            }
        }

        function setPath(path){
            this.path = path || '';
        }

        function setAssetsPath(path){
            this.assetsPath = path || '';
        }

        return function ImagePreloader(){
            this.loadAssets = loadAssets;
            this.setAssetsPath = setAssetsPath;
            this.setPath = setPath;
            this.assetsPath = '';
            this.path = '';
            this.totalAssets = 0;
            this.totalImages = 0;
            this.loadedAssets = 0;
        }
    }());
    var featureSupport = (function(){
        var ob = {
            maskType: true
        }
        if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) {
            ob.maskType = false;
        }
        return ob;
    }());
    var filtersFactory = (function(){
        var ob = {};
        ob.createFilter = createFilter;
        ob.createAlphaToLuminanceFilter = createAlphaToLuminanceFilter;

        function createFilter(filId){
            var fil = document.createElementNS(svgNS,'filter');
            fil.setAttribute('id',filId);
            fil.setAttribute('filterUnits','objectBoundingBox');
            fil.setAttribute('x','0%');
            fil.setAttribute('y','0%');
            fil.setAttribute('width','100%');
            fil.setAttribute('height','100%');
            return fil;
        }

        function createAlphaToLuminanceFilter(){
            var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
            feColorMatrix.setAttribute('type','matrix');
            feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
            feColorMatrix.setAttribute('values','0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1');
            return feColorMatrix;
        }

        return ob;
    }())
    function BaseRenderer(){}
    BaseRenderer.prototype.checkLayers = function(num){
        var i, len = this.layers.length, data;
        this.completeLayers = true;
        for (i = len - 1; i >= 0; i--) {
            if (!this.elements[i]) {
                data = this.layers[i];
                if(data.ip - data.st <= (num - this.layers[i].st) && data.op - data.st > (num - this.layers[i].st))
                {
                    this.buildItem(i);
                }
            }
            this.completeLayers = this.elements[i] ? this.completeLayers:false;
        }
        this.checkPendingElements();
    };

    BaseRenderer.prototype.createItem = function(layer){
        switch(layer.ty){
            case 2:
                return this.createImage(layer);
            case 0:
                return this.createComp(layer);
            case 1:
                return this.createSolid(layer);
            case 4:
                return this.createShape(layer);
            case 5:
                return this.createText(layer);
            case 99:
                return null;
        }
        return this.createBase(layer);
    };
    BaseRenderer.prototype.buildAllItems = function(){
        var i, len = this.layers.length;
        for(i=0;i<len;i+=1){
            this.buildItem(i);
        }
        this.checkPendingElements();
    };

    BaseRenderer.prototype.includeLayers = function(newLayers){
        this.completeLayers = false;
        var i, len = newLayers.length;
        var j, jLen = this.layers.length;
        for(i=0;i<len;i+=1){
            j = 0;
            while(j<jLen){
                if(this.layers[j].id == newLayers[i].id){
                    this.layers[j] = newLayers[i];
                    break;
                }
                j += 1;
            }
        }
    };

    BaseRenderer.prototype.setProjectInterface = function(pInterface){
        this.globalData.projectInterface = pInterface;
    };

    BaseRenderer.prototype.initItems = function(){
        if(!this.globalData.progressiveLoad){
            this.buildAllItems();
        }
    };
    BaseRenderer.prototype.buildElementParenting = function(element, parentName, hierarchy){
        hierarchy = hierarchy || [];
        var elements = this.elements;
        var layers = this.layers;
        var i=0, len = layers.length;
        while(i<len){
            if(layers[i].ind == parentName){
                if(!elements[i] || elements[i] === true){
                    this.buildItem(i);
                    this.addPendingElement(element);
                } else if(layers[i].parent !== undefined){
                    hierarchy.push(elements[i]);
                    this.buildElementParenting(element,layers[i].parent, hierarchy);
                } else {
                    hierarchy.push(elements[i]);
                    element.setHierarchy(hierarchy);
                }


            }
            i += 1;
        }
    };

    BaseRenderer.prototype.addPendingElement = function(element){
        this.pendingElements.push(element);
    };
    function SVGRenderer(animationItem, config){
        this.animationItem = animationItem;
        this.layers = null;
        this.renderedFrame = -1;
        this.globalData = {
            frameNum: -1
        };
        this.renderConfig = {
            preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet',
            progressiveLoad: (config && config.progressiveLoad) || false
        };
        this.elements = [];
        this.pendingElements = [];
        this.destroyed = false;

    }

    extendPrototype(BaseRenderer,SVGRenderer);

    SVGRenderer.prototype.createBase = function (data) {
        return new SVGBaseElement(data, this.layerElement,this.globalData,this);
    };

    SVGRenderer.prototype.createShape = function (data) {
        return new IShapeElement(data, this.layerElement,this.globalData,this);
    };

    SVGRenderer.prototype.createText = function (data) {
        return new SVGTextElement(data, this.layerElement,this.globalData,this);

    };

    SVGRenderer.prototype.createImage = function (data) {
        return new IImageElement(data, this.layerElement,this.globalData,this);
    };

    SVGRenderer.prototype.createComp = function (data) {
        return new ICompElement(data, this.layerElement,this.globalData,this);

    };

    SVGRenderer.prototype.createSolid = function (data) {
        return new ISolidElement(data, this.layerElement,this.globalData,this);
    };

    SVGRenderer.prototype.configAnimation = function(animData){
        this.layerElement = document.createElementNS(svgNS,'svg');
        this.layerElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
        this.layerElement.setAttribute('width',animData.w);
        this.layerElement.setAttribute('height',animData.h);
        this.layerElement.setAttribute('viewBox','0 0 '+animData.w+' '+animData.h);
        this.layerElement.setAttribute('preserveAspectRatio',this.renderConfig.preserveAspectRatio);
        this.layerElement.style.width = '100%';
        this.layerElement.style.height = '100%';
        //this.layerElement.style.transform = 'translate3d(0,0,0)';
        //this.layerElement.style.transformOrigin = this.layerElement.style.mozTransformOrigin = this.layerElement.style.webkitTransformOrigin = this.layerElement.style['-webkit-transform'] = "0px 0px 0px";
        this.animationItem.wrapper.appendChild(this.layerElement);
        //Mask animation
        var defs = document.createElementNS(svgNS, 'defs');
        this.globalData.defs = defs;
        this.layerElement.appendChild(defs);
        this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
        this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
        this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
        this.globalData.frameId = 0;
        this.globalData.compSize = {
            w: animData.w,
            h: animData.h
        };
        this.globalData.frameRate = animData.fr;
        var maskElement = document.createElementNS(svgNS, 'clipPath');
        var rect = document.createElementNS(svgNS,'rect');
        rect.setAttribute('width',animData.w);
        rect.setAttribute('height',animData.h);
        rect.setAttribute('x',0);
        rect.setAttribute('y',0);
        var maskId = 'animationMask_'+randomString(10);
        maskElement.setAttribute('id', maskId);
        maskElement.appendChild(rect);
        var maskedElement = document.createElementNS(svgNS,'g');
        maskedElement.setAttribute("clip-path", "url(#"+maskId+")");
        this.layerElement.appendChild(maskedElement);
        defs.appendChild(maskElement);
        this.layerElement = maskedElement;
        this.layers = animData.layers;
        this.globalData.fontManager = new FontManager();
        this.globalData.fontManager.addChars(animData.chars);
        this.globalData.fontManager.addFonts(animData.fonts,defs);
        this.elements = Array.apply(null,{length:animData.layers.length});
    };


    SVGRenderer.prototype.destroy = function () {
        this.animationItem.wrapper.innerHTML = '';
        this.layerElement = null;
        this.globalData.defs = null;
        var i, len = this.layers ? this.layers.length : 0;
        for (i = 0; i < len; i++) {
            if(this.elements[i]){
                this.elements[i].destroy();
            }
        }
        this.elements.length = 0;
        this.destroyed = true;
        this.animationItem = null;
    };

    SVGRenderer.prototype.updateContainerSize = function () {
    };

    SVGRenderer.prototype.buildItem  = function(pos){
        var elements = this.elements;
        if(elements[pos] || this.layers[pos].ty == 99){
            return;
        }
        elements[pos] = true;
        var element = this.createItem(this.layers[pos]);

        elements[pos] = element;
        if(expressionsPlugin){
            if(this.layers[pos].ty === 0){
                this.globalData.projectInterface.registerComposition(element);
            }
            element.initExpressions();
        }
        this.appendElementInPos(element,pos);
        if(this.layers[pos].tt){
            if(!this.elements[pos - 1] || this.elements[pos - 1] === true){
                this.buildItem(pos - 1);
                this.addPendingElement(element);
            } else {
                element.setMatte(elements[pos - 1].layerId);
            }
        }
    };

    SVGRenderer.prototype.checkPendingElements  = function(){
        while(this.pendingElements.length){
            var element = this.pendingElements.pop();
            element.checkParenting();
            if(element.data.tt){
                var i = 0, len = this.elements.length;
                while(i<len){
                    if(this.elements[i] === element){
                        element.setMatte(this.elements[i - 1].layerId);
                        break;
                    }
                    i += 1;
                }
            }
        }
    };

    SVGRenderer.prototype.renderFrame = function(num){
        if(this.renderedFrame == num || this.destroyed){
            return;
        }
        if(num === null){
            num = this.renderedFrame;
        }else{
            this.renderedFrame = num;
        }
        //clearPoints();
        /*console.log('-------');
         console.log('FRAME ',num);*/
        this.globalData.frameNum = num;
        this.globalData.frameId += 1;
        this.globalData.projectInterface.currentFrame = num;
        var i, len = this.layers.length;
        if(!this.completeLayers){
            this.checkLayers(num);
        }
        for (i = len - 1; i >= 0; i--) {
            if(this.completeLayers || this.elements[i]){
                this.elements[i].prepareFrame(num - this.layers[i].st);
            }
        }
        for (i = len - 1; i >= 0; i--) {
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
    };

    SVGRenderer.prototype.appendElementInPos = function(element, pos){
        var newElement = element.getBaseElement();
        if(!newElement){
            return;
        }
        var i = 0;
        var nextElement;
        while(i<pos){
            if(this.elements[i] && this.elements[i]!== true && this.elements[i].getBaseElement()){
                nextElement = this.elements[i].getBaseElement();
            }
            i += 1;
        }
        if(nextElement){
            this.layerElement.insertBefore(newElement, nextElement);
        } else {
            this.layerElement.appendChild(newElement);
        }
    };

    SVGRenderer.prototype.hide = function(){
        this.layerElement.style.display = 'none';
    };

    SVGRenderer.prototype.show = function(){
        this.layerElement.style.display = 'block';
    };

    SVGRenderer.prototype.searchExtraCompositions = function(assets){
        var i, len = assets.length;
        var floatingContainer = document.createElementNS(svgNS,'g');
        for(i=0;i<len;i+=1){
            if(assets[i].xt){
                var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
                comp.initExpressions();
                //comp.compInterface = CompExpressionInterface(comp);
                //Expressions.addLayersInterface(comp.elements, this.globalData.projectInterface);
                this.globalData.projectInterface.registerComposition(comp);
            }
        }
    };

    function MaskElement(data,element,globalData) {
        this.dynamicProperties = [];
        this.data = data;
        this.element = element;
        this.globalData = globalData;
        this.paths = [];
        this.storedData = [];
        this.masksProperties = this.data.masksProperties;
        this.viewData = new Array(this.masksProperties.length);
        this.maskElement = null;
        this.firstFrame = true;
        var defs = this.globalData.defs;
        var i, len = this.masksProperties.length;


        var path, properties = this.masksProperties;
        var count = 0;
        var currentMasks = [];
        var j, jLen;
        var layerId = randomString(10);
        var rect, expansor, feMorph,x;
        var maskType = 'clipPath', maskRef = 'clip-path';
        for (i = 0; i < len; i++) {

            if((properties[i].mode !== 'a' && properties[i].mode !== 'n')|| properties[i].inv || properties[i].o.k !== 100){
                maskType = 'mask';
                maskRef = 'mask';
            }

            if((properties[i].mode == 's' || properties[i].mode == 'i') && count == 0){
                rect = document.createElementNS(svgNS, 'rect');
                rect.setAttribute('fill', '#ffffff');
                rect.setAttribute('width', this.element.comp.data ? this.element.comp.data.w : this.element.globalData.compSize.w);
                rect.setAttribute('height', this.element.comp.data ? this.element.comp.data.h : this.element.globalData.compSize.h);
                currentMasks.push(rect);
            } else {
                rect = null;
            }

            path = document.createElementNS(svgNS, 'path');
            if(properties[i].mode == 'n') {
                this.viewData[i] = {
                    op: PropertyFactory.getProp(this.element,properties[i].o,0,0.01,this.dynamicProperties),
                    prop: ShapePropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null),
                    elem: path
                };
                defs.appendChild(path);
                continue;
            }
            count += 1;

            if(properties[i].mode == 's'){
                path.setAttribute('fill', '#000000');
            }else{
                path.setAttribute('fill', '#ffffff');
            }
            path.setAttribute('clip-rule','nonzero');

            if(properties[i].x.k !== 0){
                maskType = 'mask';
                maskRef = 'mask';
                x = PropertyFactory.getProp(this.element,properties[i].x,0,null,this.dynamicProperties);
                var filterID = 'fi_'+randomString(10);
                expansor = document.createElementNS(svgNS,'filter');
                expansor.setAttribute('id',filterID);
                feMorph = document.createElementNS(svgNS,'feMorphology');
                feMorph.setAttribute('operator','dilate');
                feMorph.setAttribute('in','SourceGraphic');
                feMorph.setAttribute('radius','0');
                expansor.appendChild(feMorph);
                defs.appendChild(expansor);
                if(properties[i].mode == 's'){
                    path.setAttribute('stroke', '#000000');
                }else{
                    path.setAttribute('stroke', '#ffffff');
                }
            }else{
                feMorph = null;
                x = null;
            }


            this.storedData[i] = {
                elem: path,
                x: x,
                expan: feMorph,
                lastPath: '',
                lastOperator:'',
                filterId:filterID,
                lastRadius:0
            };
            if(properties[i].mode == 'i'){
                jLen = currentMasks.length;
                var g = document.createElementNS(svgNS,'g');
                for(j=0;j<jLen;j+=1){
                    g.appendChild(currentMasks[j]);
                }
                var mask = document.createElementNS(svgNS,'mask');
                mask.setAttribute('mask-type','alpha');
                mask.setAttribute('id',layerId+'_'+count);
                mask.appendChild(path);
                defs.appendChild(mask);
                g.setAttribute('mask','url(#'+layerId+'_'+count+')');

                currentMasks.length = 0;
                currentMasks.push(g);
            }else{
                currentMasks.push(path);
            }
            if(properties[i].inv && !this.solidPath){
                this.solidPath = this.createLayerSolidPath();
            }
            this.viewData[i] = {
                elem: path,
                lastPath: '',
                op: PropertyFactory.getProp(this.element,properties[i].o,0,0.01,this.dynamicProperties),
                prop:ShapePropertyFactory.getShapeProp(this.element,properties[i],3,this.dynamicProperties,null)
            };
            if(rect){
                this.viewData[i].invRect = rect;
            }
            if(!this.viewData[i].prop.k){
                this.drawPath(properties[i],this.viewData[i].prop.v,this.viewData[i]);
            }
        }

        this.maskElement = document.createElementNS(svgNS, maskType);

        len = currentMasks.length;
        for(i=0;i<len;i+=1){
            this.maskElement.appendChild(currentMasks[i]);
        }

        this.maskElement.setAttribute('id', layerId);
        if(count > 0){
            this.element.maskedElement.setAttribute(maskRef, "url(#" + layerId + ")");
        }

        defs.appendChild(this.maskElement);
    };

    MaskElement.prototype.getMaskProperty = function(pos){
        return this.viewData[pos].prop;
    };

    MaskElement.prototype.prepareFrame = function(){
        var i, len = this.dynamicProperties.length;
        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue();

        }
    };

    MaskElement.prototype.renderFrame = function (finalMat) {
        var i, len = this.masksProperties.length;
        for (i = 0; i < len; i++) {
            if(this.viewData[i].prop.mdf || this.firstFrame){
                this.drawPath(this.masksProperties[i],this.viewData[i].prop.v,this.viewData[i]);
            }
            if(this.viewData[i].op.mdf || this.firstFrame){
                this.viewData[i].elem.setAttribute('fill-opacity',this.viewData[i].op.v);
            }
            if(this.masksProperties[i].mode !== 'n'){
                if(this.viewData[i].invRect && (this.element.finalTransform.mProp.mdf || this.firstFrame)){
                    this.viewData[i].invRect.setAttribute('x', -finalMat.props[12]);
                    this.viewData[i].invRect.setAttribute('y', -finalMat.props[13]);
                }
                if(this.storedData[i].x && (this.storedData[i].x.mdf || this.firstFrame)){
                    var feMorph = this.storedData[i].expan;
                    if(this.storedData[i].x.v < 0){
                        if(this.storedData[i].lastOperator !== 'erode'){
                            this.storedData[i].lastOperator = 'erode';
                            this.storedData[i].elem.setAttribute('filter','url(#'+this.storedData[i].filterId+')');
                        }
                        feMorph.setAttribute('radius',-this.storedData[i].x.v);
                    }else{
                        if(this.storedData[i].lastOperator !== 'dilate'){
                            this.storedData[i].lastOperator = 'dilate';
                            this.storedData[i].elem.setAttribute('filter',null);
                        }
                        this.storedData[i].elem.setAttribute('stroke-width', this.storedData[i].x.v*2);

                    }
                }
            }
        }
        this.firstFrame = false;
    };

    MaskElement.prototype.getMaskelement = function () {
        return this.maskElement;
    };

    MaskElement.prototype.createLayerSolidPath = function(){
        var path = 'M0,0 ';
        path += ' h' + this.globalData.compSize.w ;
        path += ' v' + this.globalData.compSize.h ;
        path += ' h-' + this.globalData.compSize.w ;
        path += ' v-' + this.globalData.compSize.h + ' ';
        return path;
    };

    MaskElement.prototype.drawPath = function(pathData,pathNodes,viewData){
        var pathString = '';
        var i, len;
        len = pathNodes.v.length;
        for(i=1;i<len;i+=1){
            if(i==1){
                //pathString += " M"+pathNodes.v[0][0]+','+pathNodes.v[0][1];
                pathString += " M"+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
            }
            //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[i][0]+','+pathNodes.i[i][1] + " "+pathNodes.v[i][0]+','+pathNodes.v[i][1];
            pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[i][0])+','+bm_rnd(pathNodes.i[i][1]) + " "+bm_rnd(pathNodes.v[i][0])+','+bm_rnd(pathNodes.v[i][1]);
        }
        //pathString += " C"+pathNodes.o[i-1][0]+','+pathNodes.o[i-1][1] + " "+pathNodes.i[0][0]+','+pathNodes.i[0][1] + " "+pathNodes.v[0][0]+','+pathNodes.v[0][1];
        if(pathNodes.c && len > 1){
            pathString += " C"+bm_rnd(pathNodes.o[i-1][0])+','+bm_rnd(pathNodes.o[i-1][1]) + " "+bm_rnd(pathNodes.i[0][0])+','+bm_rnd(pathNodes.i[0][1]) + " "+bm_rnd(pathNodes.v[0][0])+','+bm_rnd(pathNodes.v[0][1]);
        }
        //pathNodes.__renderedString = pathString;


        if(viewData.lastPath !== pathString){
            if(viewData.elem){
                if(!pathNodes.c){
                    viewData.elem.setAttribute('d','');
                }else if(pathData.inv){
                    viewData.elem.setAttribute('d',this.solidPath + pathString);
                }else{
                    viewData.elem.setAttribute('d',pathString);
                }
            }
            viewData.lastPath = pathString;
        }
    };

    MaskElement.prototype.getMask = function(nm){
        var i = 0, len = this.masksProperties.length;
        while(i<len){
            if(this.masksProperties[i].nm === nm){
                return {
                    maskPath: this.viewData[i].prop.pv
                }
            }
            i += 1;
        }
    };

    MaskElement.prototype.destroy = function(){
        this.element = null;
        this.globalData = null;
        this.maskElement = null;
        this.data = null;
        this.paths = null;
        this.masksProperties = null;
    };
    function BaseElement(){
    };
    BaseElement.prototype.checkMasks = function(){
        if(!this.data.hasMask){
            return false;
        }
        var i = 0, len = this.data.masksProperties.length;
        while(i<len) {
            if((this.data.masksProperties[i].mode !== 'n' && this.data.masksProperties[i].cl !== false)) {
                return true;
            }
            i += 1;
        }
        return false;
    }

    BaseElement.prototype.checkParenting = function(){
        if(this.data.parent !== undefined){
            this.comp.buildElementParenting(this, this.data.parent);
        }
    }

    BaseElement.prototype.prepareFrame = function(num){
        if(this.data.ip - this.data.st <= num && this.data.op - this.data.st > num)
        {
            if(this.isVisible !== true){
                this.elemMdf = true;
                this.globalData.mdf = true;
                this.isVisible = true;
                this.firstFrame = true;
                if(this.data.hasMask){
                    this.maskManager.firstFrame = true;
                }
            }
        }else{
            if(this.isVisible !== false){
                this.elemMdf = true;
                this.globalData.mdf = true;
                this.isVisible = false;
            }
        }
        var i, len = this.dynamicProperties.length;
        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue();
            if(this.dynamicProperties[i].mdf){
                this.elemMdf = true;
                this.globalData.mdf = true;
            }
        }
        if(this.data.hasMask){
            this.maskManager.prepareFrame(num*this.data.sr);
        }
        /* TODO check this
         if(this.data.sy){
         if(this.data.sy[0].renderedData[num]){
         if(this.data.sy[0].renderedData[num].c){
         this.feFlood.setAttribute('flood-color','rgb('+Math.round(this.data.sy[0].renderedData[num].c[0])+','+Math.round(this.data.sy[0].renderedData[num].c[1])+','+Math.round(this.data.sy[0].renderedData[num].c[2])+')');
         }
         if(this.data.sy[0].renderedData[num].s){
         this.feMorph.setAttribute('radius',this.data.sy[0].renderedData[num].s);
         }
         }
         }
         */


        this.currentFrameNum = num*this.data.sr;
        return this.isVisible;
    };

    BaseElement.prototype.globalToLocal = function(pt){
        var transforms = [];
        transforms.push(this.finalTransform);
        var flag = true;
        var comp = this.comp;
        while(flag){
            if(comp.finalTransform){
                if(comp.data.hasMask){
                    transforms.splice(0,0,comp.finalTransform);
                }
                comp = comp.comp;
            } else {
                flag = false;
            }
        }
        var i, len = transforms.length,ptNew;
        for(i=0;i<len;i+=1){
            ptNew = transforms[i].mat.applyToPointArray(0,0,0);
            //ptNew = transforms[i].mat.applyToPointArray(pt[0],pt[1],pt[2]);
            pt = [pt[0] - ptNew[0],pt[1] - ptNew[1],0];
        }
        return pt;
    };

    BaseElement.prototype.initExpressions = function(){
        this.layerInterface = LayerExpressionInterface(this);
        //layers[i].layerInterface = LayerExpressionInterface(layers[i]);
        //layers[i].layerInterface = LayerExpressionInterface(layers[i]);
        if(this.data.hasMask){
            this.layerInterface.registerMaskInterface(this.maskManager);
        }
        var effectsInterface = EffectsExpressionInterface.createEffectsInterface(this,this.layerInterface);
        this.layerInterface.registerEffectsInterface(effectsInterface);

        if(this.data.ty === 0 || this.data.xt){
            this.compInterface = CompExpressionInterface(this);
        } else if(this.data.ty === 4){
            this.layerInterface.shapeInterface = ShapeExpressionInterface.createShapeInterface(this.shapesData,this.viewData,this.layerInterface);
        }
    }

    BaseElement.prototype.setBlendMode = function(){
        var blendModeValue = '';
        switch(this.data.bm){
            case 1:
                blendModeValue = 'multiply';
                break;
            case 2:
                blendModeValue = 'screen';
                break;
            case 3:
                blendModeValue = 'overlay';
                break;
            case 4:
                blendModeValue = 'darken';
                break;
            case 5:
                blendModeValue = 'lighten';
                break;
            case 6:
                blendModeValue = 'color-dodge';
                break;
            case 7:
                blendModeValue = 'color-burn';
                break;
            case 8:
                blendModeValue = 'hard-light';
                break;
            case 9:
                blendModeValue = 'soft-light';
                break;
            case 10:
                blendModeValue = 'difference';
                break;
            case 11:
                blendModeValue = 'exclusion';
                break;
            case 12:
                blendModeValue = 'hue';
                break;
            case 13:
                blendModeValue = 'saturation';
                break;
            case 14:
                blendModeValue = 'color';
                break;
            case 15:
                blendModeValue = 'luminosity';
                break;
        }
        var elem = this.baseElement || this.layerElement;

        elem.style['mix-blend-mode'] = blendModeValue;
    }

    BaseElement.prototype.init = function(){
        if(!this.data.sr){
            this.data.sr = 1;
        }
        this.dynamicProperties = [];
        if(this.data.ef){
            this.effects = new EffectsManager(this.data,this,this.dynamicProperties);
            //this.effect = this.effectsManager.bind(this.effectsManager);
        }
        //this.elemInterface = buildLayerExpressionInterface(this);
        this.hidden = false;
        this.firstFrame = true;
        this.isVisible = false;
        this.currentFrameNum = -99999;
        this.lastNum = -99999;
        if(this.data.ks){
            this.finalTransform = {
                mProp: PropertyFactory.getProp(this,this.data.ks,2,null,this.dynamicProperties),
                matMdf: false,
                opMdf: false,
                mat: new Matrix(),
                opacity: 1
            };
            if(this.data.ao){
                this.finalTransform.mProp.autoOriented = true;
            }
            this.finalTransform.op = this.finalTransform.mProp.o;
            this.transform = this.finalTransform.mProp;
            if(this.data.ty !== 11){
                this.createElements();
            }
            if(this.data.hasMask){
                this.addMasks(this.data);
            }
        }
        this.elemMdf = false;
    };
    BaseElement.prototype.getType = function(){
        return this.type;
    };

    BaseElement.prototype.resetHierarchy = function(){
        if(!this.hierarchy){
            this.hierarchy = [];
        }else{
            this.hierarchy.length = 0;
        }
    };

    BaseElement.prototype.getHierarchy = function(){
        if(!this.hierarchy){
            this.hierarchy = [];
        }
        return this.hierarchy;
    };

    BaseElement.prototype.setHierarchy = function(hierarchy){
        this.hierarchy = hierarchy;
    };

    BaseElement.prototype.getLayerSize = function(){
        if(this.data.ty === 5){
            return {w:this.data.textData.width,h:this.data.textData.height};
        }else{
            return {w:this.data.width,h:this.data.height};
        }
    };

    BaseElement.prototype.hide = function(){

    };

    BaseElement.prototype.mHelper = new Matrix();
    function SVGBaseElement(data,parentContainer,globalData,comp, placeholder){
        this.globalData = globalData;
        this.comp = comp;
        this.data = data;
        this.matteElement = null;
        this.transformedElement = null;
        this.parentContainer = parentContainer;
        this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
        this.placeholder = placeholder;
        this.init();
    };

    createElement(BaseElement, SVGBaseElement);

    SVGBaseElement.prototype.createElements = function(){
        this.layerElement = document.createElementNS(svgNS,'g');
        this.transformedElement = this.layerElement;
        if(this.data.hasMask){
            this.maskedElement = this.layerElement;
        }
        var layerElementParent = null;
        if(this.data.td){
            if(this.data.td == 3 || this.data.td == 1){
                var masker = document.createElementNS(svgNS,'mask');
                masker.setAttribute('id',this.layerId);
                masker.setAttribute('mask-type',this.data.td == 3 ? 'luminance':'alpha');
                masker.appendChild(this.layerElement);
                layerElementParent = masker;
                this.globalData.defs.appendChild(masker);
                ////// This is only for IE and Edge when mask if of type alpha
                if(!featureSupport.maskType && this.data.td == 1){
                    masker.setAttribute('mask-type','luminance');
                    var filId = randomString(10);
                    var fil = filtersFactory.createFilter(filId);
                    this.globalData.defs.appendChild(fil);
                    fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                    var gg = document.createElementNS(svgNS,'g');
                    gg.appendChild(this.layerElement);
                    layerElementParent = gg;
                    masker.appendChild(gg);
                    gg.setAttribute('filter','url(#'+filId+')');
                }
            }else if(this.data.td == 2){
                var maskGroup = document.createElementNS(svgNS,'mask');
                maskGroup.setAttribute('id',this.layerId);
                maskGroup.setAttribute('mask-type','alpha');
                var maskGrouper = document.createElementNS(svgNS,'g');
                maskGroup.appendChild(maskGrouper);
                var filId = randomString(10);
                var fil = filtersFactory.createFilter(filId);
                ////

                var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
                feColorMatrix.setAttribute('type','matrix');
                feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
                feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 -1 1');
                fil.appendChild(feColorMatrix);

                ////
                /*var feCTr = document.createElementNS(svgNS,'feComponentTransfer');
                 feCTr.setAttribute('in','SourceGraphic');
                 fil.appendChild(feCTr);
                 var feFunc = document.createElementNS(svgNS,'feFuncA');
                 feFunc.setAttribute('type','table');
                 feFunc.setAttribute('tableValues','1.0 0.0');
                 feCTr.appendChild(feFunc);*/
                this.globalData.defs.appendChild(fil);
                var alphaRect = document.createElementNS(svgNS,'rect');
                alphaRect.setAttribute('width',this.comp.data ? this.comp.data.w : this.globalData.compSize.w);
                alphaRect.setAttribute('height',this.comp.data ? this.comp.data.h : this.globalData.compSize.h);
                alphaRect.setAttribute('x','0');
                alphaRect.setAttribute('y','0');
                alphaRect.setAttribute('fill','#ffffff');
                alphaRect.setAttribute('opacity','0');
                maskGrouper.setAttribute('filter','url(#'+filId+')');
                maskGrouper.appendChild(alphaRect);
                maskGrouper.appendChild(this.layerElement);
                layerElementParent = maskGrouper;
                if(!featureSupport.maskType){
                    maskGroup.setAttribute('mask-type','luminance');
                    fil.appendChild(filtersFactory.createAlphaToLuminanceFilter());
                    var gg = document.createElementNS(svgNS,'g');
                    maskGrouper.appendChild(alphaRect);
                    gg.appendChild(this.layerElement);
                    layerElementParent = gg;
                    maskGrouper.appendChild(gg);
                }
                this.globalData.defs.appendChild(maskGroup);
            }
        }else if(this.data.hasMask || this.data.tt){
            if(this.data.tt){
                this.matteElement = document.createElementNS(svgNS,'g');
                this.matteElement.appendChild(this.layerElement);
                layerElementParent = this.matteElement;
                this.baseElement = this.matteElement;
            }else{
                this.baseElement = this.layerElement;
            }
        }else{
            this.baseElement = this.layerElement;
        }
        if((this.data.ln || this.data.cl) && (this.data.ty === 4 || this.data.ty === 0)){
            if(this.data.ln){
                this.layerElement.setAttribute('id',this.data.ln);
            }
            if(this.data.cl){
                this.layerElement.setAttribute('class',this.data.cl);
            }
        }
        if(this.data.ty === 0){
            var cp = document.createElementNS(svgNS, 'clipPath');
            var pt = document.createElementNS(svgNS,'path');
            pt.setAttribute('d','M0,0 L'+this.data.w+',0'+' L'+this.data.w+','+this.data.h+' L0,'+this.data.h+'z');
            var clipId = 'cp_'+randomString(8);
            cp.setAttribute('id',clipId);
            cp.appendChild(pt);
            this.globalData.defs.appendChild(cp);
            if(this.checkMasks()){
                var cpGroup = document.createElementNS(svgNS,'g');
                cpGroup.setAttribute('clip-path','url(#'+clipId+')');
                cpGroup.appendChild(this.layerElement);
                this.transformedElement = cpGroup;
                if(layerElementParent){
                    layerElementParent.appendChild(this.transformedElement);
                } else {
                    this.baseElement = this.transformedElement;
                }
            } else {
                this.layerElement.setAttribute('clip-path','url(#'+clipId+')');
            }

        }
        if(this.data.bm !== 0){
            this.setBlendMode();
        }
        if(this.layerElement !== this.parentContainer){
            this.placeholder = null;
        }
        /* Todo performance killer
         if(this.data.sy){
         var filterID = 'st_'+randomString(10);
         var c = this.data.sy[0].c.k;
         var r = this.data.sy[0].s.k;
         var expansor = document.createElementNS(svgNS,'filter');
         expansor.setAttribute('id',filterID);
         var feFlood = document.createElementNS(svgNS,'feFlood');
         this.feFlood = feFlood;
         if(!c[0].e){
         feFlood.setAttribute('flood-color','rgb('+c[0]+','+c[1]+','+c[2]+')');
         }
         feFlood.setAttribute('result','base');
         expansor.appendChild(feFlood);
         var feMorph = document.createElementNS(svgNS,'feMorphology');
         feMorph.setAttribute('operator','dilate');
         feMorph.setAttribute('in','SourceGraphic');
         feMorph.setAttribute('result','bigger');
         this.feMorph = feMorph;
         if(!r.length){
         feMorph.setAttribute('radius',this.data.sy[0].s.k);
         }
         expansor.appendChild(feMorph);
         var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
         feColorMatrix.setAttribute('result','mask');
         feColorMatrix.setAttribute('in','bigger');
         feColorMatrix.setAttribute('type','matrix');
         feColorMatrix.setAttribute('values','0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0');
         expansor.appendChild(feColorMatrix);
         var feComposite = document.createElementNS(svgNS,'feComposite');
         feComposite.setAttribute('result','drop');
         feComposite.setAttribute('in','base');
         feComposite.setAttribute('in2','mask');
         feComposite.setAttribute('operator','in');
         expansor.appendChild(feComposite);
         var feBlend = document.createElementNS(svgNS,'feBlend');
         feBlend.setAttribute('in','SourceGraphic');
         feBlend.setAttribute('in2','drop');
         feBlend.setAttribute('mode','normal');
         expansor.appendChild(feBlend);
         this.globalData.defs.appendChild(expansor);
         var cont = document.createElementNS(svgNS,'g');
         if(this.layerElement === this.parentContainer){
         this.layerElement = cont;
         }else{
         cont.appendChild(this.layerElement);
         }
         cont.setAttribute('filter','url(#'+filterID+')');
         if(this.data.td){
         cont.setAttribute('data-td',this.data.td);
         }
         if(this.data.td == 3){
         this.globalData.defs.appendChild(cont);
         }else if(this.data.td == 2){
         maskGrouper.appendChild(cont);
         }else if(this.data.td == 1){
         masker.appendChild(cont);
         }else{
         if(this.data.hasMask && this.data.tt){
         this.matteElement.appendChild(cont);
         }else{
         this.appendNodeToParent(cont);
         }
         }
         }*/
        if(this.data.ef){
            this.effectsManager = new SVGEffects(this);
        }
        this.checkParenting();
    };


    SVGBaseElement.prototype.setBlendMode = BaseElement.prototype.setBlendMode;

    SVGBaseElement.prototype.renderFrame = function(parentTransform){
        if(this.data.ty === 3 || this.data.hd){
            return false;
        }

        if(!this.isVisible){
            return this.isVisible;
        }
        this.lastNum = this.currentFrameNum;
        this.finalTransform.opMdf = this.finalTransform.op.mdf;
        this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
        this.finalTransform.opacity = this.finalTransform.op.v;
        if(this.firstFrame){
            this.finalTransform.opMdf = true;
            this.finalTransform.matMdf = true;
        }

        var mat;
        var finalMat = this.finalTransform.mat;

        if(this.hierarchy){
            var i, len = this.hierarchy.length;

            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
            for(i=0;i<len;i+=1){
                this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
                mat = this.hierarchy[i].finalTransform.mProp.v.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            }
        }else{
            if(this.isVisible){
                finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
            }
        }
        if(parentTransform){
            mat = parentTransform.mat.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            this.finalTransform.opacity *= parentTransform.opacity;
            this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
            this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf;
        }
        if(this.finalTransform.matMdf && this.layerElement){
            this.transformedElement.setAttribute('transform',finalMat.to2dCSS());
        }
        if(this.finalTransform.opMdf && this.layerElement){
            this.transformedElement.setAttribute('opacity',this.finalTransform.opacity);
        }

        if(this.data.hasMask){
            this.maskManager.renderFrame(finalMat);
        }
        if(this.effectsManager){
            this.effectsManager.renderFrame(this.firstFrame);
        }
        return this.isVisible;
    };

    SVGBaseElement.prototype.destroy = function(){
        this.layerElement = null;
        this.parentContainer = null;
        if(this.matteElement) {
            this.matteElement = null;
        }
        if(this.maskManager) {
            this.maskManager.destroy();
        }
    };

    SVGBaseElement.prototype.getBaseElement = function(){
        return this.baseElement;
    };
    SVGBaseElement.prototype.addMasks = function(data){
        this.maskManager = new MaskElement(data,this,this.globalData);
    };

    SVGBaseElement.prototype.setMatte = function(id){
        if(!this.matteElement){
            return;
        }
        this.matteElement.setAttribute("mask", "url(#" + id + ")");
    };

    SVGBaseElement.prototype.setMatte = function(id){
        if(!this.matteElement){
            return;
        }
        this.matteElement.setAttribute("mask", "url(#" + id + ")");
    };

    SVGBaseElement.prototype.hide = function(){

    };

    function ITextElement(data, animationItem,parentContainer,globalData){
    }
    ITextElement.prototype.init = function(){
        this._parent.init.call(this);

        this.lettersChangedFlag = false;
        this.currentTextDocumentData = {};
        var data = this.data;
        this.viewData = {
            m:{
                a: PropertyFactory.getProp(this,data.t.m.a,1,0,this.dynamicProperties)
            }
        };
        var textData = this.data.t;
        if(textData.a.length){
            this.viewData.a = Array.apply(null,{length:textData.a.length});
            var i, len = textData.a.length, animatorData, animatorProps;
            for(i=0;i<len;i+=1){
                animatorProps = textData.a[i];
                animatorData = {
                    a: {},
                    s: {}
                };
                if('r' in animatorProps.a) {
                    animatorData.a.r = PropertyFactory.getProp(this,animatorProps.a.r,0,degToRads,this.dynamicProperties);
                }
                if('rx' in animatorProps.a) {
                    animatorData.a.rx = PropertyFactory.getProp(this,animatorProps.a.rx,0,degToRads,this.dynamicProperties);
                }
                if('ry' in animatorProps.a) {
                    animatorData.a.ry = PropertyFactory.getProp(this,animatorProps.a.ry,0,degToRads,this.dynamicProperties);
                }
                if('sk' in animatorProps.a) {
                    animatorData.a.sk = PropertyFactory.getProp(this,animatorProps.a.sk,0,degToRads,this.dynamicProperties);
                }
                if('sa' in animatorProps.a) {
                    animatorData.a.sa = PropertyFactory.getProp(this,animatorProps.a.sa,0,degToRads,this.dynamicProperties);
                }
                if('s' in animatorProps.a) {
                    animatorData.a.s = PropertyFactory.getProp(this,animatorProps.a.s,1,0.01,this.dynamicProperties);
                }
                if('a' in animatorProps.a) {
                    animatorData.a.a = PropertyFactory.getProp(this,animatorProps.a.a,1,0,this.dynamicProperties);
                }
                if('o' in animatorProps.a) {
                    animatorData.a.o = PropertyFactory.getProp(this,animatorProps.a.o,0,0.01,this.dynamicProperties);
                }
                if('p' in animatorProps.a) {
                    animatorData.a.p = PropertyFactory.getProp(this,animatorProps.a.p,1,0,this.dynamicProperties);
                }
                if('sw' in animatorProps.a) {
                    animatorData.a.sw = PropertyFactory.getProp(this,animatorProps.a.sw,0,0,this.dynamicProperties);
                }
                if('sc' in animatorProps.a) {
                    animatorData.a.sc = PropertyFactory.getProp(this,animatorProps.a.sc,1,0,this.dynamicProperties);
                }
                if('fc' in animatorProps.a) {
                    animatorData.a.fc = PropertyFactory.getProp(this,animatorProps.a.fc,1,0,this.dynamicProperties);
                }
                if('fh' in animatorProps.a) {
                    animatorData.a.fh = PropertyFactory.getProp(this,animatorProps.a.fh,0,0,this.dynamicProperties);
                }
                if('fs' in animatorProps.a) {
                    animatorData.a.fs = PropertyFactory.getProp(this,animatorProps.a.fs,0,0.01,this.dynamicProperties);
                }
                if('fb' in animatorProps.a) {
                    animatorData.a.fb = PropertyFactory.getProp(this,animatorProps.a.fb,0,0.01,this.dynamicProperties);
                }
                if('t' in animatorProps.a) {
                    animatorData.a.t = PropertyFactory.getProp(this,animatorProps.a.t,0,0,this.dynamicProperties);
                }
                animatorData.s = PropertyFactory.getTextSelectorProp(this,animatorProps.s,this.dynamicProperties);
                animatorData.s.t = animatorProps.s.t;
                this.viewData.a[i] = animatorData;
            }
        }else{
            this.viewData.a = [];
        }
        if(textData.p && 'm' in textData.p){
            this.viewData.p = {
                f: PropertyFactory.getProp(this,textData.p.f,0,0,this.dynamicProperties),
                l: PropertyFactory.getProp(this,textData.p.l,0,0,this.dynamicProperties),
                r: textData.p.r,
                m: this.maskManager.getMaskProperty(textData.p.m)
            };
            this.maskPath = true;
        } else {
            this.maskPath = false;
        }
    };
    ITextElement.prototype.prepareFrame = function(num) {
        var i = 0, len = this.data.t.d.k.length;
        var textDocumentData = this.data.t.d.k[i].s;
        i += 1;
        while(i<len){
            if(this.data.t.d.k[i].t > num){
                break;
            }
            textDocumentData = this.data.t.d.k[i].s;
            i += 1;
        }
        this.lettersChangedFlag = false;
        if(textDocumentData !== this.currentTextDocumentData){
            this.currentTextDocumentData = textDocumentData;
            this.lettersChangedFlag = true;
            this.buildNewText();
        }
        this._parent.prepareFrame.call(this, num);
    }

    ITextElement.prototype.createPathShape = function(matrixHelper, shapes) {
        var j,jLen = shapes.length;
        var k, kLen, pathNodes;
        var shapeStr = '';
        for(j=0;j<jLen;j+=1){
            kLen = shapes[j].ks.k.i.length;
            pathNodes = shapes[j].ks.k;
            for(k=1;k<kLen;k+=1){
                if(k==1){
                    shapeStr += " M"+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
                }
                shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[k][0],pathNodes.i[k][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[k][0],pathNodes.v[k][1]);
            }
            shapeStr += " C"+matrixHelper.applyToPointStringified(pathNodes.o[k-1][0],pathNodes.o[k-1][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.i[0][0],pathNodes.i[0][1]) + " "+matrixHelper.applyToPointStringified(pathNodes.v[0][0],pathNodes.v[0][1]);
            shapeStr += 'z';
        }
        return shapeStr;
    };

    ITextElement.prototype.getMeasures = function(){

        var matrixHelper = this.mHelper;
        var renderType = this.renderType;
        var data = this.data;
        var xPos,yPos;
        var i, len;
        var documentData = this.currentTextDocumentData;
        var letters = documentData.l;
        if(this.maskPath) {
            var mask = this.viewData.p.m;
            if(!this.viewData.p.n || this.viewData.p.mdf){
                var paths = mask.v;
                if(this.viewData.p.r){
                    paths = reversePath(paths);
                }
                var pathInfo = {
                    tLength: 0,
                    segments: []
                };
                len = paths.v.length - 1;
                var pathData;
                var totalLength = 0;
                for (i = 0; i < len; i += 1) {
                    pathData = {
                        s: paths.v[i],
                        e: paths.v[i + 1],
                        to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                        ti: [paths.i[i + 1][0] - paths.v[i + 1][0], paths.i[i + 1][1] - paths.v[i + 1][1]]
                    };
                    bez.buildBezierData(pathData);
                    pathInfo.tLength += pathData.bezierData.segmentLength;
                    pathInfo.segments.push(pathData);
                    totalLength += pathData.bezierData.segmentLength;
                }
                i = len;
                if (mask.v.c) {
                    pathData = {
                        s: paths.v[i],
                        e: paths.v[0],
                        to: [paths.o[i][0] - paths.v[i][0], paths.o[i][1] - paths.v[i][1]],
                        ti: [paths.i[0][0] - paths.v[0][0], paths.i[0][1] - paths.v[0][1]]
                    };
                    bez.buildBezierData(pathData);
                    pathInfo.tLength += pathData.bezierData.segmentLength;
                    pathInfo.segments.push(pathData);
                    totalLength += pathData.bezierData.segmentLength;
                }
                this.viewData.p.pi = pathInfo;
            }
            var pathInfo = this.viewData.p.pi;

            var currentLength = this.viewData.p.f.v, segmentInd = 0, pointInd = 1, currentPoint, prevPoint, points;
            var segmentLength = 0, flag = true;
            var segments = pathInfo.segments;
            if (currentLength < 0 && mask.v.c) {
                if (pathInfo.tLength < Math.abs(currentLength)) {
                    currentLength = -Math.abs(currentLength) % pathInfo.tLength;
                }
                segmentInd = segments.length - 1;
                points = segments[segmentInd].bezierData.points;
                pointInd = points.length - 1;
                while (currentLength < 0) {
                    currentLength += points[pointInd].partialLength;
                    pointInd -= 1;
                    if (pointInd < 0) {
                        segmentInd -= 1;
                        points = segments[segmentInd].bezierData.points;
                        pointInd = points.length - 1;
                    }
                }

            }
            points = segments[segmentInd].bezierData.points;
            prevPoint = points[pointInd - 1];
            currentPoint = points[pointInd];
            var partialLength = currentPoint.partialLength;
            var perc, tanAngle;
        }


        len = letters.length;
        xPos = 0;
        yPos = 0;
        var yOff = documentData.s*1.2*.714;
        var firstLine = true;
        var renderedData = this.viewData, animatorProps, animatorSelector;
        var j, jLen;
        var lettersValue = Array.apply(null,{length:len}), letterValue;

        jLen = renderedData.a.length;
        var lastLetter;

        var mult, ind = -1, offf, xPathPos, yPathPos;
        var initPathPos = currentLength,initSegmentInd = segmentInd, initPointInd = pointInd, currentLine = -1;
        var elemOpacity;
        var sc,sw,fc,k;
        var lineLength = 0;
        var letterSw,letterSc,letterFc,letterM,letterP,letterO;
        for( i = 0; i < len; i += 1) {
            matrixHelper.reset();
            elemOpacity = 1;
            if(letters[i].n) {
                xPos = 0;
                yPos += documentData.yOffset;
                yPos += firstLine ? 1 : 0;
                currentLength = initPathPos ;
                firstLine = false;
                lineLength = 0;
                if(this.maskPath) {
                    segmentInd = initSegmentInd;
                    pointInd = initPointInd;
                    points = segments[segmentInd].bezierData.points;
                    prevPoint = points[pointInd - 1];
                    currentPoint = points[pointInd];
                    partialLength = currentPoint.partialLength;
                    segmentLength = 0;
                }
                lettersValue[i] = this.emptyProp;
            }else{
                if(this.maskPath) {
                    if(currentLine !== letters[i].line){
                        switch(documentData.j){
                            case 1:
                                currentLength += totalLength - documentData.lineWidths[letters[i].line];
                                break;
                            case 2:
                                currentLength += (totalLength - documentData.lineWidths[letters[i].line])/2;
                                break;
                        }
                        currentLine = letters[i].line;
                    }
                    if (ind !== letters[i].ind) {
                        if (letters[ind]) {
                            currentLength += letters[ind].extra;
                        }
                        currentLength += letters[i].an / 2;
                        ind = letters[i].ind;
                    }
                    currentLength += renderedData.m.a.v[0] * letters[i].an / 200;
                    var animatorOffset = 0;
                    for (j = 0; j < jLen; j += 1) {
                        animatorProps = renderedData.a[j].a;
                        if ('p' in animatorProps) {
                            animatorSelector = renderedData.a[j].s;
                            mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);
                            if(mult.length){
                                animatorOffset += animatorProps.p.v[0] * mult[0];
                            } else{
                                animatorOffset += animatorProps.p.v[0] * mult;
                            }

                        }
                    }
                    flag = true;
                    while (flag) {
                        if (segmentLength + partialLength >= currentLength + animatorOffset || !points) {
                            perc = (currentLength + animatorOffset - segmentLength) / currentPoint.partialLength;
                            xPathPos = prevPoint.point[0] + (currentPoint.point[0] - prevPoint.point[0]) * perc;
                            yPathPos = prevPoint.point[1] + (currentPoint.point[1] - prevPoint.point[1]) * perc;
                            matrixHelper.translate(0, -(renderedData.m.a.v[1] * yOff / 100) + yPos);
                            flag = false;
                        } else if (points) {
                            segmentLength += currentPoint.partialLength;
                            pointInd += 1;
                            if (pointInd >= points.length) {
                                pointInd = 0;
                                segmentInd += 1;
                                if (!segments[segmentInd]) {
                                    if (mask.v.c) {
                                        pointInd = 0;
                                        segmentInd = 0;
                                        points = segments[segmentInd].bezierData.points;
                                    } else {
                                        segmentLength -= currentPoint.partialLength;
                                        points = null;
                                    }
                                } else {
                                    points = segments[segmentInd].bezierData.points;
                                }
                            }
                            if (points) {
                                prevPoint = currentPoint;
                                currentPoint = points[pointInd];
                                partialLength = currentPoint.partialLength;
                            }
                        }
                    }
                    offf = letters[i].an / 2 - letters[i].add;
                    matrixHelper.translate(-offf, 0, 0);
                } else {
                    offf = letters[i].an/2 - letters[i].add;
                    matrixHelper.translate(-offf,0,0);

                    // Grouping alignment
                    matrixHelper.translate(-renderedData.m.a.v[0]*letters[i].an/200, -renderedData.m.a.v[1]*yOff/100, 0);
                }

                lineLength += letters[i].l/2;
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('t' in animatorProps) {
                        animatorSelector = renderedData.a[j].s;
                        mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);
                        if(this.maskPath) {
                            if(mult.length) {
                                currentLength += animatorProps.t*mult[0];
                            } else {
                                currentLength += animatorProps.t*mult;
                            }
                        }else{
                            if(mult.length) {
                                xPos += animatorProps.t.v*mult[0];
                            } else {
                                xPos += animatorProps.t.v*mult;
                            }
                        }
                    }
                }
                lineLength += letters[i].l/2;
                if(documentData.strokeWidthAnim) {
                    sw = documentData.sw || 0;
                }
                if(documentData.strokeColorAnim) {
                    if(documentData.sc){
                        sc = [documentData.sc[0], documentData.sc[1], documentData.sc[2]];
                    }else{
                        sc = [0,0,0];
                    }
                }
                if(documentData.fillColorAnim) {
                    fc = [documentData.fc[0], documentData.fc[1], documentData.fc[2]];
                }
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('a' in animatorProps) {
                        animatorSelector = renderedData.a[j].s;
                        mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);

                        if(mult.length){
                            matrixHelper.translate(-animatorProps.a.v[0]*mult[0], -animatorProps.a.v[1]*mult[1], animatorProps.a.v[2]*mult[2]);
                        } else {
                            matrixHelper.translate(-animatorProps.a.v[0]*mult, -animatorProps.a.v[1]*mult, animatorProps.a.v[2]*mult);
                        }
                    }
                }
                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;
                    if ('s' in animatorProps) {
                        animatorSelector = renderedData.a[j].s;
                        mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);
                        if(mult.length){
                            matrixHelper.scale(1+((animatorProps.s.v[0]-1)*mult[0]),1+((animatorProps.s.v[1]-1)*mult[1]),1);
                        } else {
                            matrixHelper.scale(1+((animatorProps.s.v[0]-1)*mult),1+((animatorProps.s.v[1]-1)*mult),1);
                        }
                    }
                }
                for(j=0;j<jLen;j+=1) {
                    animatorProps = renderedData.a[j].a;
                    animatorSelector = renderedData.a[j].s;
                    mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);
                    if ('sk' in animatorProps) {
                        if(mult.length) {
                            matrixHelper.skewFromAxis(-animatorProps.sk.v * mult[0], animatorProps.sa.v * mult[1]);
                        } else {
                            matrixHelper.skewFromAxis(-animatorProps.sk.v * mult, animatorProps.sa.v * mult);
                        }
                    }
                    if ('r' in animatorProps) {
                        if(mult.length) {
                            matrixHelper.rotateZ(-animatorProps.r.v * mult[2]);
                        } else {
                            matrixHelper.rotateZ(-animatorProps.r.v * mult);
                        }
                    }
                    if ('ry' in animatorProps) {

                        if(mult.length) {
                            matrixHelper.rotateY(animatorProps.ry.v*mult[1]);
                        }else{
                            matrixHelper.rotateY(animatorProps.ry.v*mult);
                        }
                    }
                    if ('rx' in animatorProps) {
                        if(mult.length) {
                            matrixHelper.rotateX(animatorProps.rx.v*mult[0]);
                        } else {
                            matrixHelper.rotateX(animatorProps.rx.v*mult);
                        }
                    }
                    if ('o' in animatorProps) {
                        if(mult.length) {
                            elemOpacity += ((animatorProps.o.v)*mult[0] - elemOpacity)*mult[0];
                        } else {
                            elemOpacity += ((animatorProps.o.v)*mult - elemOpacity)*mult;
                        }
                    }
                    if (documentData.strokeWidthAnim && 'sw' in animatorProps) {
                        if(mult.length) {
                            sw += animatorProps.sw.v*mult[0];
                        } else {
                            sw += animatorProps.sw.v*mult;
                        }
                    }
                    if (documentData.strokeColorAnim && 'sc' in animatorProps) {
                        for(k=0;k<3;k+=1){
                            if(mult.length) {
                                sc[k] = Math.round(255*(sc[k] + (animatorProps.sc.v[k] - sc[k])*mult[0]));
                            } else {
                                sc[k] = Math.round(255*(sc[k] + (animatorProps.sc.v[k] - sc[k])*mult));
                            }
                        }
                    }
                    if (documentData.fillColorAnim) {
                        if('fc' in animatorProps){
                            for(k=0;k<3;k+=1){
                                if(mult.length) {
                                    fc[k] = fc[k] + (animatorProps.fc.v[k] - fc[k])*mult[0];
                                } else {
                                    fc[k] = fc[k] + (animatorProps.fc.v[k] - fc[k])*mult;
                                    //console.log('mult',mult);
                                    //console.log(Math.round(fc[k] + (animatorProps.fc.v[k] - fc[k])*mult));
                                }
                            }
                        }
                        if('fh' in animatorProps){
                            if(mult.length) {
                                fc = addHueToRGB(fc,animatorProps.fh.v*mult[0]);
                            } else {
                                fc = addHueToRGB(fc,animatorProps.fh.v*mult);
                            }
                        }
                        if('fs' in animatorProps){
                            if(mult.length) {
                                fc = addSaturationToRGB(fc,animatorProps.fs.v*mult[0]);
                            } else {
                                fc = addSaturationToRGB(fc,animatorProps.fs.v*mult);
                            }
                        }
                        if('fb' in animatorProps){
                            if(mult.length) {
                                fc = addBrightnessToRGB(fc,animatorProps.fb.v*mult[0]);
                            } else {
                                fc = addBrightnessToRGB(fc,animatorProps.fb.v*mult);
                            }
                        }
                    }
                }

                for(j=0;j<jLen;j+=1){
                    animatorProps = renderedData.a[j].a;

                    if ('p' in animatorProps) {
                        animatorSelector = renderedData.a[j].s;
                        mult = animatorSelector.getMult(letters[i].anIndexes[j],data.t.a[j].s.totalChars);
                        if(this.maskPath) {
                            if(mult.length) {
                                matrixHelper.translate(0, animatorProps.p.v[1] * mult[0], -animatorProps.p.v[2] * mult[1]);
                            } else {
                                matrixHelper.translate(0, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
                            }
                        }else{

                            if(mult.length) {
                                matrixHelper.translate(animatorProps.p.v[0] * mult[0], animatorProps.p.v[1] * mult[1], -animatorProps.p.v[2] * mult[2]);
                            } else {
                                matrixHelper.translate(animatorProps.p.v[0] * mult, animatorProps.p.v[1] * mult, -animatorProps.p.v[2] * mult);
                            }
                        }
                    }
                }
                if(documentData.strokeWidthAnim){
                    letterSw = sw < 0 ? 0 : sw;
                }
                if(documentData.strokeColorAnim){
                    letterSc = 'rgb('+Math.round(sc[0]*255)+','+Math.round(sc[1]*255)+','+Math.round(sc[2]*255)+')';
                }
                if(documentData.fillColorAnim){
                    letterFc = 'rgb('+Math.round(fc[0]*255)+','+Math.round(fc[1]*255)+','+Math.round(fc[2]*255)+')';
                }

                if(this.maskPath) {
                    if (data.t.p.p) {
                        tanAngle = (currentPoint.point[1] - prevPoint.point[1]) / (currentPoint.point[0] - prevPoint.point[0]);
                        var rot = Math.atan(tanAngle) * 180 / Math.PI;
                        if (currentPoint.point[0] < prevPoint.point[0]) {
                            rot += 180;
                        }
                        matrixHelper.rotate(-rot * Math.PI / 180);
                    }
                    matrixHelper.translate(xPathPos, yPathPos, 0);
                    matrixHelper.translate(renderedData.m.a.v[0]*letters[i].an/200, renderedData.m.a.v[1]*yOff/100,0);
                    currentLength -= renderedData.m.a.v[0]*letters[i].an/200;
                    if(letters[i+1] && ind !== letters[i+1].ind){
                        currentLength += letters[i].an / 2;
                        currentLength += documentData.tr/1000*documentData.s;
                    }
                }else{

                    matrixHelper.translate(xPos,yPos,0);

                    if(documentData.ps){
                        //matrixHelper.translate(documentData.ps[0],documentData.ps[1],0);
                        matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
                    }
                    switch(documentData.j){
                        case 1:
                            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line]),0,0);
                            break;
                        case 2:
                            matrixHelper.translate(documentData.justifyOffset + (documentData.boxWidth - documentData.lineWidths[letters[i].line])/2,0,0);
                            break;
                    }
                    matrixHelper.translate(offf,0,0);
                    matrixHelper.translate(renderedData.m.a.v[0]*letters[i].an/200,renderedData.m.a.v[1]*yOff/100,0);
                    xPos += letters[i].l + documentData.tr/1000*documentData.s;
                }
                if(renderType === 'html'){
                    letterM = matrixHelper.toCSS();
                }else if(renderType === 'svg'){
                    letterM = matrixHelper.to2dCSS();
                }else{
                    letterP = [matrixHelper.props[0],matrixHelper.props[1],matrixHelper.props[2],matrixHelper.props[3],matrixHelper.props[4],matrixHelper.props[5],matrixHelper.props[6],matrixHelper.props[7],matrixHelper.props[8],matrixHelper.props[9],matrixHelper.props[10],matrixHelper.props[11],matrixHelper.props[12],matrixHelper.props[13],matrixHelper.props[14],matrixHelper.props[15]];
                }
                letterO = elemOpacity;

                lastLetter = this.renderedLetters[i];
                if(lastLetter && (lastLetter.o !== letterO || lastLetter.sw !== letterSw || lastLetter.sc !== letterSc || lastLetter.fc !== letterFc)){
                    this.lettersChangedFlag = true;
                    letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM,letterP);
                }else{
                    if((renderType === 'svg' || renderType === 'html') && (!lastLetter || lastLetter.m !== letterM)){
                        this.lettersChangedFlag = true;
                        letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,letterM);
                    }else if(renderType === 'canvas' && (!lastLetter || (lastLetter.props[0] !== letterP[0] || lastLetter.props[1] !== letterP[1] || lastLetter.props[4] !== letterP[4] || lastLetter.props[5] !== letterP[5] || lastLetter.props[12] !== letterP[12] || lastLetter.props[13] !== letterP[13]))){
                        this.lettersChangedFlag = true;
                        letterValue = new LetterProps(letterO,letterSw,letterSc,letterFc,null,letterP);
                    } else {
                        letterValue = lastLetter;
                    }
                }
                this.renderedLetters[i] = letterValue;
            }
        }
    };

    ITextElement.prototype.emptyProp = new LetterProps();

    function SVGTextElement(data,parentContainer,globalData,comp, placeholder){
        this.textSpans = [];
        this.renderType = 'svg';
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    }
    createElement(SVGBaseElement, SVGTextElement);

    SVGTextElement.prototype.init = ITextElement.prototype.init;
    SVGTextElement.prototype.createPathShape = ITextElement.prototype.createPathShape;
    SVGTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
    SVGTextElement.prototype.prepareFrame = ITextElement.prototype.prepareFrame;

    SVGTextElement.prototype.createElements = function(){

        this._parent.createElements.call(this);


        if(this.data.ln){
            this.layerElement.setAttribute('id',this.data.ln);
        }
        if(this.data.cl){
            this.layerElement.setAttribute('class',this.data.cl);
        }
    };

    SVGTextElement.prototype.buildNewText = function(){
        var i, len;

        var documentData = this.currentTextDocumentData;
        this.renderedLetters = Array.apply(null,{length:this.currentTextDocumentData.l ? this.currentTextDocumentData.l.length : 0});
        if(documentData.fc) {
            this.layerElement.setAttribute('fill', 'rgb(' + Math.round(documentData.fc[0]*255) + ',' + Math.round(documentData.fc[1]*255) + ',' + Math.round(documentData.fc[2]*255) + ')');
        }else{
            this.layerElement.setAttribute('fill', 'rgba(0,0,0,0)');
        }
        if(documentData.sc){
            this.layerElement.setAttribute('stroke', 'rgb(' + Math.round(documentData.sc[0]*255) + ',' + Math.round(documentData.sc[1]*255) + ',' + Math.round(documentData.sc[2]*255) + ')');
            this.layerElement.setAttribute('stroke-width', documentData.sw);
        }
        this.layerElement.setAttribute('font-size', documentData.s);
        var fontData = this.globalData.fontManager.getFontByName(documentData.f);
        if(fontData.fClass){
            this.layerElement.setAttribute('class',fontData.fClass);
        } else {
            this.layerElement.setAttribute('font-family', fontData.fFamily);
            var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
            this.layerElement.setAttribute('font-style', fStyle);
            this.layerElement.setAttribute('font-weight', fWeight);
        }



        var letters = documentData.l || [];
        len = letters.length;
        if(!len){
            return;
        }
        var tSpan;
        var matrixHelper = this.mHelper;
        var shapes, shapeStr = '', singleShape = this.data.singleShape;
        if (singleShape) {
            var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
        }
        var cnt = 0;
        for (i = 0;i < len ;i += 1) {
            if(this.globalData.fontManager.chars){
                if(!singleShape || i === 0){
                    tSpan = this.textSpans[cnt] ? this.textSpans[cnt] : document.createElementNS(svgNS,'path');
                }
            }else{
                tSpan = this.textSpans[cnt] ? this.textSpans[cnt] : document.createElementNS(svgNS,'text');
            }
            tSpan.style.display = 'inherit';
            tSpan.setAttribute('stroke-linecap', 'butt');
            tSpan.setAttribute('stroke-linejoin','round');
            tSpan.setAttribute('stroke-miterlimit','4');
            //tSpan.setAttribute('visibility', 'hidden');
            if(singleShape && letters[i].n) {
                xPos = 0;
                yPos += documentData.yOffset;
                yPos += firstLine ? 1 : 0;
                firstLine = false;
            }
            matrixHelper.reset();
            if(this.globalData.fontManager.chars) {
                matrixHelper.scale(documentData.s / 100, documentData.s / 100);
            }
            if (singleShape) {
                if(documentData.ps){
                    matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
                }
                switch(documentData.j){
                    case 1:
                        matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0,0);
                        break;
                    case 2:
                        matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0,0);
                        break;
                }
                matrixHelper.translate(xPos, yPos, 0);
            }
            if(this.globalData.fontManager.chars){
                var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
                var shapeData;
                if(charData){
                    shapeData = charData.data;
                } else {
                    shapeData = null;
                }
                if(shapeData && shapeData.shapes){
                    shapes = shapeData.shapes[0].it;
                    if(!singleShape){
                        shapeStr = '';
                    }
                    shapeStr += this.createPathShape(matrixHelper,shapes);
                    if(!singleShape){

                        tSpan.setAttribute('d',shapeStr);
                    }
                }
                if(!singleShape){
                    this.layerElement.appendChild(tSpan);
                }
            }else{
                tSpan.textContent = letters[i].val;
                tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
                this.layerElement.appendChild(tSpan);
                if(singleShape){
                    tSpan.setAttribute('transform',matrixHelper.to2dCSS());
                }
            }
            if(singleShape) {
                xPos += letters[i].l;
                xPos += documentData.tr/1000*documentData.s;
            }
            //
            this.textSpans[cnt] = tSpan;
            cnt += 1;
        }
        if(!singleShape){
            while(cnt < this.textSpans.length){
                this.textSpans[cnt].style.display = 'none';
                cnt += 1;
            }
        }
        if(singleShape && this.globalData.fontManager.chars){
            tSpan.setAttribute('d',shapeStr);
            this.layerElement.appendChild(tSpan);
        }
    }

    SVGTextElement.prototype.hide = function(){
        if(!this.hidden){
            this.layerElement.style.display = 'none';
            this.hidden = true;
        }
    };

    SVGTextElement.prototype.renderFrame = function(parentMatrix){

        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        if(renderParent===false){
            this.hide();
            return;
        }
        if(this.hidden){
            this.hidden = false;
            this.layerElement.style.display = 'block';
        }

        if(this.data.singleShape){
            return;
        }
        this.getMeasures();
        if(!this.lettersChangedFlag){
            return;
        }
        var  i,len;
        var renderedLetters = this.renderedLetters;

        var letters = this.currentTextDocumentData.l;

        len = letters.length;
        var renderedLetter;
        for(i=0;i<len;i+=1){
            if(letters[i].n){
                continue;
            }
            renderedLetter = renderedLetters[i];
            this.textSpans[i].setAttribute('transform',renderedLetter.m);
            this.textSpans[i].setAttribute('opacity',renderedLetter.o);
            if(renderedLetter.sw){
                this.textSpans[i].setAttribute('stroke-width',renderedLetter.sw);
            }
            if(renderedLetter.sc){
                this.textSpans[i].setAttribute('stroke',renderedLetter.sc);
            }
            if(renderedLetter.fc){
                this.textSpans[i].setAttribute('fill',renderedLetter.fc);
            }
        }
        if(this.firstFrame) {
            this.firstFrame = false;
        }
    }


    SVGTextElement.prototype.destroy = function(){
        this._parent.destroy.call(this._parent);
    };
    function SVGTintFilter(filter, filterManager){
        this.filterManager = filterManager;
        var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('color-interpolation-filters','linearRGB');
        feColorMatrix.setAttribute('values','0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0');
        feColorMatrix.setAttribute('result','f1');
        filter.appendChild(feColorMatrix);
        feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
        feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
        feColorMatrix.setAttribute('result','f2');
        filter.appendChild(feColorMatrix);
        this.matrixFilter = feColorMatrix;
        if(filterManager.effectElements[2].p.v !== 100 || filterManager.effectElements[2].p.k){
            var feMerge = document.createElementNS(svgNS,'feMerge');
            filter.appendChild(feMerge);
            var feMergeNode;
            feMergeNode = document.createElementNS(svgNS,'feMergeNode');
            feMergeNode.setAttribute('in','SourceGraphic');
            feMerge.appendChild(feMergeNode);
            feMergeNode = document.createElementNS(svgNS,'feMergeNode');
            feMergeNode.setAttribute('in','f2');
            feMerge.appendChild(feMergeNode);
        }
    }

    SVGTintFilter.prototype.renderFrame = function(forceRender){
        if(forceRender || this.filterManager.mdf){
            var colorBlack = this.filterManager.effectElements[0].p.v;
            var colorWhite = this.filterManager.effectElements[1].p.v;
            var opacity = this.filterManager.effectElements[2].p.v/100;
            this.matrixFilter.setAttribute('values',(colorWhite[0]- colorBlack[0])+' 0 0 0 '+ colorBlack[0] +' '+ (colorWhite[1]- colorBlack[1]) +' 0 0 0 '+ colorBlack[1] +' '+ (colorWhite[2]- colorBlack[2]) +' 0 0 0 '+ colorBlack[2] +' 0 0 0 ' + opacity + ' 0');
        }
    };
    function SVGFillFilter(filter, filterManager){
        this.filterManager = filterManager;
        var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('color-interpolation-filters','sRGB');
        feColorMatrix.setAttribute('values','1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
        filter.appendChild(feColorMatrix);
        this.matrixFilter = feColorMatrix;
    }
    SVGFillFilter.prototype.renderFrame = function(forceRender){
        if(forceRender || this.filterManager.mdf){
            var color = this.filterManager.effectElements[2].p.v;
            var opacity = this.filterManager.effectElements[6].p.v;
            this.matrixFilter.setAttribute('values','0 0 0 0 '+color[0]+' 0 0 0 0 '+color[1]+' 0 0 0 0 '+color[2]+' 0 0 0 '+opacity+' 0');
        }
    };
    function SVGStrokeEffect(elem, filterManager){
        this.initialized = false;
        this.filterManager = filterManager;
        this.elem = elem;
        this.paths = [];
    }

    SVGStrokeEffect.prototype.initialize = function(){

        var elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
        var path,groupPath, i, len;
        if(this.filterManager.effectElements[1].p.v === 1){
            len = this.elem.maskManager.masksProperties.length;
            i = 0;
        } else {
            i = this.filterManager.effectElements[0].p.v - 1;
            len = i + 1;
        }
        groupPath = document.createElementNS(svgNS,'g');
        groupPath.setAttribute('fill','none');
        groupPath.setAttribute('stroke-linecap','round');
        groupPath.setAttribute('stroke-dashoffset',1);
        for(i;i<len;i+=1){
            path = document.createElementNS(svgNS,'path');
            groupPath.appendChild(path);
            this.paths.push({p:path,m:i});
        }
        if(this.filterManager.effectElements[10].p.v === 3){
            var mask = document.createElementNS(svgNS,'mask');
            var id = 'stms_' + randomString(10);
            mask.setAttribute('id',id);
            mask.setAttribute('mask-type','alpha');
            mask.appendChild(groupPath);
            this.elem.globalData.defs.appendChild(mask);
            var g = document.createElementNS(svgNS,'g');
            g.setAttribute('mask','url(#'+id+')');
            if(elemChildren[0]){
                g.appendChild(elemChildren[0]);
            }
            this.elem.layerElement.appendChild(g);
            this.masker = mask;
            groupPath.setAttribute('stroke','#fff');
        } else if(this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2){
            if(this.filterManager.effectElements[10].p.v === 2){
                var elemChildren = this.elem.layerElement.children || this.elem.layerElement.childNodes;
                while(elemChildren.length){
                    this.elem.layerElement.removeChild(elemChildren[0]);
                }
            }
            this.elem.layerElement.appendChild(groupPath);
            this.elem.layerElement.removeAttribute('mask');
            groupPath.setAttribute('stroke','#fff');
        }
        this.initialized = true;
        this.pathMasker = groupPath;
    }

    SVGStrokeEffect.prototype.renderFrame = function(forceRender){
        if(!this.initialized){
            this.initialize();
        }
        var i, len = this.paths.length;
        var mask, path;
        for(i=0;i<len;i+=1){
            mask = this.elem.maskManager.viewData[this.paths[i].m];
            path = this.paths[i].p;
            if(forceRender || this.filterManager.mdf || mask.prop.mdf){
                path.setAttribute('d',mask.lastPath);
            }
            if(forceRender || this.filterManager.effectElements[9].p.mdf || this.filterManager.effectElements[4].p.mdf || this.filterManager.effectElements[7].p.mdf || this.filterManager.effectElements[8].p.mdf || mask.prop.mdf){
                var dasharrayValue;
                if(this.filterManager.effectElements[7].p.v !== 0 || this.filterManager.effectElements[8].p.v !== 100){
                    var s = Math.min(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100;
                    var e = Math.max(this.filterManager.effectElements[7].p.v,this.filterManager.effectElements[8].p.v)/100;
                    var l = path.getTotalLength();
                    dasharrayValue = '0 0 0 ' + l*s + ' ';
                    var lineLength = l*(e-s);
                    var segment = 1+this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100;
                    var units = Math.floor(lineLength/segment);
                    var j;
                    for(j=0;j<units;j+=1){
                        dasharrayValue += '1 ' + this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100 + ' ';
                    }
                    dasharrayValue += '0 ' + l*10 + ' 0 0';
                } else {
                    dasharrayValue = '1 ' + this.filterManager.effectElements[4].p.v*2*this.filterManager.effectElements[9].p.v/100;
                }
                path.setAttribute('stroke-dasharray',dasharrayValue);
            }
        }
        if(forceRender || this.filterManager.effectElements[4].p.mdf){
            this.pathMasker.setAttribute('stroke-width',this.filterManager.effectElements[4].p.v*2);
        }

        if(forceRender || this.filterManager.effectElements[6].p.mdf){
            this.pathMasker.setAttribute('opacity',this.filterManager.effectElements[6].p.v);
        }
        if(this.filterManager.effectElements[10].p.v === 1 || this.filterManager.effectElements[10].p.v === 2){
            if(forceRender || this.filterManager.effectElements[3].p.mdf){
                var color = this.filterManager.effectElements[3].p.v;
                this.pathMasker.setAttribute('stroke','rgb('+bm_floor(color[0]*255)+','+bm_floor(color[1]*255)+','+bm_floor(color[2]*255)+')');
            }
        }
    };
    function SVGTritoneFilter(filter, filterManager){
        this.filterManager = filterManager;
        var feColorMatrix = document.createElementNS(svgNS,'feColorMatrix');
        feColorMatrix.setAttribute('type','matrix');
        feColorMatrix.setAttribute('color-interpolation-filters','linearRGB');
        feColorMatrix.setAttribute('values','0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0');
        feColorMatrix.setAttribute('result','f1');
        filter.appendChild(feColorMatrix);
        var feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
        feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
        filter.appendChild(feComponentTransfer);
        this.matrixFilter = feComponentTransfer;
        var feFuncR = document.createElementNS(svgNS,'feFuncR');
        feFuncR.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncR);
        this.feFuncR = feFuncR;
        var feFuncG = document.createElementNS(svgNS,'feFuncG');
        feFuncG.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncG);
        this.feFuncG = feFuncG;
        var feFuncB = document.createElementNS(svgNS,'feFuncB');
        feFuncB.setAttribute('type','table');
        feComponentTransfer.appendChild(feFuncB);
        this.feFuncB = feFuncB;
    }

    SVGTritoneFilter.prototype.renderFrame = function(forceRender){
        if(forceRender || this.filterManager.mdf){
            var color1 = this.filterManager.effectElements[0].p.v;
            var color2 = this.filterManager.effectElements[1].p.v;
            var color3 = this.filterManager.effectElements[2].p.v;
            var tableR = color3[0] + ' ' + color2[0] + ' ' + color1[0]
            var tableG = color3[1] + ' ' + color2[1] + ' ' + color1[1]
            var tableB = color3[2] + ' ' + color2[2] + ' ' + color1[2]
            this.feFuncR.setAttribute('tableValues', tableR);
            this.feFuncG.setAttribute('tableValues', tableG);
            this.feFuncB.setAttribute('tableValues', tableB);
            //var opacity = this.filterManager.effectElements[2].p.v/100;
            //this.matrixFilter.setAttribute('values',(colorWhite[0]- colorBlack[0])+' 0 0 0 '+ colorBlack[0] +' '+ (colorWhite[1]- colorBlack[1]) +' 0 0 0 '+ colorBlack[1] +' '+ (colorWhite[2]- colorBlack[2]) +' 0 0 0 '+ colorBlack[2] +' 0 0 0 ' + opacity + ' 0');
        }
    };
    function SVGProLevelsFilter(filter, filterManager){
        this.filterManager = filterManager;
        var effectElements = this.filterManager.effectElements;
        var feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
        var feFuncR, feFuncG, feFuncB;

        if(effectElements[9].p.k || effectElements[9].p.v !== 0 || effectElements[10].p.k || effectElements[10].p.v !== 1 || effectElements[11].p.k || effectElements[11].p.v !== 1 || effectElements[12].p.k || effectElements[12].p.v !== 0 || effectElements[13].p.k || effectElements[13].p.v !== 1){
            this.feFuncR = this.createFeFunc('feFuncR', feComponentTransfer);
        }
        if(effectElements[16].p.k || effectElements[16].p.v !== 0 || effectElements[17].p.k || effectElements[17].p.v !== 1 || effectElements[18].p.k || effectElements[18].p.v !== 1 || effectElements[19].p.k || effectElements[19].p.v !== 0 || effectElements[20].p.k || effectElements[20].p.v !== 1){
            this.feFuncG = this.createFeFunc('feFuncG', feComponentTransfer);
        }
        if(effectElements[23].p.k || effectElements[23].p.v !== 0 || effectElements[24].p.k || effectElements[24].p.v !== 1 || effectElements[25].p.k || effectElements[25].p.v !== 1 || effectElements[26].p.k || effectElements[26].p.v !== 0 || effectElements[27].p.k || effectElements[27].p.v !== 1){
            this.feFuncB = this.createFeFunc('feFuncB', feComponentTransfer);
        }
        if(effectElements[30].p.k || effectElements[30].p.v !== 0 || effectElements[31].p.k || effectElements[31].p.v !== 1 || effectElements[32].p.k || effectElements[32].p.v !== 1 || effectElements[33].p.k || effectElements[33].p.v !== 0 || effectElements[34].p.k || effectElements[34].p.v !== 1){
            this.feFuncA = this.createFeFunc('feFuncA', feComponentTransfer);
        }

        if(this.feFuncR || this.feFuncG || this.feFuncB || this.feFuncA){
            feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
            filter.appendChild(feComponentTransfer);
            feComponentTransfer = document.createElementNS(svgNS,'feComponentTransfer');
        }

        if(effectElements[2].p.k || effectElements[2].p.v !== 0 || effectElements[3].p.k || effectElements[3].p.v !== 1 || effectElements[4].p.k || effectElements[4].p.v !== 1 || effectElements[5].p.k || effectElements[5].p.v !== 0 || effectElements[6].p.k || effectElements[6].p.v !== 1){

            feComponentTransfer.setAttribute('color-interpolation-filters','sRGB');
            filter.appendChild(feComponentTransfer);
            this.feFuncRComposed = this.createFeFunc('feFuncR', feComponentTransfer);
            this.feFuncGComposed = this.createFeFunc('feFuncG', feComponentTransfer);
            this.feFuncBComposed = this.createFeFunc('feFuncB', feComponentTransfer);
        }
    }

    SVGProLevelsFilter.prototype.createFeFunc = function(type, feComponentTransfer) {
        var feFunc = document.createElementNS(svgNS,type);
        feFunc.setAttribute('type','table');
        feComponentTransfer.appendChild(feFunc);
        return feFunc;
    };

    SVGProLevelsFilter.prototype.getTableValue = function(inputBlack, inputWhite, gamma, outputBlack, outputWhite) {
        var cnt = 0;
        var segments = 256;
        var perc;
        var min = Math.min(inputBlack, inputWhite);
        var max = Math.max(inputBlack, inputWhite);
        var table = Array.call(null,{length:segments});
        var colorValue;
        var pos = 0;
        var outputDelta = outputWhite - outputBlack;
        var inputDelta = inputWhite - inputBlack;
        while(cnt <= 256) {
            perc = cnt/256;
            if(perc <= min){
                colorValue = inputDelta < 0 ? outputWhite : outputBlack;
            } else if(perc >= max){
                colorValue = inputDelta < 0 ? outputBlack : outputWhite;
            } else {
                colorValue = (outputBlack + outputDelta * Math.pow((perc - inputBlack) / inputDelta, 1 / gamma));
            }
            table[pos++] = colorValue;
            cnt += 256/(segments-1);
        }
        return table.join(' ');
    };

    SVGProLevelsFilter.prototype.renderFrame = function(forceRender){
        if(forceRender || this.filterManager.mdf){
            var val, cnt, perc, bezier;
            var effectElements = this.filterManager.effectElements;
            if(this.feFuncRComposed && (forceRender || effectElements[2].p.mdf || effectElements[3].p.mdf || effectElements[4].p.mdf || effectElements[5].p.mdf || effectElements[6].p.mdf)){
                val = this.getTableValue(effectElements[2].p.v,effectElements[3].p.v,effectElements[4].p.v,effectElements[5].p.v,effectElements[6].p.v);
                this.feFuncRComposed.setAttribute('tableValues',val);
                this.feFuncGComposed.setAttribute('tableValues',val);
                this.feFuncBComposed.setAttribute('tableValues',val);
            }

            if(this.feFuncR && (forceRender || effectElements[9].p.mdf || effectElements[10].p.mdf || effectElements[11].p.mdf || effectElements[12].p.mdf || effectElements[13].p.mdf)){
                val = this.getTableValue(effectElements[9].p.v,effectElements[10].p.v,effectElements[11].p.v,effectElements[12].p.v,effectElements[13].p.v);
                this.feFuncR.setAttribute('tableValues',val);
            }

            if(this.feFuncG && (forceRender || effectElements[16].p.mdf || effectElements[17].p.mdf || effectElements[18].p.mdf || effectElements[19].p.mdf || effectElements[20].p.mdf)){
                val = this.getTableValue(effectElements[16].p.v,effectElements[17].p.v,effectElements[18].p.v,effectElements[19].p.v,effectElements[20].p.v);
                this.feFuncG.setAttribute('tableValues',val);
            }

            if(this.feFuncB && (forceRender || effectElements[23].p.mdf || effectElements[24].p.mdf || effectElements[25].p.mdf || effectElements[26].p.mdf || effectElements[27].p.mdf)){
                val = this.getTableValue(effectElements[23].p.v,effectElements[24].p.v,effectElements[25].p.v,effectElements[26].p.v,effectElements[27].p.v);
                this.feFuncB.setAttribute('tableValues',val);
            }

            if(this.feFuncA && (forceRender || effectElements[30].p.mdf || effectElements[31].p.mdf || effectElements[32].p.mdf || effectElements[33].p.mdf || effectElements[34].p.mdf)){
                val = this.getTableValue(effectElements[30].p.v,effectElements[31].p.v,effectElements[32].p.v,effectElements[33].p.v,effectElements[34].p.v);
                this.feFuncA.setAttribute('tableValues',val);
            }

        }
    };
    function SVGEffects(elem){
        var i, len = elem.data.ef.length;
        var filId = randomString(10);
        var fil = filtersFactory.createFilter(filId);
        var count = 0;
        this.filters = [];
        var filterManager;
        for(i=0;i<len;i+=1){
            if(elem.data.ef[i].ty === 20){
                count += 1;
                filterManager = new SVGTintFilter(fil, elem.effects.effectElements[i]);
                this.filters.push(filterManager);
            }else if(elem.data.ef[i].ty === 21){
                count += 1;
                filterManager = new SVGFillFilter(fil, elem.effects.effectElements[i]);
                this.filters.push(filterManager);
            }else if(elem.data.ef[i].ty === 22){
                filterManager = new SVGStrokeEffect(elem, elem.effects.effectElements[i]);
                this.filters.push(filterManager);
            }else if(elem.data.ef[i].ty === 23){
                count += 1;
                filterManager = new SVGTritoneFilter(fil, elem.effects.effectElements[i]);
                this.filters.push(filterManager);
            }else if(elem.data.ef[i].ty === 24){
                count += 1;
                filterManager = new SVGProLevelsFilter(fil, elem.effects.effectElements[i]);
                this.filters.push(filterManager);
            }
        }
        if(count){
            elem.globalData.defs.appendChild(fil);
            elem.layerElement.setAttribute('filter','url(#'+filId+')');
        }
    }

    SVGEffects.prototype.renderFrame = function(firstFrame){
        var i, len = this.filters.length;
        for(i=0;i<len;i+=1){
            this.filters[i].renderFrame(firstFrame);
        }
    };
    function ICompElement(data,parentContainer,globalData,comp, placeholder){
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
        this.layers = data.layers;
        this.supports3d = true;
        this.completeLayers = false;
        this.pendingElements = [];
        this.elements = this.layers ? Array.apply(null,{length:this.layers.length}) : [];
        if(this.data.tm){
            this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
        }
        if(this.data.xt){
            this.layerElement = document.createElementNS(svgNS,'g');
            this.buildAllItems();
        } else if(!globalData.progressiveLoad){
            this.buildAllItems();
        }
    }
    createElement(SVGBaseElement, ICompElement);

    ICompElement.prototype.hide = function(){
        if(!this.hidden){
            var i,len = this.elements.length;
            for( i = 0; i < len; i+=1 ){
                if(this.elements[i]){
                    this.elements[i].hide();
                }
            }
            this.hidden = true;
        }
    };

    ICompElement.prototype.prepareFrame = function(num){
        this._parent.prepareFrame.call(this,num);
        if(this.isVisible===false && !this.data.xt){
            return;
        }

        if(this.tm){
            var timeRemapped = this.tm.v;
            if(timeRemapped === this.data.op){
                timeRemapped = this.data.op - 1;
            }
            this.renderedFrame = timeRemapped;
        } else {
            this.renderedFrame = num/this.data.sr;
        }
        var i,len = this.elements.length;
        if(!this.completeLayers){
            this.checkLayers(this.renderedFrame);
        }
        for( i = 0; i < len; i+=1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].prepareFrame(this.renderedFrame - this.layers[i].st);
            }
        }
    };

    ICompElement.prototype.renderFrame = function(parentMatrix){
        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        var i,len = this.layers.length;
        if(renderParent===false){
            this.hide();
            return;
        }

        this.hidden = false;
        for( i = 0; i < len; i+=1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };

    ICompElement.prototype.setElements = function(elems){
        this.elements = elems;
    };

    ICompElement.prototype.getElements = function(){
        return this.elements;
    };

    ICompElement.prototype.destroy = function(){
        this._parent.destroy.call(this._parent);
        var i,len = this.layers.length;
        for( i = 0; i < len; i+=1 ){
            if(this.elements[i]){
                this.elements[i].destroy();
            }
        }
    };

    ICompElement.prototype.checkLayers = SVGRenderer.prototype.checkLayers;
    ICompElement.prototype.buildItem = SVGRenderer.prototype.buildItem;
    ICompElement.prototype.buildAllItems = SVGRenderer.prototype.buildAllItems;
    ICompElement.prototype.buildElementParenting = SVGRenderer.prototype.buildElementParenting;
    ICompElement.prototype.createItem = SVGRenderer.prototype.createItem;
    ICompElement.prototype.createImage = SVGRenderer.prototype.createImage;
    ICompElement.prototype.createComp = SVGRenderer.prototype.createComp;
    ICompElement.prototype.createSolid = SVGRenderer.prototype.createSolid;
    ICompElement.prototype.createShape = SVGRenderer.prototype.createShape;
    ICompElement.prototype.createText = SVGRenderer.prototype.createText;
    ICompElement.prototype.createBase = SVGRenderer.prototype.createBase;
    ICompElement.prototype.appendElementInPos = SVGRenderer.prototype.appendElementInPos;
    ICompElement.prototype.checkPendingElements = SVGRenderer.prototype.checkPendingElements;
    ICompElement.prototype.addPendingElement = SVGRenderer.prototype.addPendingElement;
    function IImageElement(data,parentContainer,globalData,comp,placeholder){
        this.assetData = globalData.getAssetData(data.refId);
        this._parent.constructor.call(this,data,parentContainer,globalData,comp,placeholder);
    }
    createElement(SVGBaseElement, IImageElement);

    IImageElement.prototype.createElements = function(){

        var assetPath = this.globalData.getAssetsPath(this.assetData);

        this._parent.createElements.call(this);

        this.innerElem = document.createElementNS(svgNS,'image');
        this.innerElem.setAttribute('width',this.assetData.w+"px");
        this.innerElem.setAttribute('height',this.assetData.h+"px");
        this.innerElem.setAttribute('preserveAspectRatio','xMidYMid slice');
        this.innerElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
        this.maskedElement = this.innerElem;
        this.layerElement.appendChild(this.innerElem);
        if(this.data.ln){
            this.layerElement.setAttribute('id',this.data.ln);
        }
        if(this.data.cl){
            this.layerElement.setAttribute('class',this.data.cl);
        }

    };

    IImageElement.prototype.hide = function(){
        if(!this.hidden){
            this.layerElement.style.display = 'none';
            this.hidden = true;
        }
    };

    IImageElement.prototype.renderFrame = function(parentMatrix){
        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        if(renderParent===false){
            this.hide();
            return;
        }
        if(this.hidden){
            this.hidden = false;
            this.layerElement.style.display = 'block';
        }
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };

    IImageElement.prototype.destroy = function(){
        this._parent.destroy.call(this._parent);
        this.innerElem =  null;
    };
    function IShapeElement(data,parentContainer,globalData,comp, placeholder){
        this.shapes = [];
        this.shapesData = data.shapes;
        this.stylesList = [];
        this.viewData = [];
        this.shapeModifiers = [];
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    }
    createElement(SVGBaseElement, IShapeElement);

    IShapeElement.prototype.lcEnum = {
        '1': 'butt',
        '2': 'round',
        '3': 'butt'
    }

    IShapeElement.prototype.ljEnum = {
        '1': 'miter',
        '2': 'round',
        '3': 'butt'
    }

    IShapeElement.prototype.buildExpressionInterface = function(){};

    IShapeElement.prototype.createElements = function(){
        //TODO check if I can use symbol so i can set its viewBox
        this._parent.createElements.call(this);
        this.searchShapes(this.shapesData,this.viewData,this.layerElement,this.dynamicProperties, 0);
        if(!this.data.hd || this.data.td){
            styleUnselectableDiv(this.layerElement);
        }
        //this.elemInterface.registerShapeExpressionInterface(ShapeExpressionInterface.createShapeInterface(this.shapesData,this.viewData,this.elemInterface));
    };

    IShapeElement.prototype.setGradientData = function(pathElement,arr,data){

        var gradientId = 'gr_'+randomString(10);
        var gfill;
        if(arr.t === 1){
            gfill = document.createElementNS(svgNS,'linearGradient');
        } else {
            gfill = document.createElementNS(svgNS,'radialGradient');
        }
        gfill.setAttribute('id',gradientId);
        gfill.setAttribute('spreadMethod','pad');
        gfill.setAttribute('gradientUnits','userSpaceOnUse');
        var stops = [];
        var stop, j, jLen;
        jLen = arr.g.p*4;
        for(j=0;j<jLen;j+=4){
            stop = document.createElementNS(svgNS,'stop');
            gfill.appendChild(stop);
            stops.push(stop);
        }
        pathElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+gradientId+')');
        this.globalData.defs.appendChild(gfill);
        data.gf = gfill;
        data.cst = stops;
    }

    IShapeElement.prototype.setGradientOpacity = function(arr, data, styleOb){
        if((arr.g.k.k[0].s && arr.g.k.k[0].s.length > arr.g.p*4) || arr.g.k.k.length > arr.g.p*4){
            var opFill;
            var stop, j, jLen;
            var mask = document.createElementNS(svgNS,"mask");
            var maskElement = document.createElementNS(svgNS, 'path');
            mask.appendChild(maskElement);
            var opacityId = 'op_'+randomString(10);
            var maskId = 'mk_'+randomString(10);
            mask.setAttribute('id',maskId);
            if(arr.t === 1){
                opFill = document.createElementNS(svgNS,'linearGradient');
            } else {
                opFill = document.createElementNS(svgNS,'radialGradient');
            }
            opFill.setAttribute('id',opacityId);
            opFill.setAttribute('spreadMethod','pad');
            opFill.setAttribute('gradientUnits','userSpaceOnUse');
            jLen = arr.g.k.k[0].s ? arr.g.k.k[0].s.length : arr.g.k.k.length;
            var stops = [];
            for(j=arr.g.p*4;j<jLen;j+=2){
                stop = document.createElementNS(svgNS,'stop');
                stop.setAttribute('stop-color','rgb(255,255,255)');
                //stop.setAttribute('offset',Math.round(arr.y[j][0]*100)+'%');
                //stop.setAttribute('style','stop-color:rgb(255,255,255);stop-opacity:'+arr.y[j][1]);
                opFill.appendChild(stop);
                stops.push(stop);
            }
            maskElement.setAttribute( arr.ty === 'gf' ? 'fill':'stroke','url(#'+opacityId+')');
            this.globalData.defs.appendChild(opFill);
            this.globalData.defs.appendChild(mask);
            data.of = opFill;
            data.ost = stops;
            styleOb.msElem = maskElement;
            return maskId;
        }
    };

    IShapeElement.prototype.searchShapes = function(arr,data,container,dynamicProperties, level, transformers){
        transformers = transformers || [];
        var ownTransformers = [].concat(transformers);
        var i, len = arr.length - 1;
        var j, jLen;
        var ownArrays = [], ownModifiers = [], styleOb, currentTransform;
        for(i=len;i>=0;i-=1){
            if(arr[i].ty == 'fl' || arr[i].ty == 'st' || arr[i].ty == 'gf' || arr[i].ty == 'gs'){
                data[i] = {};
                styleOb = {
                    type: arr[i].ty,
                    d: '',
                    ld: '',
                    lvl: level,
                    mdf: false
                };
                var pathElement = document.createElementNS(svgNS, "path");
                data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
                if(arr[i].ty == 'st' || arr[i].ty == 'gs') {
                    pathElement.setAttribute('stroke-linecap', this.lcEnum[arr[i].lc] || 'round');
                    ////pathElement.style.strokeLinecap = this.lcEnum[arr[i].lc] || 'round';
                    pathElement.setAttribute('stroke-linejoin',this.ljEnum[arr[i].lj] || 'round');
                    ////pathElement.style.strokeLinejoin = this.ljEnum[arr[i].lj] || 'round';
                    pathElement.setAttribute('fill-opacity','0');
                    ////pathElement.style.fillOpacity = 0;
                    if(arr[i].lj == 1) {
                        pathElement.setAttribute('stroke-miterlimit',arr[i].ml);
                        ////pathElement.style.strokeMiterlimit = arr[i].ml;
                    }

                    data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                    if(arr[i].d){
                        var d = PropertyFactory.getDashProp(this,arr[i].d,'svg',dynamicProperties);
                        if(!d.k){
                            pathElement.setAttribute('stroke-dasharray', d.dasharray);
                            ////pathElement.style.strokeDasharray = d.dasharray;
                            pathElement.setAttribute('stroke-dashoffset', d.dashoffset);
                            ////pathElement.style.strokeDashoffset = d.dashoffset;
                        }
                        data[i].d = d;
                    }

                }
                if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                    data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
                    container.appendChild(pathElement);
                } else {
                    data[i].g = PropertyFactory.getGradientProp(this,arr[i].g,dynamicProperties);
                    if(arr[i].t == 2){
                        data[i].h = PropertyFactory.getProp(this,arr[i].h,1,0.01,dynamicProperties);
                        data[i].a = PropertyFactory.getProp(this,arr[i].a,1,degToRads,dynamicProperties);
                    }
                    data[i].s = PropertyFactory.getProp(this,arr[i].s,1,null,dynamicProperties);
                    data[i].e = PropertyFactory.getProp(this,arr[i].e,1,null,dynamicProperties);
                    this.setGradientData(pathElement,arr[i],data[i], styleOb);
                    var maskId = this.setGradientOpacity(arr[i],data[i], styleOb);
                    if(maskId){
                        pathElement.setAttribute('mask','url(#'+maskId+')');
                    }
                    data[i].elem = pathElement;
                    container.appendChild(pathElement);
                }

                if(arr[i].ln){
                    pathElement.setAttribute('id',arr[i].ln);
                }
                if(arr[i].cl){
                    pathElement.setAttribute('class',arr[i].cl);
                }
                styleOb.pElem = pathElement;
                this.stylesList.push(styleOb);
                data[i].style = styleOb;
                ownArrays.push(styleOb);
            }else if(arr[i].ty == 'gr'){
                data[i] = {
                    it: []
                };
                var g = document.createElementNS(svgNS,'g');
                container.appendChild(g);
                data[i].gr = g;
                this.searchShapes(arr[i].it,data[i].it,g,dynamicProperties, level + 1, transformers);
            }else if(arr[i].ty == 'tr'){
                data[i] = {
                    transform : {
                        op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                        mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                    },
                    elements: []
                };
                currentTransform = data[i].transform;
                ownTransformers.push(currentTransform);
            }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
                data[i] = {
                    elements : [],
                    caches:[],
                    styles : [],
                    transformers: ownTransformers,
                    lStr: ''
                };
                var ty = 4;
                if(arr[i].ty == 'rc'){
                    ty = 5;
                }else if(arr[i].ty == 'el'){
                    ty = 6;
                }else if(arr[i].ty == 'sr'){
                    ty = 7;
                }
                data[i].sh = ShapePropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties);
                data[i].lvl = level;
                this.shapes.push(data[i].sh);
                this.addShapeToModifiers(data[i].sh);
                jLen = this.stylesList.length;
                for(j=0;j<jLen;j+=1){
                    if(!this.stylesList[j].closed){
                        data[i].elements.push({
                            ty:this.stylesList[j].type,
                            st: this.stylesList[j]
                        });
                    }
                }
            }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd' || arr[i].ty == 'ms'){
                var modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i],dynamicProperties);
                this.shapeModifiers.push(modifier);
                ownModifiers.push(modifier);
                data[i] = modifier;
            }
        }
        len = ownArrays.length;
        for(i=0;i<len;i+=1){
            ownArrays[i].closed = true;
        }
        len = ownModifiers.length;
        for(i=0;i<len;i+=1){
            ownModifiers[i].closed = true;
        }
    };

    IShapeElement.prototype.addShapeToModifiers = function(shape) {
        var i, len = this.shapeModifiers.length;
        for(i=0;i<len;i+=1){
            this.shapeModifiers[i].addShape(shape);
        }
    };

    IShapeElement.prototype.renderModifiers = function() {
        if(!this.shapeModifiers.length){
            return;
        }
        var i, len = this.shapes.length;
        for(i=0;i<len;i+=1){
            this.shapes[i].reset();
        }


        len = this.shapeModifiers.length;

        for(i=len-1;i>=0;i-=1){
            this.shapeModifiers[i].processShapes(this.firstFrame);
        }
    };

    IShapeElement.prototype.renderFrame = function(parentMatrix){
        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        if(renderParent===false){
            this.hide();
            return;
        }
        this.globalToLocal([0,0,0]);
        if(this.hidden){
            this.layerElement.style.display = 'block';
            this.hidden = false;
        }
        this.renderModifiers();
        this.renderShape(null,null,true, null);
    };

    IShapeElement.prototype.hide = function(){
        if(!this.hidden){
            this.layerElement.style.display = 'none';
            var i, len = this.stylesList.length;
            for(i=len-1;i>=0;i-=1){
                if(this.stylesList[i].ld !== '0'){
                    this.stylesList[i].ld = '0';
                    this.stylesList[i].pElem.style.display = 'none';
                    if(this.stylesList[i].pElem.parentNode){
                        this.stylesList[i].parent = this.stylesList[i].pElem.parentNode;
                        //this.stylesList[i].pElem.parentNode.removeChild(this.stylesList[i].pElem);
                    }
                }
            }
            this.hidden = true;
        }
    };

    IShapeElement.prototype.renderShape = function(items,data,isMain, container){
        var i, len;
        if(!items){
            items = this.shapesData;
            len = this.stylesList.length;
            for(i=0;i<len;i+=1){
                this.stylesList[i].d = '';
                this.stylesList[i].mdf = false;
            }
        }
        if(!data){
            data = this.viewData;
        }
        ///
        ///
        len = items.length - 1;
        var ty;
        for(i=len;i>=0;i-=1){
            ty = items[i].ty;
            if(ty == 'tr'){
                if(this.firstFrame || data[i].transform.op.mdf && container){
                    container.setAttribute('opacity',data[i].transform.op.v);
                }
                if(this.firstFrame || data[i].transform.mProps.mdf && container){
                    container.setAttribute('transform',data[i].transform.mProps.v.to2dCSS());
                }
            }else if(ty == 'sh' || ty == 'el' || ty == 'rc' || ty == 'sr'){
                this.renderPath(items[i],data[i]);
            }else if(ty == 'fl'){
                this.renderFill(items[i],data[i]);
            }else if(ty == 'gf'){
                this.renderGradient(items[i],data[i]);
            }else if(ty == 'gs'){
                this.renderGradient(items[i],data[i]);
                this.renderStroke(items[i],data[i]);
            }else if(ty == 'st'){
                this.renderStroke(items[i],data[i]);
            }else if(ty == 'gr'){
                this.renderShape(items[i].it,data[i].it,false, data[i].gr);
            }else if(ty == 'tm'){
                //
            }
        }
        if(isMain) {
            len = this.stylesList.length;
            for (i = 0; i < len; i += 1) {
                if (this.stylesList[i].ld === '0') {
                    this.stylesList[i].ld = '1';
                    this.stylesList[i].pElem.style.display = 'block';
                    //this.stylesList[i].parent.appendChild(this.stylesList[i].pElem);
                }
                if (this.stylesList[i].mdf || this.firstFrame) {
                    this.stylesList[i].pElem.setAttribute('d', this.stylesList[i].d);
                    if(this.stylesList[i].msElem){
                        this.stylesList[i].msElem.setAttribute('d', this.stylesList[i].d);
                    }
                }
            }
            if (this.firstFrame) {
                this.firstFrame = false;
            }
        }

    };

    IShapeElement.prototype.renderPath = function(pathData,viewData){
        var len, i, j, jLen,pathStringTransformed,redraw,pathNodes,l, lLen = viewData.elements.length;
        var lvl = viewData.lvl;
        for(l=0;l<lLen;l+=1){
            redraw = viewData.sh.mdf || this.firstFrame;
            pathStringTransformed = '';
            var paths = viewData.sh.paths;
            jLen = paths.length;
            if(viewData.elements[l].st.lvl < lvl){
                var mat = this.mHelper.reset(), props;
                var k;
                for(k=viewData.transformers.length-1;k>=0;k-=1){
                    redraw = viewData.transformers[k].mProps.mdf || redraw;
                    props = viewData.transformers[k].mProps.v.props;
                    mat.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
                }
                if(redraw){
                    for(j=0;j<jLen;j+=1){
                        pathNodes = paths[j];
                        if(pathNodes && pathNodes.v){
                            len = pathNodes.v.length;
                            for (i = 1; i < len; i += 1) {
                                if (i == 1) {
                                    pathStringTransformed += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                }
                                pathStringTransformed += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                            }
                            if (len == 1) {
                                pathStringTransformed += " M" + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                            }
                            if (pathNodes.c) {
                                pathStringTransformed += " C" + mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                pathStringTransformed += 'z';
                            }
                        }
                    }
                    viewData.caches[l] = pathStringTransformed;
                } else {
                    pathStringTransformed = viewData.caches[l];
                }
            } else {
                if(redraw){
                    for(j=0;j<jLen;j+=1){
                        pathNodes = paths[j];
                        if(pathNodes && pathNodes.v){
                            len = pathNodes.v.length;
                            for (i = 1; i < len; i += 1) {
                                if (i == 1) {
                                    //pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                    pathStringTransformed += " M" + pathNodes.v[0].join(',');
                                }
                                //pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[i][0], pathNodes.i[i][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[i][0], pathNodes.v[i][1]);
                                pathStringTransformed += " C" + pathNodes.o[i - 1].join(',') + " " + pathNodes.i[i].join(',') + " " + pathNodes.v[i].join(',');
                            }
                            if (len == 1) {
                                //pathStringTransformed += " M" + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                pathStringTransformed += " M" + pathNodes.v[0].join(',');
                            }
                            if (pathNodes.c && len) {
                                //pathStringTransformed += " C" + groupTransform.mat.applyToPointStringified(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.i[0][0], pathNodes.i[0][1]) + " " + groupTransform.mat.applyToPointStringified(pathNodes.v[0][0], pathNodes.v[0][1]);
                                pathStringTransformed += " C" + pathNodes.o[i - 1].join(',') + " " + pathNodes.i[0].join(',') + " " + pathNodes.v[0].join(',');
                                pathStringTransformed += 'z';
                            }
                        }
                    }
                    viewData.caches[l] = pathStringTransformed;
                } else {
                    pathStringTransformed = viewData.caches[l];
                }
            }
            viewData.elements[l].st.d += pathStringTransformed;
            viewData.elements[l].st.mdf = redraw || viewData.elements[l].st.mdf;
        }

    };

    IShapeElement.prototype.renderFill = function(styleData,viewData){
        var styleElem = viewData.style;

        if(viewData.c.mdf || this.firstFrame){
            styleElem.pElem.setAttribute('fill','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
            ////styleElem.pElem.style.fill = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
        }
        if(viewData.o.mdf || this.firstFrame){
            styleElem.pElem.setAttribute('fill-opacity',viewData.o.v);
        }
    };

    IShapeElement.prototype.renderGradient = function(styleData,viewData){
        var gfill = viewData.gf;
        var opFill = viewData.of;
        var pt1 = viewData.s.v,pt2 = viewData.e.v;

        if(viewData.o.mdf || this.firstFrame){
            var attr = styleData.ty === 'gf' ? 'fill-opacity':'stroke-opacity';
            viewData.elem.setAttribute(attr,viewData.o.v);
        }
        //clippedElement.setAttribute('transform','matrix(1,0,0,1,-100,0)');
        if(viewData.s.mdf || this.firstFrame){
            var attr1 = styleData.t === 1 ? 'x1':'cx';
            var attr2 = attr1 === 'x1' ? 'y1':'cy';
            gfill.setAttribute(attr1,pt1[0]);
            gfill.setAttribute(attr2,pt1[1]);
            if(opFill){
                opFill.setAttribute(attr1,pt1[0]);
                opFill.setAttribute(attr2,pt1[1]);
            }
        }
        var stops, i, len, stop;
        if(viewData.g.cmdf || this.firstFrame){
            stops = viewData.cst;
            var cValues = viewData.g.c;
            len = stops.length;
            for(i=0;i<len;i+=1){
                stop = stops[i];
                stop.setAttribute('offset',cValues[i*4]+'%');
                stop.setAttribute('stop-color','rgb('+cValues[i*4+1]+','+cValues[i*4+2]+','+cValues[i*4+3]+')');
            }
        }
        if(opFill && (viewData.g.omdf || this.firstFrame)){
            stops = viewData.ost;
            var oValues = viewData.g.o;
            len = stops.length;
            for(i=0;i<len;i+=1){
                stop = stops[i];
                stop.setAttribute('offset',oValues[i*2]+'%');
                stop.setAttribute('stop-opacity',oValues[i*2+1]);
            }
        }
        if(styleData.t === 1){
            if(viewData.e.mdf  || this.firstFrame){
                gfill.setAttribute('x2',pt2[0]);
                gfill.setAttribute('y2',pt2[1]);
                if(opFill){
                    opFill.setAttribute('x2',pt2[0]);
                    opFill.setAttribute('y2',pt2[1]);
                }
            }
        } else {
            var rad;
            if(viewData.s.mdf || viewData.e.mdf || this.firstFrame){
                rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
                gfill.setAttribute('r',rad);
                if(opFill){
                    opFill.setAttribute('r',rad);
                }
            }
            if(viewData.e.mdf || viewData.h.mdf || viewData.a.mdf || this.firstFrame){
                if(!rad){
                    rad = Math.sqrt(Math.pow(pt1[0]-pt2[0],2)+Math.pow(pt1[1]-pt2[1],2));
                }
                var ang = Math.atan2(pt2[1]-pt1[1], pt2[0]-pt1[0]);

                var percent = viewData.h.v >= 1 ? 0.99 : viewData.h.v <= -1 ? -0.99:viewData.h.v;
                var dist = rad*percent;
                var x = Math.cos(ang + viewData.a.v)*dist + pt1[0];
                var y = Math.sin(ang + viewData.a.v)*dist + pt1[1];
                gfill.setAttribute('fx',x);
                gfill.setAttribute('fy',y);
                if(opFill){
                    opFill.setAttribute('fx',x);
                    opFill.setAttribute('fy',y);
                }
            }
            //gfill.setAttribute('fy','200');
        }
    };

    IShapeElement.prototype.renderStroke = function(styleData,viewData){
        var styleElem = viewData.style;
        //TODO fix dashes
        var d = viewData.d;
        var dasharray,dashoffset;
        if(d && d.k && (d.mdf || this.firstFrame)){
            styleElem.pElem.setAttribute('stroke-dasharray', d.dasharray);
            ////styleElem.pElem.style.strokeDasharray = d.dasharray;
            styleElem.pElem.setAttribute('stroke-dashoffset', d.dashoffset);
            ////styleElem.pElem.style.strokeDashoffset = d.dashoffset;
        }
        if(viewData.c && (viewData.c.mdf || this.firstFrame)){
            styleElem.pElem.setAttribute('stroke','rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')');
            ////styleElem.pElem.style.stroke = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
        }
        if(viewData.o.mdf || this.firstFrame){
            styleElem.pElem.setAttribute('stroke-opacity',viewData.o.v);
        }
        if(viewData.w.mdf || this.firstFrame){
            styleElem.pElem.setAttribute('stroke-width',viewData.w.v);
            if(styleElem.msElem){
                styleElem.msElem.setAttribute('stroke-width',viewData.w.v);
            }
            ////styleElem.pElem.style.strokeWidth = viewData.w.v;
        }
    };

    IShapeElement.prototype.destroy = function(){
        this._parent.destroy.call(this._parent);
        this.shapeData = null;
        this.viewData = null;
        this.parentContainer = null;
        this.placeholder = null;
    };

    function ISolidElement(data,parentContainer,globalData,comp, placeholder){
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    }
    createElement(SVGBaseElement, ISolidElement);

    ISolidElement.prototype.createElements = function(){
        this._parent.createElements.call(this);

        var rect = document.createElementNS(svgNS,'rect');
        ////rect.style.width = this.data.sw;
        ////rect.style.height = this.data.sh;
        ////rect.style.fill = this.data.sc;
        rect.setAttribute('width',this.data.sw);
        rect.setAttribute('height',this.data.sh);
        rect.setAttribute('fill',this.data.sc);
        this.layerElement.appendChild(rect);
        this.innerElem = rect;
        if(this.data.ln){
            this.layerElement.setAttribute('id',this.data.ln);
        }
        if(this.data.cl){
            this.layerElement.setAttribute('class',this.data.cl);
        }
    };

    ISolidElement.prototype.hide = IImageElement.prototype.hide;
    ISolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
    ISolidElement.prototype.destroy = IImageElement.prototype.destroy;

    var animationManager = (function(){
        var moduleOb = {};
        var registeredAnimations = [];
        var initTime = 0;
        var len = 0;
        var idled = true;
        var playingAnimationsNum = 0;

        function removeElement(ev){
            var i = 0;
            var animItem = ev.target;
            while(i<len) {
                if (registeredAnimations[i].animation === animItem) {
                    registeredAnimations.splice(i, 1);
                    i -= 1;
                    len -= 1;
                    if(!animItem.isPaused){
                        subtractPlayingCount();
                    }
                }
                i += 1;
            }
        }

        function registerAnimation(element, animationData){
            if(!element){
                return null;
            }
            var i=0;
            while(i<len){
                if(registeredAnimations[i].elem == element && registeredAnimations[i].elem !== null ){
                    return registeredAnimations[i].animation;
                }
                i+=1;
            }
            var animItem = new AnimationItem();
            setupAnimation(animItem, element);
            animItem.setData(element, animationData);
            return animItem;
        }

        function addPlayingCount(){
            playingAnimationsNum += 1;
            activate();
        }

        function subtractPlayingCount(){
            playingAnimationsNum -= 1;
            if(playingAnimationsNum === 0){
                idled = true;
            }
        }

        function setupAnimation(animItem, element){
            animItem.addEventListener('destroy',removeElement);
            animItem.addEventListener('_active',addPlayingCount);
            animItem.addEventListener('_idle',subtractPlayingCount);
            registeredAnimations.push({elem: element,animation:animItem});
            len += 1;
        }

        function loadAnimation(params){
            var animItem = new AnimationItem();
            setupAnimation(animItem, null);
            animItem.setParams(params);
            return animItem;
        }


        function setSpeed(val,animation){
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.setSpeed(val, animation);
            }
        }

        function setDirection(val, animation){
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.setDirection(val, animation);
            }
        }

        function play(animation){
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.play(animation);
            }
        }

        function moveFrame (value, animation) {
            initTime = Date.now();
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.moveFrame(value,animation);
            }
        }

        function resume(nowTime) {

            var elapsedTime = nowTime - initTime;
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.advanceTime(elapsedTime);
            }
            initTime = nowTime;
            if(!idled) {
                requestAnimationFrame(resume);
            }
        }

        function first(nowTime){
            initTime = nowTime;
            requestAnimationFrame(resume);
        }

        function pause(animation) {
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.pause(animation);
            }
        }

        function goToAndStop(value,isFrame,animation) {
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.goToAndStop(value,isFrame,animation);
            }
        }

        function stop(animation) {
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.stop(animation);
            }
        }

        function togglePause(animation) {
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.togglePause(animation);
            }
        }

        function destroy(animation) {
            var i;
            for(i=(len-1);i>=0;i-=1){
                registeredAnimations[i].animation.destroy(animation);
            }
        }

        function searchAnimations(animationData, standalone, renderer){
            var animElements = document.getElementsByClassName('bodymovin');
            var i, len = animElements.length;
            for(i=0;i<len;i+=1){
                if(renderer){
                    animElements[i].setAttribute('data-bm-type',renderer);
                }
                registerAnimation(animElements[i], animationData);
            }
            if(standalone && len === 0){
                if(!renderer){
                    renderer = 'svg';
                }
                var body = document.getElementsByTagName('body')[0];
                body.innerHTML = '';
                var div = document.createElement('div');
                div.style.width = '100%';
                div.style.height = '100%';
                div.setAttribute('data-bm-type',renderer);
                body.appendChild(div);
                registerAnimation(div, animationData);
            }
        }

        function resize(){
            var i;
            for(i=0;i<len;i+=1){
                registeredAnimations[i].animation.resize();
            }
        }

        function start(){
            requestAnimationFrame(first);
        }

        function activate(){
            if(idled){
                idled = false;
                requestAnimationFrame(first);
            }
        }

        //start();

        setTimeout(start,0);

        moduleOb.registerAnimation = registerAnimation;
        moduleOb.loadAnimation = loadAnimation;
        moduleOb.setSpeed = setSpeed;
        moduleOb.setDirection = setDirection;
        moduleOb.play = play;
        moduleOb.moveFrame = moveFrame;
        moduleOb.pause = pause;
        moduleOb.stop = stop;
        moduleOb.togglePause = togglePause;
        moduleOb.searchAnimations = searchAnimations;
        moduleOb.resize = resize;
        moduleOb.start = start;
        moduleOb.goToAndStop = goToAndStop;
        moduleOb.destroy = destroy;
        return moduleOb;
    }());
    var AnimationItem = function () {
        this._cbs = [];
        this.name = '';
        this.path = '';
        this.isLoaded = false;
        this.currentFrame = 0;
        this.currentRawFrame = 0;
        this.totalFrames = 0;
        this.frameRate = 0;
        this.frameMult = 0;
        this.playSpeed = 1;
        this.playDirection = 1;
        this.pendingElements = 0;
        this.playCount = 0;
        this.prerenderFramesFlag = true;
        this.animationData = {};
        this.layers = [];
        this.assets = [];
        this.isPaused = true;
        this.autoplay = false;
        this.loop = true;
        this.renderer = null;
        this.animationID = randomString(10);
        this.scaleMode = 'fit';
        this.assetsPath = '';
        this.timeCompleted = 0;
        this.segmentPos = 0;
        this.subframeEnabled = subframeEnabled;
        this.segments = [];
        this.pendingSegment = false;
        this._idle = true;
        this.projectInterface = ProjectInterface();
    };

    AnimationItem.prototype.setParams = function(params) {
        var self = this;
        if(params.context){
            this.context = params.context;
        }
        if(params.wrapper || params.container){
            this.wrapper = params.wrapper || params.container;
        }
        var animType = params.animType ? params.animType : params.renderer ? params.renderer : 'svg';
        switch(animType){
            case 'canvas':
                this.renderer = new CanvasRenderer(this, params.rendererSettings);
                break;
            case 'svg':
                this.renderer = new SVGRenderer(this, params.rendererSettings);
                break;
            case 'hybrid':
            case 'html':
            default:
                this.renderer = new HybridRenderer(this, params.rendererSettings);
                break;
        }
        this.renderer.setProjectInterface(this.projectInterface);
        this.animType = animType;

        if(params.loop === '' || params.loop === null){
        }else if(params.loop === false){
            this.loop = false;
        }else if(params.loop === true){
            this.loop = true;
        }else{
            this.loop = parseInt(params.loop);
        }
        this.autoplay = 'autoplay' in params ? params.autoplay : true;
        this.name = params.name ? params.name :  '';
        this.prerenderFramesFlag = 'prerender' in params ? params.prerender : true;
        this.autoloadSegments = params.hasOwnProperty('autoloadSegments') ? params.autoloadSegments :  true;
        if(params.animationData){
            self.configAnimation(params.animationData);
        }else if(params.path){
            if(params.path.substr(-4) != 'json'){
                if (params.path.substr(-1, 1) != '/') {
                    params.path += '/';
                }
                params.path += 'data.json';
            }

            var xhr = new XMLHttpRequest();
            if(params.path.lastIndexOf('\\') != -1){
                this.path = params.path.substr(0,params.path.lastIndexOf('\\')+1);
            }else{
                this.path = params.path.substr(0,params.path.lastIndexOf('/')+1);
            }
            this.assetsPath = params.assetsPath;
            this.fileName = params.path.substr(params.path.lastIndexOf('/')+1);
            this.fileName = this.fileName.substr(0,this.fileName.lastIndexOf('.json'));
            xhr.open('GET', params.path, true);
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200){
                        self.configAnimation(JSON.parse(xhr.responseText));
                    }else{
                        try{
                            var response = JSON.parse(xhr.responseText);
                            self.configAnimation(response);
                        }catch(err){
                        }
                    }
                }
            };
        }
    };

    AnimationItem.prototype.setData = function (wrapper, animationData) {
        var params = {
            wrapper: wrapper,
            animationData: animationData ? (typeof animationData  === "object") ? animationData : JSON.parse(animationData) : null
        };
        var wrapperAttributes = wrapper.attributes;

        params.path = wrapperAttributes.getNamedItem('data-animation-path') ? wrapperAttributes.getNamedItem('data-animation-path').value : wrapperAttributes.getNamedItem('data-bm-path') ? wrapperAttributes.getNamedItem('data-bm-path').value :  wrapperAttributes.getNamedItem('bm-path') ? wrapperAttributes.getNamedItem('bm-path').value : '';
        params.animType = wrapperAttributes.getNamedItem('data-anim-type') ? wrapperAttributes.getNamedItem('data-anim-type').value : wrapperAttributes.getNamedItem('data-bm-type') ? wrapperAttributes.getNamedItem('data-bm-type').value : wrapperAttributes.getNamedItem('bm-type') ? wrapperAttributes.getNamedItem('bm-type').value :  wrapperAttributes.getNamedItem('data-bm-renderer') ? wrapperAttributes.getNamedItem('data-bm-renderer').value : wrapperAttributes.getNamedItem('bm-renderer') ? wrapperAttributes.getNamedItem('bm-renderer').value : 'canvas';

        var loop = wrapperAttributes.getNamedItem('data-anim-loop') ? wrapperAttributes.getNamedItem('data-anim-loop').value :  wrapperAttributes.getNamedItem('data-bm-loop') ? wrapperAttributes.getNamedItem('data-bm-loop').value :  wrapperAttributes.getNamedItem('bm-loop') ? wrapperAttributes.getNamedItem('bm-loop').value : '';
        if(loop === ''){
        }else if(loop === 'false'){
            params.loop = false;
        }else if(loop === 'true'){
            params.loop = true;
        }else{
            params.loop = parseInt(loop);
        }
        var autoplay = wrapperAttributes.getNamedItem('data-anim-autoplay') ? wrapperAttributes.getNamedItem('data-anim-autoplay').value :  wrapperAttributes.getNamedItem('data-bm-autoplay') ? wrapperAttributes.getNamedItem('data-bm-autoplay').value :  wrapperAttributes.getNamedItem('bm-autoplay') ? wrapperAttributes.getNamedItem('bm-autoplay').value : true;
        params.autoplay = autoplay !== "false";

        params.name = wrapperAttributes.getNamedItem('data-name') ? wrapperAttributes.getNamedItem('data-name').value :  wrapperAttributes.getNamedItem('data-bm-name') ? wrapperAttributes.getNamedItem('data-bm-name').value : wrapperAttributes.getNamedItem('bm-name') ? wrapperAttributes.getNamedItem('bm-name').value :  '';
        var prerender = wrapperAttributes.getNamedItem('data-anim-prerender') ? wrapperAttributes.getNamedItem('data-anim-prerender').value :  wrapperAttributes.getNamedItem('data-bm-prerender') ? wrapperAttributes.getNamedItem('data-bm-prerender').value :  wrapperAttributes.getNamedItem('bm-prerender') ? wrapperAttributes.getNamedItem('bm-prerender').value : '';

        if(prerender === 'false'){
            params.prerender = false;
        }
        this.setParams(params);
    };

    AnimationItem.prototype.includeLayers = function(data) {
        if(data.op > this.animationData.op){
            this.animationData.op = data.op;
            this.totalFrames = Math.floor(data.op - this.animationData.ip);
            this.animationData.tf = this.totalFrames;
        }
        var layers = this.animationData.layers;
        var i, len = layers.length;
        var newLayers = data.layers;
        var j, jLen = newLayers.length;
        for(j=0;j<jLen;j+=1){
            i = 0;
            while(i<len){
                if(layers[i].id == newLayers[j].id){
                    layers[i] = newLayers[j];
                    break;
                }
                i += 1;
            }
        }
        if(data.chars || data.fonts){
            this.renderer.globalData.fontManager.addChars(data.chars);
            this.renderer.globalData.fontManager.addFonts(data.fonts, this.renderer.globalData.defs);
        }
        if(data.assets){
            len = data.assets.length;
            for(i = 0; i < len; i += 1){
                this.animationData.assets.push(data.assets[i]);
            }
        }
        //this.totalFrames = 50;
        //this.animationData.tf = 50;
        this.animationData.__complete = false;
        dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
        this.renderer.includeLayers(data.layers);
        if(expressionsPlugin){
            expressionsPlugin.initExpressions(this);
        }
        this.renderer.renderFrame(null);
        this.loadNextSegment();
    };

    AnimationItem.prototype.loadNextSegment = function() {
        var segments = this.animationData.segments;
        if(!segments || segments.length === 0 || !this.autoloadSegments){
            this.trigger('data_ready');
            this.timeCompleted = this.animationData.tf;
            return;
        }
        var segment = segments.shift();
        this.timeCompleted = segment.time * this.frameRate;
        var xhr = new XMLHttpRequest();
        var self = this;
        var segmentPath = this.path+this.fileName+'_' + this.segmentPos + '.json';
        this.segmentPos += 1;
        xhr.open('GET', segmentPath, true);
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if(xhr.status == 200){
                    self.includeLayers(JSON.parse(xhr.responseText));
                }else{
                    try{
                        var response = JSON.parse(xhr.responseText);
                        self.includeLayers(response);
                    }catch(err){
                    }
                }
            }
        };
    };

    AnimationItem.prototype.loadSegments = function() {
        var segments = this.animationData.segments;
        if(!segments) {
            this.timeCompleted = this.animationData.tf;
        }
        this.loadNextSegment();
    };

    AnimationItem.prototype.configAnimation = function (animData) {
        if(this.renderer && this.renderer.destroyed){
            return;
        }
        //console.log(JSON.parse(JSON.stringify(animData)));
        //animData.w = Math.round(animData.w/blitter);
        //animData.h = Math.round(animData.h/blitter);
        this.animationData = animData;
        this.totalFrames = Math.floor(this.animationData.op - this.animationData.ip);
        this.animationData.tf = this.totalFrames;
        this.renderer.configAnimation(animData);
        if(!animData.assets){
            animData.assets = [];
        }
        if(animData.comps) {
            animData.assets = animData.assets.concat(animData.comps);
            animData.comps = null;
        }
        this.renderer.searchExtraCompositions(animData.assets);

        this.layers = this.animationData.layers;
        this.assets = this.animationData.assets;
        this.frameRate = this.animationData.fr;
        this.firstFrame = Math.round(this.animationData.ip);
        this.frameMult = this.animationData.fr / 1000;
        this.trigger('config_ready');
        this.imagePreloader = new ImagePreloader();
        this.imagePreloader.setAssetsPath(this.assetsPath);
        this.imagePreloader.setPath(this.path);
        this.imagePreloader.loadAssets(animData.assets);
        this.loadSegments();
        this.updaFrameModifier();
        if(this.renderer.globalData.fontManager){
            this.waitForFontsLoaded();
        }else{
            dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
            this.checkLoaded();
        }
    };

    AnimationItem.prototype.waitForFontsLoaded = (function(){
        function checkFontsLoaded(){
            if(this.renderer.globalData.fontManager.loaded){
                dataManager.completeData(this.animationData,this.renderer.globalData.fontManager);
                //this.renderer.buildItems(this.animationData.layers);
                this.checkLoaded();
            }else{
                setTimeout(checkFontsLoaded.bind(this),20);
            }
        }

        return function(){
            checkFontsLoaded.bind(this)();
        }
    }());

    AnimationItem.prototype.addPendingElement = function () {
        this.pendingElements += 1;
    }

    AnimationItem.prototype.elementLoaded = function () {
        this.pendingElements--;
        this.checkLoaded();
    };

    AnimationItem.prototype.checkLoaded = function () {
        if (this.pendingElements === 0) {
            if(expressionsPlugin){
                expressionsPlugin.initExpressions(this);
            }
            this.renderer.initItems();
            setTimeout(function(){
                this.trigger('DOMLoaded');
            }.bind(this),0);
            this.isLoaded = true;
            this.gotoFrame();
            if(this.autoplay){
                this.play();
            }
        }
    };

    AnimationItem.prototype.resize = function () {
        this.renderer.updateContainerSize();
    };

    AnimationItem.prototype.setSubframe = function(flag){
        this.subframeEnabled = flag ? true : false;
    }

    AnimationItem.prototype.gotoFrame = function () {
        if(this.subframeEnabled){
            this.currentFrame = this.currentRawFrame;
        }else{
            this.currentFrame = Math.floor(this.currentRawFrame);
        }

        if(this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted){
            this.currentFrame = this.timeCompleted;
        }
        this.trigger('enterFrame');
        this.renderFrame();
    };

    AnimationItem.prototype.renderFrame = function () {
        if(this.isLoaded === false){
            return;
        }
        //console.log('this.currentFrame:',this.currentFrame + this.firstFrame);
        this.renderer.renderFrame(this.currentFrame + this.firstFrame);
    };

    AnimationItem.prototype.play = function (name) {
        if(name && this.name != name){
            return;
        }
        if(this.isPaused === true){
            this.isPaused = false;
            if(this._idle){
                this._idle = false;
                this.trigger('_active');
            }
        }
    };

    AnimationItem.prototype.pause = function (name) {
        if(name && this.name != name){
            return;
        }
        if(this.isPaused === false){
            this.isPaused = true;
            if(!this.pendingSegment){
                this._idle = true;
                this.trigger('_idle');
            }
        }
    };

    AnimationItem.prototype.togglePause = function (name) {
        if(name && this.name != name){
            return;
        }
        if(this.isPaused === true){
            this.play();
        }else{
            this.pause();
        }
    };

    AnimationItem.prototype.stop = function (name) {
        if(name && this.name != name){
            return;
        }
        this.pause();
        this.currentFrame = this.currentRawFrame = 0;
        this.playCount = 0;
        this.gotoFrame();
    };

    AnimationItem.prototype.goToAndStop = function (value, isFrame, name) {
        if(name && this.name != name){
            return;
        }
        if(isFrame){
            this.setCurrentRawFrameValue(value);
        }else{
            this.setCurrentRawFrameValue(value * this.frameModifier);
        }
        this.pause();
    };

    AnimationItem.prototype.goToAndPlay = function (value, isFrame, name) {
        this.goToAndStop(value, isFrame, name);
        this.play();
    };

    AnimationItem.prototype.advanceTime = function (value) {
        if(this.pendingSegment){
            this.pendingSegment = false;
            this.adjustSegment(this.segments.shift());
            if(this.isPaused){
                this.play();
            }
            return;
        }
        if (this.isPaused === true || this.isLoaded === false) {
            return;
        }
        this.setCurrentRawFrameValue(this.currentRawFrame + value * this.frameModifier);
    };

    AnimationItem.prototype.updateAnimation = function (perc) {
        this.setCurrentRawFrameValue(this.totalFrames * perc);
    };

    AnimationItem.prototype.moveFrame = function (value, name) {
        if(name && this.name != name){
            return;
        }
        this.setCurrentRawFrameValue(this.currentRawFrame+value);
    };

    AnimationItem.prototype.adjustSegment = function(arr){
        this.playCount = 0;
        if(arr[1] < arr[0]){
            if(this.frameModifier > 0){
                if(this.playSpeed < 0){
                    this.setSpeed(-this.playSpeed);
                } else {
                    this.setDirection(-1);
                }
            }
            this.totalFrames = arr[0] - arr[1];
            this.firstFrame = arr[1];
            this.setCurrentRawFrameValue(this.totalFrames - 0.01);
        } else if(arr[1] > arr[0]){
            if(this.frameModifier < 0){
                if(this.playSpeed < 0){
                    this.setSpeed(-this.playSpeed);
                } else {
                    this.setDirection(1);
                }
            }
            this.totalFrames = arr[1] - arr[0];
            this.firstFrame = arr[0];
            this.setCurrentRawFrameValue(0);
        }
        this.trigger('segmentStart');
    };
    AnimationItem.prototype.setSegment = function (init,end) {
        var pendingFrame = -1;
        if(this.isPaused) {
            if (this.currentRawFrame + this.firstFrame < init) {
                pendingFrame = init;
            } else if (this.currentRawFrame + this.firstFrame > end) {
                pendingFrame = end - init - 0.01;
            }
        }

        this.firstFrame = init;
        this.totalFrames = end - init;
        if(pendingFrame !== -1) {
            this.goToAndStop(pendingFrame,true);
        }
    }

    AnimationItem.prototype.playSegments = function (arr,forceFlag) {
        if(typeof arr[0] === 'object'){
            var i, len = arr.length;
            for(i=0;i<len;i+=1){
                this.segments.push(arr[i]);
            }
        }else{
            this.segments.push(arr);
        }
        if(forceFlag){
            this.adjustSegment(this.segments.shift());
        }
        if(this.isPaused){
            this.play();
        }
    };

    AnimationItem.prototype.resetSegments = function (forceFlag) {
        this.segments.length = 0;
        this.segments.push([this.animationData.ip*this.frameRate,Math.floor(this.animationData.op - this.animationData.ip+this.animationData.ip*this.frameRate)]);
        if(forceFlag){
            this.adjustSegment(this.segments.shift());
        }
    };
    AnimationItem.prototype.checkSegments = function(){
        if(this.segments.length){
            this.pendingSegment = true;
        }
    }

    AnimationItem.prototype.remove = function (name) {
        if(name && this.name != name){
            return;
        }
        this.renderer.destroy();
    };

    AnimationItem.prototype.destroy = function (name) {
        if((name && this.name != name) || (this.renderer && this.renderer.destroyed)){
            return;
        }
        this.renderer.destroy();
        this.trigger('destroy');
        this._cbs = null;
        this.onEnterFrame = this.onLoopComplete = this.onComplete = this.onSegmentStart = this.onDestroy = null;
    };

    AnimationItem.prototype.setCurrentRawFrameValue = function(value){
        this.currentRawFrame = value;
        //console.log(this.totalFrames);
        if (this.currentRawFrame >= this.totalFrames) {
            this.checkSegments();
            if(this.loop === false){
                this.currentRawFrame = this.totalFrames - 0.01;
                this.gotoFrame();
                this.pause();
                this.trigger('complete');
                return;
            }else{
                this.trigger('loopComplete');
                this.playCount += 1;
                if((this.loop !== true && this.playCount == this.loop) || this.pendingSegment){
                    this.currentRawFrame = this.totalFrames - 0.01;
                    this.gotoFrame();
                    this.pause();
                    this.trigger('complete');
                    return;
                } else {
                    this.currentRawFrame = this.currentRawFrame % this.totalFrames;
                }
            }
        } else if (this.currentRawFrame < 0) {
            this.checkSegments();
            this.playCount -= 1;
            if(this.playCount < 0){
                this.playCount = 0;
            }
            if(this.loop === false  || this.pendingSegment){
                this.currentRawFrame = 0;
                this.gotoFrame();
                this.pause();
                this.trigger('complete');
                return;
            }else{
                this.trigger('loopComplete');
                this.currentRawFrame = (this.totalFrames + this.currentRawFrame) % this.totalFrames;
                this.gotoFrame();
                return;
            }
        }

        this.gotoFrame();
    };

    AnimationItem.prototype.setSpeed = function (val) {
        this.playSpeed = val;
        this.updaFrameModifier();
    };

    AnimationItem.prototype.setDirection = function (val) {
        this.playDirection = val < 0 ? -1 : 1;
        this.updaFrameModifier();
    };

    AnimationItem.prototype.updaFrameModifier = function () {
        this.frameModifier = this.frameMult * this.playSpeed * this.playDirection;
    };

    AnimationItem.prototype.getPath = function () {
        return this.path;
    };

    AnimationItem.prototype.getAssetsPath = function (assetData) {
        var path = '';
        if(this.assetsPath){
            var imagePath = assetData.p;
            if(imagePath.indexOf('images/') !== -1){
                imagePath = imagePath.split('/')[1];
            }
            path = this.assetsPath + imagePath;
        } else {
            path = this.path;
            path += assetData.u ? assetData.u : '';
            path += assetData.p;
        }
        return path;
    };

    AnimationItem.prototype.getAssetData = function (id) {
        var i = 0, len = this.assets.length;
        while (i < len) {
            if(id == this.assets[i].id){
                return this.assets[i];
            }
            i += 1;
        }
    };

    AnimationItem.prototype.hide = function () {
        this.renderer.hide();
    };

    AnimationItem.prototype.show = function () {
        this.renderer.show();
    };

    AnimationItem.prototype.getAssets = function () {
        return this.assets;
    };

    AnimationItem.prototype.trigger = function(name){
        if(this._cbs && this._cbs[name]){
            switch(name){
                case 'enterFrame':
                    this.triggerEvent(name,new BMEnterFrameEvent(name,this.currentFrame,this.totalFrames,this.frameMult));
                    break;
                case 'loopComplete':
                    this.triggerEvent(name,new BMCompleteLoopEvent(name,this.loop,this.playCount,this.frameMult));
                    break;
                case 'complete':
                    this.triggerEvent(name,new BMCompleteEvent(name,this.frameMult));
                    break;
                case 'segmentStart':
                    this.triggerEvent(name,new BMSegmentStartEvent(name,this.firstFrame,this.totalFrames));
                    break;
                case 'destroy':
                    this.triggerEvent(name,new BMDestroyEvent(name,this));
                    break;
                default:
                    this.triggerEvent(name);
            }
        }
        if(name === 'enterFrame' && this.onEnterFrame){
            this.onEnterFrame.call(this,new BMEnterFrameEvent(name,this.currentFrame,this.totalFrames,this.frameMult));
        }
        if(name === 'loopComplete' && this.onLoopComplete){
            this.onLoopComplete.call(this,new BMCompleteLoopEvent(name,this.loop,this.playCount,this.frameMult));
        }
        if(name === 'complete' && this.onComplete){
            this.onComplete.call(this,new BMCompleteEvent(name,this.frameMult));
        }
        if(name === 'segmentStart' && this.onSegmentStart){
            this.onSegmentStart.call(this,new BMSegmentStartEvent(name,this.firstFrame,this.totalFrames));
        }
        if(name === 'destroy' && this.onDestroy){
            this.onDestroy.call(this,new BMDestroyEvent(name,this));
        }
    };

    AnimationItem.prototype.addEventListener = _addEventListener;
    AnimationItem.prototype.removeEventListener = _removeEventListener;
    AnimationItem.prototype.triggerEvent = _triggerEvent;

    function CanvasRenderer(animationItem, config){
        this.animationItem = animationItem;
        this.renderConfig = {
            clearCanvas: (config && config.clearCanvas !== undefined) ? config.clearCanvas : true,
            context: (config && config.context) || null,
            progressiveLoad: (config && config.progressiveLoad) || false,
            preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet'
        };
        this.renderConfig.dpr = (config && config.dpr) || 1;
        if (this.animationItem.wrapper) {
            this.renderConfig.dpr = (config && config.dpr) || window.devicePixelRatio || 1;
        }
        this.renderedFrame = -1;
        this.globalData = {
            frameNum: -1
        };
        this.contextData = {
            saved : Array.apply(null,{length:15}),
            savedOp: Array.apply(null,{length:15}),
            cArrPos : 0,
            cTr : new Matrix(),
            cO : 1
        };
        var i, len = 15;
        for(i=0;i<len;i+=1){
            this.contextData.saved[i] = Array.apply(null,{length:16});
        }
        this.elements = [];
        this.pendingElements = [];
        this.transformMat = new Matrix();
        this.completeLayers = false;
    }
    extendPrototype(BaseRenderer,CanvasRenderer);

    CanvasRenderer.prototype.createBase = function (data) {
        return new CVBaseElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.createShape = function (data) {
        return new CVShapeElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.createText = function (data) {
        return new CVTextElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.createImage = function (data) {
        return new CVImageElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.createComp = function (data) {
        return new CVCompElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.createSolid = function (data) {
        return new CVSolidElement(data, this, this.globalData);
    };

    CanvasRenderer.prototype.ctxTransform = function(props){
        if(props[0] === 1 && props[1] === 0 && props[4] === 0 && props[5] === 1 && props[12] === 0 && props[13] === 0){
            return;
        }
        if(!this.renderConfig.clearCanvas){
            this.canvasContext.transform(props[0],props[1],props[4],props[5],props[12],props[13]);
            return;
        }
        this.transformMat.cloneFromProps(props);
        this.transformMat.transform(this.contextData.cTr.props[0],this.contextData.cTr.props[1],this.contextData.cTr.props[2],this.contextData.cTr.props[3],this.contextData.cTr.props[4],this.contextData.cTr.props[5],this.contextData.cTr.props[6],this.contextData.cTr.props[7],this.contextData.cTr.props[8],this.contextData.cTr.props[9],this.contextData.cTr.props[10],this.contextData.cTr.props[11],this.contextData.cTr.props[12],this.contextData.cTr.props[13],this.contextData.cTr.props[14],this.contextData.cTr.props[15])
        //this.contextData.cTr.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
        this.contextData.cTr.cloneFromProps(this.transformMat.props);
        var trProps = this.contextData.cTr.props;
        this.canvasContext.setTransform(trProps[0],trProps[1],trProps[4],trProps[5],trProps[12],trProps[13]);
    };

    CanvasRenderer.prototype.ctxOpacity = function(op){
        if(op === 1){
            return;
        }
        if(!this.renderConfig.clearCanvas){
            this.canvasContext.globalAlpha *= op < 0 ? 0 : op;
            return;
        }
        this.contextData.cO *= op < 0 ? 0 : op;
        this.canvasContext.globalAlpha = this.contextData.cO;
    };

    CanvasRenderer.prototype.reset = function(){
        if(!this.renderConfig.clearCanvas){
            this.canvasContext.restore();
            return;
        }
        this.contextData.cArrPos = 0;
        this.contextData.cTr.reset();
        this.contextData.cO = 1;
    };

    CanvasRenderer.prototype.save = function(actionFlag){
        if(!this.renderConfig.clearCanvas){
            this.canvasContext.save();
            return;
        }
        if(actionFlag){
            this.canvasContext.save();
        }
        var props = this.contextData.cTr.props;
        if(this.contextData.saved[this.contextData.cArrPos] === null || this.contextData.saved[this.contextData.cArrPos] === undefined){
            this.contextData.saved[this.contextData.cArrPos] = new Array(16);
        }
        var i,arr = this.contextData.saved[this.contextData.cArrPos];
        for(i=0;i<16;i+=1){
            arr[i] = props[i];
        }
        this.contextData.savedOp[this.contextData.cArrPos] = this.contextData.cO;
        this.contextData.cArrPos += 1;
    };

    CanvasRenderer.prototype.restore = function(actionFlag){
        if(!this.renderConfig.clearCanvas){
            this.canvasContext.restore();
            return;
        }
        if(actionFlag){
            this.canvasContext.restore();
        }
        this.contextData.cArrPos -= 1;
        var popped = this.contextData.saved[this.contextData.cArrPos];
        var i,arr = this.contextData.cTr.props;
        for(i=0;i<16;i+=1){
            arr[i] = popped[i];
        }
        this.canvasContext.setTransform(popped[0],popped[1],popped[4],popped[5],popped[12],popped[13]);
        popped = this.contextData.savedOp[this.contextData.cArrPos];
        this.contextData.cO = popped;
        this.canvasContext.globalAlpha = popped;
    };

    CanvasRenderer.prototype.configAnimation = function(animData){
        if(this.animationItem.wrapper){
            this.animationItem.container = document.createElement('canvas');
            this.animationItem.container.style.width = '100%';
            this.animationItem.container.style.height = '100%';
            //this.animationItem.container.style.transform = 'translate3d(0,0,0)';
            //this.animationItem.container.style.webkitTransform = 'translate3d(0,0,0)';
            this.animationItem.container.style.transformOrigin = this.animationItem.container.style.mozTransformOrigin = this.animationItem.container.style.webkitTransformOrigin = this.animationItem.container.style['-webkit-transform'] = "0px 0px 0px";
            this.animationItem.wrapper.appendChild(this.animationItem.container);
            this.canvasContext = this.animationItem.container.getContext('2d');
        }else{
            this.canvasContext = this.renderConfig.context;
        }
        this.globalData.canvasContext = this.canvasContext;
        this.globalData.renderer = this;
        this.globalData.isDashed = false;
        this.globalData.totalFrames = Math.floor(animData.tf);
        this.globalData.compWidth = animData.w;
        this.globalData.compHeight = animData.h;
        this.globalData.frameRate = animData.fr;
        this.globalData.frameId = 0;
        this.globalData.compSize = {
            w: animData.w,
            h: animData.h
        };
        this.globalData.progressiveLoad = this.renderConfig.progressiveLoad;
        this.layers = animData.layers;
        this.transformCanvas = {};
        this.transformCanvas.w = animData.w;
        this.transformCanvas.h = animData.h;
        this.globalData.fontManager = new FontManager();
        this.globalData.fontManager.addChars(animData.chars);
        this.globalData.fontManager.addFonts(animData.fonts,document.body);
        this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
        this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
        this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
        this.globalData.addPendingElement = this.animationItem.addPendingElement.bind(this.animationItem);
        this.globalData.transformCanvas = this.transformCanvas;
        this.elements = Array.apply(null,{length:animData.layers.length});

        this.updateContainerSize();
    };

    CanvasRenderer.prototype.updateContainerSize = function () {
        var elementWidth,elementHeight;
        if(this.animationItem.wrapper && this.animationItem.container){
            elementWidth = this.animationItem.wrapper.offsetWidth;
            elementHeight = this.animationItem.wrapper.offsetHeight;
            this.animationItem.container.setAttribute('width',elementWidth * this.renderConfig.dpr );
            this.animationItem.container.setAttribute('height',elementHeight * this.renderConfig.dpr);
        }else{
            elementWidth = this.canvasContext.canvas.width * this.renderConfig.dpr;
            elementHeight = this.canvasContext.canvas.height * this.renderConfig.dpr;
        }
        var elementRel,animationRel;
        if(this.renderConfig.preserveAspectRatio.indexOf('meet') !== -1 || this.renderConfig.preserveAspectRatio.indexOf('slice') !== -1){
            var par = this.renderConfig.preserveAspectRatio.split(' ');
            var fillType = par[1] || 'meet';
            var pos = par[0] || 'xMidYMid';
            var xPos = pos.substr(0,4);
            var yPos = pos.substr(4);
            elementRel = elementWidth/elementHeight;
            animationRel = this.transformCanvas.w/this.transformCanvas.h;
            if(animationRel>elementRel && fillType === 'meet' || animationRel<elementRel && fillType === 'slice'){
                this.transformCanvas.sx = elementWidth/(this.transformCanvas.w/this.renderConfig.dpr);
                this.transformCanvas.sy = elementWidth/(this.transformCanvas.w/this.renderConfig.dpr);
            }else{
                this.transformCanvas.sx = elementHeight/(this.transformCanvas.h / this.renderConfig.dpr);
                this.transformCanvas.sy = elementHeight/(this.transformCanvas.h / this.renderConfig.dpr);
            }

            if(xPos === 'xMid' && ((animationRel<elementRel && fillType==='meet') || (animationRel>elementRel && fillType === 'slice'))){
                this.transformCanvas.tx = (elementWidth-this.transformCanvas.w*(elementHeight/this.transformCanvas.h))/2*this.renderConfig.dpr;
            } else if(xPos === 'xMax' && ((animationRel<elementRel && fillType==='meet') || (animationRel>elementRel && fillType === 'slice'))){
                this.transformCanvas.tx = (elementWidth-this.transformCanvas.w*(elementHeight/this.transformCanvas.h))*this.renderConfig.dpr;
            } else {
                this.transformCanvas.tx = 0;
            }
            if(yPos === 'YMid' && ((animationRel>elementRel && fillType==='meet') || (animationRel<elementRel && fillType === 'slice'))){
                this.transformCanvas.ty = ((elementHeight-this.transformCanvas.h*(elementWidth/this.transformCanvas.w))/2)*this.renderConfig.dpr;
            } else if(yPos === 'YMax' && ((animationRel>elementRel && fillType==='meet') || (animationRel<elementRel && fillType === 'slice'))){
                this.transformCanvas.ty = ((elementHeight-this.transformCanvas.h*(elementWidth/this.transformCanvas.w)))*this.renderConfig.dpr;
            } else {
                this.transformCanvas.ty = 0;
            }

        }else if(this.renderConfig.preserveAspectRatio == 'none'){
            this.transformCanvas.sx = elementWidth/(this.transformCanvas.w/this.renderConfig.dpr);
            this.transformCanvas.sy = elementHeight/(this.transformCanvas.h/this.renderConfig.dpr);
            this.transformCanvas.tx = 0;
            this.transformCanvas.ty = 0;
        }else{
            this.transformCanvas.sx = this.renderConfig.dpr;
            this.transformCanvas.sy = this.renderConfig.dpr;
            this.transformCanvas.tx = 0;
            this.transformCanvas.ty = 0;
        }
        this.transformCanvas.props = [this.transformCanvas.sx,0,0,0,0,this.transformCanvas.sy,0,0,0,0,1,0,this.transformCanvas.tx,this.transformCanvas.ty,0,1];
        var i, len = this.elements.length;
        for(i=0;i<len;i+=1){
            if(this.elements[i] && this.elements[i].data.ty === 0){
                this.elements[i].resize(this.globalData.transformCanvas);
            }
        }
    };

    CanvasRenderer.prototype.destroy = function () {
        if(this.renderConfig.clearCanvas) {
            this.animationItem.wrapper.innerHTML = '';
        }
        var i, len = this.layers ? this.layers.length : 0;
        for (i = len - 1; i >= 0; i-=1) {
            this.elements[i].destroy();
        }
        this.elements.length = 0;
        this.globalData.canvasContext = null;
        this.animationItem.container = null;
        this.destroyed = true;
    };

    CanvasRenderer.prototype.renderFrame = function(num){
        if((this.renderedFrame == num && this.renderConfig.clearCanvas === true) || this.destroyed || num === null){
            return;
        }
        this.renderedFrame = num;
        this.globalData.frameNum = num - this.animationItem.firstFrame;
        this.globalData.frameId += 1;
        this.globalData.projectInterface.currentFrame = num;
        if(this.renderConfig.clearCanvas === true){
            this.reset();
            this.canvasContext.save();
            //this.canvasContext.canvas.width = this.canvasContext.canvas.width;
            this.canvasContext.clearRect(this.transformCanvas.tx, this.transformCanvas.ty, this.transformCanvas.w*this.transformCanvas.sx, this.transformCanvas.h*this.transformCanvas.sy);
        }else{
            this.save();
        }
        this.ctxTransform(this.transformCanvas.props);
        this.canvasContext.beginPath();
        this.canvasContext.rect(0,0,this.transformCanvas.w,this.transformCanvas.h);
        this.canvasContext.closePath();
        this.canvasContext.clip();

        //console.log('--------');
        //console.log('NEW: ',num);
        var i, len = this.layers.length;
        if(!this.completeLayers){
            this.checkLayers(num);
        }

        for (i = 0; i < len; i++) {
            if(this.completeLayers || this.elements[i]){
                this.elements[i].prepareFrame(num - this.layers[i].st);
            }
        }
        for (i = len - 1; i >= 0; i-=1) {
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
        if(this.renderConfig.clearCanvas !== true){
            this.restore();
        } else {
            this.canvasContext.restore();
        }
    };

    CanvasRenderer.prototype.buildItem = function(pos){
        var elements = this.elements;
        if(elements[pos] || this.layers[pos].ty == 99){
            return;
        }
        var element = this.createItem(this.layers[pos], this,this.globalData);
        elements[pos] = element;
        element.initExpressions();
        if(this.layers[pos].ty === 0){
            element.resize(this.globalData.transformCanvas);
        }
    };

    CanvasRenderer.prototype.checkPendingElements  = function(){
        while(this.pendingElements.length){
            var element = this.pendingElements.pop();
            element.checkParenting();
        }
    };

    CanvasRenderer.prototype.hide = function(){
        this.animationItem.container.style.display = 'none';
    };

    CanvasRenderer.prototype.show = function(){
        this.animationItem.container.style.display = 'block';
    };

    CanvasRenderer.prototype.searchExtraCompositions = function(assets){
        var i, len = assets.length;
        var floatingContainer = document.createElementNS(svgNS,'g');
        for(i=0;i<len;i+=1){
            if(assets[i].xt){
                var comp = this.createComp(assets[i],this.globalData.comp,this.globalData);
                comp.initExpressions();
                //comp.compInterface = CompExpressionInterface(comp);
                //Expressions.addLayersInterface(comp.elements, this.globalData.projectInterface);
                this.globalData.projectInterface.registerComposition(comp);
            }
        }
    };
    function HybridRenderer(animationItem){
        this.animationItem = animationItem;
        this.layers = null;
        this.renderedFrame = -1;
        this.globalData = {
            frameNum: -1
        };
        this.pendingElements = [];
        this.elements = [];
        this.threeDElements = [];
        this.destroyed = false;
        this.camera = null;
        this.supports3d = true;

    }

    extendPrototype(BaseRenderer,HybridRenderer);

    HybridRenderer.prototype.buildItem = SVGRenderer.prototype.buildItem;

    HybridRenderer.prototype.checkPendingElements  = function(){
        while(this.pendingElements.length){
            var element = this.pendingElements.pop();
            element.checkParenting();
        }
    };

    HybridRenderer.prototype.appendElementInPos = function(element, pos){
        var newElement = element.getBaseElement();
        if(!newElement){
            return;
        }
        var layer = this.layers[pos];
        if(!layer.ddd || !this.supports3d){
            var i = 0;
            var nextElement;
            while(i<pos){
                if(this.elements[i] && this.elements[i]!== true && this.elements[i].getBaseElement){
                    nextElement = this.elements[i].getBaseElement();
                }
                i += 1;
            }
            if(nextElement){
                if(!layer.ddd || !this.supports3d){
                    this.layerElement.insertBefore(newElement, nextElement);
                }
            } else {
                if(!layer.ddd || !this.supports3d){
                    this.layerElement.appendChild(newElement);
                }
            }
        } else {
            this.addTo3dContainer(newElement,pos);
        }
    };


    HybridRenderer.prototype.createBase = function (data) {
        return new SVGBaseElement(data, this.layerElement,this.globalData,this);
    };

    HybridRenderer.prototype.createShape = function (data) {
        if(!this.supports3d){
            return new IShapeElement(data, this.layerElement,this.globalData,this);
        }
        return new HShapeElement(data, this.layerElement,this.globalData,this);
    };

    HybridRenderer.prototype.createText = function (data) {
        if(!this.supports3d){
            return new SVGTextElement(data, this.layerElement,this.globalData,this);
        }
        return new HTextElement(data, this.layerElement,this.globalData,this);
    };

    HybridRenderer.prototype.createCamera = function (data) {
        this.camera = new HCameraElement(data, this.layerElement,this.globalData,this);
        return this.camera;
    };

    HybridRenderer.prototype.createImage = function (data) {
        if(!this.supports3d){
            return new IImageElement(data, this.layerElement,this.globalData,this);
        }
        return new HImageElement(data, this.layerElement,this.globalData,this);
    };

    HybridRenderer.prototype.createComp = function (data) {
        if(!this.supports3d){
            return new ICompElement(data, this.layerElement,this.globalData,this);
        }
        return new HCompElement(data, this.layerElement,this.globalData,this);

    };

    HybridRenderer.prototype.createSolid = function (data) {
        if(!this.supports3d){
            return new ISolidElement(data, this.layerElement,this.globalData,this);
        }
        return new HSolidElement(data, this.layerElement,this.globalData,this);
    };

    HybridRenderer.prototype.getThreeDContainer = function(pos){
        var perspectiveElem = document.createElement('div');
        styleDiv(perspectiveElem);
        perspectiveElem.style.width = this.globalData.compSize.w+'px';
        perspectiveElem.style.height = this.globalData.compSize.h+'px';
        perspectiveElem.style.transformOrigin = perspectiveElem.style.mozTransformOrigin = perspectiveElem.style.webkitTransformOrigin = "50% 50%";
        var container = document.createElement('div');
        styleDiv(container);
        container.style.transform = container.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
        perspectiveElem.appendChild(container);
        this.resizerElem.appendChild(perspectiveElem);
        var threeDContainerData = {
            container:container,
            perspectiveElem:perspectiveElem,
            startPos: pos,
            endPos: pos
        };
        this.threeDElements.push(threeDContainerData);
        return threeDContainerData;
    };

    HybridRenderer.prototype.build3dContainers = function(){
        var i, len = this.layers.length;
        var lastThreeDContainerData;
        for(i=0;i<len;i+=1){
            if(this.layers[i].ddd){
                if(!lastThreeDContainerData){
                    lastThreeDContainerData = this.getThreeDContainer(i);
                }
                lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos,i);
            } else {
                lastThreeDContainerData = null;
            }
        }
    };

    HybridRenderer.prototype.addTo3dContainer = function(elem,pos){
        var i = 0, len = this.threeDElements.length;
        while(i<len){
            if(pos <= this.threeDElements[i].endPos){
                var j = this.threeDElements[i].startPos;
                var nextElement;
                while(j<pos){
                    if(this.elements[j] && this.elements[j].getBaseElement){
                        nextElement = this.elements[j].getBaseElement();
                    }
                    j += 1;
                }
                if(nextElement){
                    this.threeDElements[i].container.insertBefore(elem, nextElement);
                } else {
                    this.threeDElements[i].container.appendChild(elem);
                }
                break;
            }
            i += 1;
        }
    };

    HybridRenderer.prototype.configAnimation = function(animData){
        var resizerElem = document.createElement('div');
        var wrapper = this.animationItem.wrapper;
        resizerElem.style.width = animData.w+'px';
        resizerElem.style.height = animData.h+'px';
        this.resizerElem = resizerElem;
        styleDiv(resizerElem);
        resizerElem.style.transformStyle = resizerElem.style.webkitTransformStyle = resizerElem.style.mozTransformStyle = "flat";
        wrapper.appendChild(resizerElem);

        resizerElem.style.overflow = 'hidden';
        var svg = document.createElementNS(svgNS,'svg');
        svg.setAttribute('width','1');
        svg.setAttribute('height','1');
        styleDiv(svg);
        this.resizerElem.appendChild(svg);
        var defs = document.createElementNS(svgNS,'defs');
        svg.appendChild(defs);
        this.globalData.defs = defs;
        //Mask animation
        this.globalData.getAssetData = this.animationItem.getAssetData.bind(this.animationItem);
        this.globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem);
        this.globalData.elementLoaded = this.animationItem.elementLoaded.bind(this.animationItem);
        this.globalData.frameId = 0;
        this.globalData.compSize = {
            w: animData.w,
            h: animData.h
        };
        this.globalData.frameRate = animData.fr;
        this.layers = animData.layers;
        this.globalData.fontManager = new FontManager();
        this.globalData.fontManager.addChars(animData.chars);
        this.globalData.fontManager.addFonts(animData.fonts,svg);
        this.layerElement = this.resizerElem;
        this.build3dContainers();
        this.updateContainerSize();
    };

    HybridRenderer.prototype.destroy = function () {
        this.animationItem.wrapper.innerHTML = '';
        this.animationItem.container = null;
        this.globalData.defs = null;
        var i, len = this.layers ? this.layers.length : 0;
        for (i = 0; i < len; i++) {
            this.elements[i].destroy();
        }
        this.elements.length = 0;
        this.destroyed = true;
        this.animationItem = null;
    };

    HybridRenderer.prototype.updateContainerSize = function () {
        var elementWidth = this.animationItem.wrapper.offsetWidth;
        var elementHeight = this.animationItem.wrapper.offsetHeight;
        var elementRel = elementWidth/elementHeight;
        var animationRel = this.globalData.compSize.w/this.globalData.compSize.h;
        var sx,sy,tx,ty;
        if(animationRel>elementRel){
            sx = elementWidth/(this.globalData.compSize.w);
            sy = elementWidth/(this.globalData.compSize.w);
            tx = 0;
            ty = ((elementHeight-this.globalData.compSize.h*(elementWidth/this.globalData.compSize.w))/2);
        }else{
            sx = elementHeight/(this.globalData.compSize.h);
            sy = elementHeight/(this.globalData.compSize.h);
            tx = (elementWidth-this.globalData.compSize.w*(elementHeight/this.globalData.compSize.h))/2;
            ty = 0;
        }
        this.resizerElem.style.transform = this.resizerElem.style.webkitTransform = 'matrix3d(' + sx + ',0,0,0,0,'+sy+',0,0,0,0,1,0,'+tx+','+ty+',0,1)';
    };

    HybridRenderer.prototype.renderFrame = SVGRenderer.prototype.renderFrame;

    HybridRenderer.prototype.hide = function(){
        this.resizerElem.style.display = 'none';
    };

    HybridRenderer.prototype.show = function(){
        this.resizerElem.style.display = 'block';
    };

    HybridRenderer.prototype.initItems = function(){
        this.buildAllItems();
        if(this.camera){
            this.camera.setup();
        } else {
            var cWidth = this.globalData.compSize.w;
            var cHeight = this.globalData.compSize.h;
            var i, len = this.threeDElements.length;
            for(i=0;i<len;i+=1){
                this.threeDElements[i].perspectiveElem.style.perspective = this.threeDElements[i].perspectiveElem.style.webkitPerspective = Math.sqrt(Math.pow(cWidth,2) + Math.pow(cHeight,2)) + 'px';
            }
        }
    };

    HybridRenderer.prototype.searchExtraCompositions = function(assets){
        var i, len = assets.length;
        var floatingContainer = document.createElement('div');
        for(i=0;i<len;i+=1){
            if(assets[i].xt){
                var comp = this.createComp(assets[i],floatingContainer,this.globalData.comp,null);
                comp.initExpressions();
                this.globalData.projectInterface.registerComposition(comp);
            }
        }
    };
    function CVBaseElement(data, comp,globalData){
        this.globalData = globalData;
        this.data = data;
        this.comp = comp;
        this.canvasContext = globalData.canvasContext;
        this.init();
    }

    createElement(BaseElement, CVBaseElement);

    CVBaseElement.prototype.createElements = function(){
        this.checkParenting();
    };

    CVBaseElement.prototype.checkBlendMode = function(globalData){
        if(globalData.blendMode !== this.data.bm) {
            globalData.blendMode = this.data.bm;

            var blendModeValue = '';
            switch (this.data.bm) {
                case 0:
                    blendModeValue = 'normal';
                    break;
                case 1:
                    blendModeValue = 'multiply';
                    break;
                case 2:
                    blendModeValue = 'screen';
                    break;
                case 3:
                    blendModeValue = 'overlay';
                    break;
                case 4:
                    blendModeValue = 'darken';
                    break;
                case 5:
                    blendModeValue = 'lighten';
                    break;
                case 6:
                    blendModeValue = 'color-dodge';
                    break;
                case 7:
                    blendModeValue = 'color-burn';
                    break;
                case 8:
                    blendModeValue = 'hard-light';
                    break;
                case 9:
                    blendModeValue = 'soft-light';
                    break;
                case 10:
                    blendModeValue = 'difference';
                    break;
                case 11:
                    blendModeValue = 'exclusion';
                    break;
                case 12:
                    blendModeValue = 'hue';
                    break;
                case 13:
                    blendModeValue = 'saturation';
                    break;
                case 14:
                    blendModeValue = 'color';
                    break;
                case 15:
                    blendModeValue = 'luminosity';
                    break;
            }
            globalData.canvasContext.globalCompositeOperation = blendModeValue;
        }
    };


    CVBaseElement.prototype.renderFrame = function(parentTransform){
        if(this.data.ty === 3){
            return false;
        }
        this.checkBlendMode(this.data.ty === 0?this.parentGlobalData:this.globalData);

        if(!this.isVisible){
            return this.isVisible;
        }
        this.finalTransform.opMdf = this.finalTransform.op.mdf;
        this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
        this.finalTransform.opacity = this.finalTransform.op.v;

        var mat;
        var finalMat = this.finalTransform.mat;

        if(this.hierarchy){
            var i, len = this.hierarchy.length;
            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
            for(i=0;i<len;i+=1){
                this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
                mat = this.hierarchy[i].finalTransform.mProp.v.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            }
        }else{
            if(!parentTransform){
                finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
            }else{
                mat = this.finalTransform.mProp.v.props;
                finalMat.cloneFromProps(mat);
            }
        }

        if(parentTransform){
            mat = parentTransform.mat.props;
            finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            this.finalTransform.opacity *= parentTransform.opacity;
            this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
            this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
        }

        if(this.data.hasMask){
            this.globalData.renderer.save(true);
            this.maskManager.renderFrame(this.data.ty === 0?null:finalMat);
        }
        if(this.data.hd){
            this.isVisible = false;
        }
        return this.isVisible;

    };

    CVBaseElement.prototype.addMasks = function(data){
        this.maskManager = new CVMaskElement(data,this,this.globalData);
    };


    CVBaseElement.prototype.destroy = function(){
        this.canvasContext = null;
        this.data = null;
        this.globalData = null;
        if(this.maskManager) {
            this.maskManager.destroy();
        }
    };

    CVBaseElement.prototype.mHelper = new Matrix();

    function CVCompElement(data, comp,globalData){
        this._parent.constructor.call(this,data, comp,globalData);
        var compGlobalData = {};
        for(var s in globalData){
            if(globalData.hasOwnProperty(s)){
                compGlobalData[s] = globalData[s];
            }
        }
        compGlobalData.renderer = this;
        compGlobalData.compHeight = this.data.h;
        compGlobalData.compWidth = this.data.w;
        this.renderConfig = {
            clearCanvas: true
        };
        this.contextData = {
            saved : Array.apply(null,{length:15}),
            savedOp: Array.apply(null,{length:15}),
            cArrPos : 0,
            cTr : new Matrix(),
            cO : 1
        };
        this.completeLayers = false;
        var i, len = 15;
        for(i=0;i<len;i+=1){
            this.contextData.saved[i] = Array.apply(null,{length:16});
        }
        this.transformMat = new Matrix();
        this.parentGlobalData = this.globalData;
        var cv = document.createElement('canvas');
        //document.body.appendChild(cv);
        compGlobalData.canvasContext = cv.getContext('2d');
        this.canvasContext = compGlobalData.canvasContext;
        cv.width = this.data.w;
        cv.height = this.data.h;
        this.canvas = cv;
        this.globalData = compGlobalData;
        this.layers = data.layers;
        this.pendingElements = [];
        this.elements = Array.apply(null,{length:this.layers.length});
        if(this.data.tm){
            this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
        }
        if(this.data.xt || !globalData.progressiveLoad){
            this.buildAllItems();
        }
    }
    createElement(CVBaseElement, CVCompElement);

    CVCompElement.prototype.ctxTransform = CanvasRenderer.prototype.ctxTransform;
    CVCompElement.prototype.ctxOpacity = CanvasRenderer.prototype.ctxOpacity;
    CVCompElement.prototype.save = CanvasRenderer.prototype.save;
    CVCompElement.prototype.restore = CanvasRenderer.prototype.restore;
    CVCompElement.prototype.reset =  function(){
        this.contextData.cArrPos = 0;
        this.contextData.cTr.reset();
        this.contextData.cO = 1;
    };
    CVCompElement.prototype.resize = function(transformCanvas){
        var maxScale = Math.max(transformCanvas.sx,transformCanvas.sy);
        this.canvas.width = this.data.w*maxScale;
        this.canvas.height = this.data.h*maxScale;
        this.transformCanvas = {
            sc:maxScale,
            w:this.data.w*maxScale,
            h:this.data.h*maxScale,
            props:[maxScale,0,0,0,0,maxScale,0,0,0,0,1,0,0,0,0,1]
        }
        var i,len = this.elements.length;
        for( i = 0; i < len; i+=1 ){
            if(this.elements[i] && this.elements[i].data.ty === 0){
                this.elements[i].resize(transformCanvas);
            }
        }
    };

    CVCompElement.prototype.prepareFrame = function(num){
        this.globalData.frameId = this.parentGlobalData.frameId;
        this.globalData.mdf = false;
        this._parent.prepareFrame.call(this,num);
        if(this.isVisible===false && !this.data.xt){
            return;
        }
        var timeRemapped = num;
        if(this.tm){
            timeRemapped = this.tm.v;
            if(timeRemapped === this.data.op){
                timeRemapped = this.data.op - 1;
            }
        }
        this.renderedFrame = timeRemapped/this.data.sr;
        var i,len = this.elements.length;

        if(!this.completeLayers){
            this.checkLayers(num);
        }

        for( i = 0; i < len; i+=1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].prepareFrame(timeRemapped/this.data.sr - this.layers[i].st);
                if(this.elements[i].data.ty === 0 && this.elements[i].globalData.mdf){
                    this.globalData.mdf = true;
                }
            }
        }
        if(this.globalData.mdf && !this.data.xt){
            this.canvasContext.clearRect(0, 0, this.data.w, this.data.h);
            this.ctxTransform(this.transformCanvas.props);
        }
    };

    CVCompElement.prototype.renderFrame = function(parentMatrix){
        if(this._parent.renderFrame.call(this,parentMatrix)===false){
            return;
        }
        if(this.globalData.mdf){
            var i,len = this.layers.length;
            for( i = len - 1; i >= 0; i -= 1 ){
                if(this.completeLayers || this.elements[i]){
                    this.elements[i].renderFrame();
                }
            }
        }
        if(this.data.hasMask){
            this.globalData.renderer.restore(true);
        }
        if(this.firstFrame){
            this.firstFrame = false;
        }
        this.parentGlobalData.renderer.save();
        this.parentGlobalData.renderer.ctxTransform(this.finalTransform.mat.props);
        this.parentGlobalData.renderer.ctxOpacity(this.finalTransform.opacity);
        this.parentGlobalData.renderer.canvasContext.drawImage(this.canvas,0,0,this.data.w,this.data.h);
        this.parentGlobalData.renderer.restore();

        if(this.globalData.mdf){
            this.reset();
        }
    };

    CVCompElement.prototype.setElements = function(elems){
        this.elements = elems;
    };

    CVCompElement.prototype.getElements = function(){
        return this.elements;
    };

    CVCompElement.prototype.destroy = function(){
        var i,len = this.layers.length;
        for( i = len - 1; i >= 0; i -= 1 ){
            this.elements[i].destroy();
        }
        this.layers = null;
        this.elements = null;
        this._parent.destroy.call(this._parent);
    };
    CVCompElement.prototype.checkLayers = CanvasRenderer.prototype.checkLayers;
    CVCompElement.prototype.buildItem = CanvasRenderer.prototype.buildItem;
    CVCompElement.prototype.checkPendingElements = CanvasRenderer.prototype.checkPendingElements;
    CVCompElement.prototype.addPendingElement = CanvasRenderer.prototype.addPendingElement;
    CVCompElement.prototype.buildAllItems = CanvasRenderer.prototype.buildAllItems;
    CVCompElement.prototype.createItem = CanvasRenderer.prototype.createItem;
    CVCompElement.prototype.createImage = CanvasRenderer.prototype.createImage;
    CVCompElement.prototype.createComp = CanvasRenderer.prototype.createComp;
    CVCompElement.prototype.createSolid = CanvasRenderer.prototype.createSolid;
    CVCompElement.prototype.createShape = CanvasRenderer.prototype.createShape;
    CVCompElement.prototype.createText = CanvasRenderer.prototype.createText;
    CVCompElement.prototype.createBase = CanvasRenderer.prototype.createBase;
    CVCompElement.prototype.buildElementParenting = CanvasRenderer.prototype.buildElementParenting;
    function CVImageElement(data, comp,globalData){
        this.assetData = globalData.getAssetData(data.refId);
        this._parent.constructor.call(this,data, comp,globalData);
        this.globalData.addPendingElement();
    }
    createElement(CVBaseElement, CVImageElement);

    CVImageElement.prototype.createElements = function(){
        var imageLoaded = function(){
            this.globalData.elementLoaded();
            if(this.assetData.w !== this.img.width || this.assetData.h !== this.img.height){
                var canvas = document.createElement('canvas');
                canvas.width = this.assetData.w;
                canvas.height = this.assetData.h;
                var ctx = canvas.getContext('2d');

                var imgW = this.img.width;
                var imgH = this.img.height;
                var imgRel = imgW / imgH;
                var canvasRel = this.assetData.w/this.assetData.h;
                var widthCrop, heightCrop;
                if(imgRel>canvasRel){
                    heightCrop = imgH;
                    widthCrop = heightCrop*canvasRel;
                } else {
                    widthCrop = imgW;
                    heightCrop = widthCrop/canvasRel;
                }
                ctx.drawImage(this.img,(imgW-widthCrop)/2,(imgH-heightCrop)/2,widthCrop,heightCrop,0,0,this.assetData.w,this.assetData.h);
                this.img = canvas;
            }
        }.bind(this);
        var imageFailed = function(){
            this.failed = true;
            this.globalData.elementLoaded();
        }.bind(this);

        this.img = new Image();
        this.img.addEventListener('load', imageLoaded, false);
        this.img.addEventListener('error', imageFailed, false);
        var assetPath = this.globalData.getAssetsPath(this.assetData);
        this.img.src = assetPath;

        this._parent.createElements.call(this);

    };

    CVImageElement.prototype.renderFrame = function(parentMatrix){
        if(this.failed){
            return;
        }
        if(this._parent.renderFrame.call(this,parentMatrix)===false){
            return;
        }
        var ctx = this.canvasContext;
        this.globalData.renderer.save();
        var finalMat = this.finalTransform.mat.props;
        this.globalData.renderer.ctxTransform(finalMat);
        this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
        ctx.drawImage(this.img,0,0);
        this.globalData.renderer.restore(this.data.hasMask);
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };

    CVImageElement.prototype.destroy = function(){
        this.img = null;
        this._parent.destroy.call(this._parent);
    };

    function CVMaskElement(data,element){
        this.data = data;
        this.element = element;
        this.dynamicProperties = [];
        this.masksProperties = this.data.masksProperties;
        this.viewData = new Array(this.masksProperties.length);
        var i, len = this.masksProperties.length;
        for (i = 0; i < len; i++) {
            this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element,this.masksProperties[i],3,this.dynamicProperties,null);
        }
    }

    CVMaskElement.prototype.getMaskProperty = function(pos){
        return this.viewData[pos];
    };

    CVMaskElement.prototype.prepareFrame = function(num){
        var i, len = this.dynamicProperties.length;
        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue(num);
            if(this.dynamicProperties[i].mdf){
                this.element.globalData.mdf = true;
            }
        }
    };

    CVMaskElement.prototype.renderFrame = function (transform) {
        var ctx = this.element.canvasContext;
        var i, len = this.data.masksProperties.length;
        var pt,pt2,pt3,data, hasMasks = false;
        for (i = 0; i < len; i++) {
            if(this.masksProperties[i].mode === 'n'){
                continue;
            }
            if(hasMasks === false){
                ctx.beginPath();
                hasMasks = true;
            }
            if (this.masksProperties[i].inv) {
                ctx.moveTo(0, 0);
                ctx.lineTo(this.element.globalData.compWidth, 0);
                ctx.lineTo(this.element.globalData.compWidth, this.element.globalData.compHeight);
                ctx.lineTo(0, this.element.globalData.compHeight);
                ctx.lineTo(0, 0);
            }
            data = this.viewData[i].v;
            pt = transform ? transform.applyToPointArray(data.v[0][0],data.v[0][1],0):data.v[0];
            ctx.moveTo(pt[0], pt[1]);
            var j, jLen = data.v.length;
            for (j = 1; j < jLen; j++) {
                pt = transform ? transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0) : data.o[j - 1];
                pt2 = transform ? transform.applyToPointArray(data.i[j][0],data.i[j][1],0) : data.i[j];
                pt3 = transform ? transform.applyToPointArray(data.v[j][0],data.v[j][1],0) : data.v[j];
                ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
            }
            pt = transform ? transform.applyToPointArray(data.o[j - 1][0],data.o[j - 1][1],0) : data.o[j - 1];
            pt2 = transform ? transform.applyToPointArray(data.i[0][0],data.i[0][1],0) : data.i[0];
            pt3 = transform ? transform.applyToPointArray(data.v[0][0],data.v[0][1],0) : data.v[0];
            ctx.bezierCurveTo(pt[0], pt[1], pt2[0], pt2[1], pt3[0], pt3[1]);
        }
        if(hasMasks){
            ctx.clip();
        }
    };

    CVMaskElement.prototype.getMask = function(nm){
        var i = 0, len = this.masksProperties.length;
        while(i<len){
            if(this.masksProperties[i].nm === nm){
                return {
                    maskPath: this.viewData[i].pv
                }
            }
            i += 1;
        }
    };

    CVMaskElement.prototype.destroy = function(){
        this.element = null;
    };
    function CVShapeElement(data, comp,globalData){
        this.shapes = [];
        this.stylesList = [];
        this.viewData = [];
        this.shapeModifiers = [];
        this.shapesData = data.shapes;
        this.firstFrame = true;
        this._parent.constructor.call(this,data, comp,globalData);
    }
    createElement(CVBaseElement, CVShapeElement);

    CVShapeElement.prototype.lcEnum = {
        '1': 'butt',
        '2': 'round',
        '3': 'butt'
    }

    CVShapeElement.prototype.ljEnum = {
        '1': 'miter',
        '2': 'round',
        '3': 'butt'
    };
    CVShapeElement.prototype.transformHelper = {opacity:1,mat:new Matrix(),matMdf:false,opMdf:false};

    CVShapeElement.prototype.dashResetter = [];

    CVShapeElement.prototype.createElements = function(){

        this._parent.createElements.call(this);
        this.searchShapes(this.shapesData,this.viewData,this.dynamicProperties);
    };
    CVShapeElement.prototype.searchShapes = function(arr,data,dynamicProperties){
        var i, len = arr.length - 1;
        var j, jLen;
        var ownArrays = [], ownModifiers = [], styleElem;
        for(i=len;i>=0;i-=1){
            if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                styleElem = {
                    type: arr[i].ty,
                    elements: []
                };
                data[i] = {};
                if(arr[i].ty == 'fl' || arr[i].ty == 'st'){
                    data[i].c = PropertyFactory.getProp(this,arr[i].c,1,255,dynamicProperties);
                    if(!data[i].c.k){
                        styleElem.co = 'rgb('+bm_floor(data[i].c.v[0])+','+bm_floor(data[i].c.v[1])+','+bm_floor(data[i].c.v[2])+')';
                    }
                }
                data[i].o = PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties);
                if(arr[i].ty == 'st') {
                    styleElem.lc = this.lcEnum[arr[i].lc] || 'round';
                    styleElem.lj = this.ljEnum[arr[i].lj] || 'round';
                    if(arr[i].lj == 1) {
                        styleElem.ml = arr[i].ml;
                    }
                    data[i].w = PropertyFactory.getProp(this,arr[i].w,0,null,dynamicProperties);
                    if(!data[i].w.k){
                        styleElem.wi = data[i].w.v;
                    }
                    if(arr[i].d){
                        var d = PropertyFactory.getDashProp(this,arr[i].d,'canvas',dynamicProperties);
                        data[i].d = d;
                        if(!data[i].d.k){
                            styleElem.da = data[i].d.dasharray;
                            styleElem.do = data[i].d.dashoffset;
                        }
                    }

                }
                this.stylesList.push(styleElem);
                data[i].style = styleElem;
                ownArrays.push(data[i].style);
            }else if(arr[i].ty == 'gr'){
                data[i] = {
                    it: []
                };
                this.searchShapes(arr[i].it,data[i].it,dynamicProperties);
            }else if(arr[i].ty == 'tr'){
                data[i] = {
                    transform : {
                        mat: new Matrix(),
                        opacity: 1,
                        matMdf:false,
                        opMdf:false,
                        op: PropertyFactory.getProp(this,arr[i].o,0,0.01,dynamicProperties),
                        mProps: PropertyFactory.getProp(this,arr[i],2,null,dynamicProperties)
                    },
                    elements: []
                };
            }else if(arr[i].ty == 'sh' || arr[i].ty == 'rc' || arr[i].ty == 'el' || arr[i].ty == 'sr'){
                data[i] = {
                    nodes:[],
                    trNodes:[],
                    tr:[0,0,0,0,0,0]
                };
                var ty = 4;
                if(arr[i].ty == 'rc'){
                    ty = 5;
                }else if(arr[i].ty == 'el'){
                    ty = 6;
                }else if(arr[i].ty == 'sr'){
                    ty = 7;
                }
                data[i].sh = ShapePropertyFactory.getShapeProp(this,arr[i],ty,dynamicProperties);
                this.shapes.push(data[i].sh);
                this.addShapeToModifiers(data[i].sh);
                jLen = this.stylesList.length;
                var hasStrokes = false, hasFills = false;
                for(j=0;j<jLen;j+=1){
                    if(!this.stylesList[j].closed){
                        this.stylesList[j].elements.push(data[i]);
                        if(this.stylesList[j].type === 'st'){
                            hasStrokes = true;
                        }else{
                            hasFills = true;
                        }
                    }
                }
                data[i].st = hasStrokes;
                data[i].fl = hasFills;
            }else if(arr[i].ty == 'tm' || arr[i].ty == 'rd'){
                var modifier = ShapeModifiers.getModifier(arr[i].ty);
                modifier.init(this,arr[i],dynamicProperties);
                this.shapeModifiers.push(modifier);
                ownModifiers.push(modifier);
                data[i] = modifier;
            }
        }
        len = ownArrays.length;
        for(i=0;i<len;i+=1){
            ownArrays[i].closed = true;
        }
        len = ownModifiers.length;
        for(i=0;i<len;i+=1){
            ownModifiers[i].closed = true;
        }
    };

    CVShapeElement.prototype.addShapeToModifiers = IShapeElement.prototype.addShapeToModifiers;
    CVShapeElement.prototype.renderModifiers = IShapeElement.prototype.renderModifiers;

    CVShapeElement.prototype.renderFrame = function(parentMatrix){
        if(this._parent.renderFrame.call(this, parentMatrix)===false){
            return;
        }
        this.transformHelper.mat.reset();
        this.transformHelper.opacity = this.finalTransform.opacity;
        this.transformHelper.matMdf = false;
        this.transformHelper.opMdf = this.finalTransform.opMdf;
        this.renderModifiers();
        this.renderShape(this.transformHelper,null,null,true);
        if(this.data.hasMask){
            this.globalData.renderer.restore(true);
        }
    };

    CVShapeElement.prototype.renderShape = function(parentTransform,items,data,isMain){
        var i, len;
        if(!items){
            items = this.shapesData;
            len = this.stylesList.length;
            for(i=0;i<len;i+=1){
                this.stylesList[i].d = '';
                this.stylesList[i].mdf = false;
            }
        }
        if(!data){
            data = this.viewData;
        }
        ///
        ///
        len = items.length - 1;
        var groupTransform,groupMatrix;
        groupTransform = parentTransform;
        for(i=len;i>=0;i-=1){
            if(items[i].ty == 'tr'){
                groupTransform = data[i].transform;
                var mtArr = data[i].transform.mProps.v.props;
                groupTransform.matMdf = groupTransform.mProps.mdf;
                groupTransform.opMdf = groupTransform.op.mdf;
                groupMatrix = groupTransform.mat;
                groupMatrix.cloneFromProps(mtArr);
                if(parentTransform){
                    var props = parentTransform.mat.props;
                    groupTransform.opacity = parentTransform.opacity;
                    groupTransform.opacity *= data[i].transform.op.v;
                    groupTransform.matMdf = parentTransform.matMdf ? true : groupTransform.matMdf;
                    groupTransform.opMdf = parentTransform.opMdf ? true : groupTransform.opMdf;
                    groupMatrix.transform(props[0],props[1],props[2],props[3],props[4],props[5],props[6],props[7],props[8],props[9],props[10],props[11],props[12],props[13],props[14],props[15]);
                }else{
                    groupTransform.opacity = groupTransform.op.o;
                }
            }else if(items[i].ty == 'sh' || items[i].ty == 'el' || items[i].ty == 'rc' || items[i].ty == 'sr'){
                this.renderPath(items[i],data[i],groupTransform);
            }else if(items[i].ty == 'fl'){
                this.renderFill(items[i],data[i],groupTransform);
            }else if(items[i].ty == 'st'){
                this.renderStroke(items[i],data[i],groupTransform);
            }else if(items[i].ty == 'gr'){
                this.renderShape(groupTransform,items[i].it,data[i].it);
            }else if(items[i].ty == 'tm'){
                //
            }
        }
        if(!isMain){
            return;
        }
        len = this.stylesList.length;
        var j, jLen, k, kLen,elems,nodes, renderer = this.globalData.renderer, ctx = this.globalData.canvasContext, type;
        renderer.save();
        renderer.ctxTransform(this.finalTransform.mat.props);
        for(i=0;i<len;i+=1){
            type = this.stylesList[i].type;
            if(type === 'st' && this.stylesList[i].wi === 0){
                continue;
            }
            renderer.save();
            elems = this.stylesList[i].elements;
            if(type === 'st'){
                ctx.strokeStyle = this.stylesList[i].co;
                ctx.lineWidth = this.stylesList[i].wi;
                ctx.lineCap = this.stylesList[i].lc;
                ctx.lineJoin = this.stylesList[i].lj;
                ctx.miterLimit = this.stylesList[i].ml || 0;
            }else{
                ctx.fillStyle = this.stylesList[i].co;
            }
            renderer.ctxOpacity(this.stylesList[i].coOp);
            if(type !== 'st'){
                ctx.beginPath();
            }
            jLen = elems.length;
            for(j=0;j<jLen;j+=1){
                if(type === 'st'){
                    ctx.beginPath();
                    if(this.stylesList[i].da){
                        ctx.setLineDash(this.stylesList[i].da);
                        ctx.lineDashOffset = this.stylesList[i].do;
                        this.globalData.isDashed = true;
                    }else if(this.globalData.isDashed){
                        ctx.setLineDash(this.dashResetter);
                        this.globalData.isDashed = false;
                    }
                }
                nodes = elems[j].trNodes;
                kLen = nodes.length;

                for(k=0;k<kLen;k+=1){
                    if(nodes[k].t == 'm'){
                        ctx.moveTo(nodes[k].p[0],nodes[k].p[1]);
                    }else if(nodes[k].t == 'c'){
                        ctx.bezierCurveTo(nodes[k].p1[0],nodes[k].p1[1],nodes[k].p2[0],nodes[k].p2[1],nodes[k].p3[0],nodes[k].p3[1]);
                    }else{
                        ctx.closePath();
                    }
                }
                if(type === 'st'){
                    ctx.stroke();
                }
            }
            if(type !== 'st'){
                ctx.fill();
            }
            renderer.restore();
        }
        renderer.restore();
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };
    CVShapeElement.prototype.renderPath = function(pathData,viewData,groupTransform){
        var len, i, j,jLen;
        var redraw = groupTransform.matMdf || viewData.sh.mdf || this.firstFrame;
        if(redraw) {
            var paths = viewData.sh.paths;
            jLen = paths.length;
            var pathStringTransformed = viewData.trNodes;
            pathStringTransformed.length = 0;
            for(j=0;j<jLen;j+=1){
                var pathNodes = paths[j];
                if(pathNodes && pathNodes.v){
                    len = pathNodes.v.length;
                    for (i = 1; i < len; i += 1) {
                        if (i == 1) {
                            pathStringTransformed.push({
                                t: 'm',
                                p: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                            });
                        }
                        pathStringTransformed.push({
                            t: 'c',
                            p1: groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                            p2: groupTransform.mat.applyToPointArray(pathNodes.i[i][0], pathNodes.i[i][1], 0),
                            p3: groupTransform.mat.applyToPointArray(pathNodes.v[i][0], pathNodes.v[i][1], 0)
                        });
                    }
                    if (len == 1) {
                        pathStringTransformed.push({
                            t: 'm',
                            p: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                        });
                    }
                    if (pathNodes.c && len) {
                        pathStringTransformed.push({
                            t: 'c',
                            p1: groupTransform.mat.applyToPointArray(pathNodes.o[i - 1][0], pathNodes.o[i - 1][1], 0),
                            p2: groupTransform.mat.applyToPointArray(pathNodes.i[0][0], pathNodes.i[0][1], 0),
                            p3: groupTransform.mat.applyToPointArray(pathNodes.v[0][0], pathNodes.v[0][1], 0)
                        });
                        pathStringTransformed.push({
                            t: 'z'
                        });
                    }
                    viewData.lStr = pathStringTransformed;
                }

            }

            if (viewData.st) {
                for (i = 0; i < 16; i += 1) {
                    viewData.tr[i] = groupTransform.mat.props[i];
                }
            }
            viewData.trNodes = pathStringTransformed;

        }
    };



    CVShapeElement.prototype.renderFill = function(styleData,viewData, groupTransform){
        var styleElem = viewData.style;

        if(viewData.c.mdf || this.firstFrame){
            styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
        }
        if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
            styleElem.coOp = viewData.o.v*groupTransform.opacity;
        }
    };

    CVShapeElement.prototype.renderStroke = function(styleData,viewData, groupTransform){
        var styleElem = viewData.style;
        //TODO fix dashes
        var d = viewData.d;
        var dasharray,dashoffset;
        if(d && (d.mdf  || this.firstFrame)){
            styleElem.da = d.dasharray;
            styleElem.do = d.dashoffset;
        }
        if(viewData.c.mdf || this.firstFrame){
            styleElem.co = 'rgb('+bm_floor(viewData.c.v[0])+','+bm_floor(viewData.c.v[1])+','+bm_floor(viewData.c.v[2])+')';
        }
        if(viewData.o.mdf || groupTransform.opMdf || this.firstFrame){
            styleElem.coOp = viewData.o.v*groupTransform.opacity;
        }
        if(viewData.w.mdf || this.firstFrame){
            styleElem.wi = viewData.w.v;
        }
    };


    CVShapeElement.prototype.destroy = function(){
        this.shapesData = null;
        this.globalData = null;
        this.canvasContext = null;
        this.stylesList.length = 0;
        this.viewData.length = 0;
        this._parent.destroy.call(this._parent);
    };


    function CVSolidElement(data, comp,globalData){
        this._parent.constructor.call(this,data, comp,globalData);
    }
    createElement(CVBaseElement, CVSolidElement);

    CVSolidElement.prototype.renderFrame = function(parentMatrix){
        if(this._parent.renderFrame.call(this, parentMatrix)===false){
            return;
        }
        var ctx = this.canvasContext;
        this.globalData.renderer.save();
        this.globalData.renderer.ctxTransform(this.finalTransform.mat.props);
        this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
        ctx.fillStyle=this.data.sc;
        ctx.fillRect(0,0,this.data.sw,this.data.sh);
        this.globalData.renderer.restore(this.data.hasMask);
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };
    function CVTextElement(data, comp, globalData){
        this.textSpans = [];
        this.yOffset = 0;
        this.fillColorAnim = false;
        this.strokeColorAnim = false;
        this.strokeWidthAnim = false;
        this.stroke = false;
        this.fill = false;
        this.justifyOffset = 0;
        this.currentRender = null;
        this.renderType = 'canvas';
        this.values = {
            fill: 'rgba(0,0,0,0)',
            stroke: 'rgba(0,0,0,0)',
            sWidth: 0,
            fValue: ''
        }
        this._parent.constructor.call(this,data,comp, globalData);
    }
    createElement(CVBaseElement, CVTextElement);

    CVTextElement.prototype.init = ITextElement.prototype.init;
    CVTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
    CVTextElement.prototype.getMult = ITextElement.prototype.getMult;
    CVTextElement.prototype.prepareFrame = ITextElement.prototype.prepareFrame;

    CVTextElement.prototype.tHelper = document.createElement('canvas').getContext('2d');

    CVTextElement.prototype.createElements = function(){

        this._parent.createElements.call(this);
        //console.log('this.data: ',this.data);

    };

    CVTextElement.prototype.buildNewText = function(){
        var documentData = this.currentTextDocumentData;
        this.renderedLetters = Array.apply(null,{length:this.currentTextDocumentData.l ? this.currentTextDocumentData.l.length : 0});

        var hasFill = false;
        if(documentData.fc) {
            hasFill = true;
            this.values.fill = 'rgb(' + Math.round(documentData.fc[0]*255) + ',' + Math.round(documentData.fc[1]*255) + ',' + Math.round(documentData.fc[2]*255) + ')';
        }else{
            this.values.fill = 'rgba(0,0,0,0)';
        }
        this.fill = hasFill;
        var hasStroke = false;
        if(documentData.sc){
            hasStroke = true;
            this.values.stroke = 'rgb(' + Math.round(documentData.sc[0]*255) + ',' + Math.round(documentData.sc[1]*255) + ',' + Math.round(documentData.sc[2]*255) + ')';
            this.values.sWidth = documentData.sw;
        }
        var fontData = this.globalData.fontManager.getFontByName(documentData.f);
        var i, len;
        var letters = documentData.l;
        var matrixHelper = this.mHelper;
        this.stroke = hasStroke;
        this.values.fValue = documentData.s + 'px '+ this.globalData.fontManager.getFontByName(documentData.f).fFamily;
        len = documentData.t.length;
        this.tHelper.font = this.values.fValue;
        var charData, shapeData, k, kLen, shapes, j, jLen, pathNodes, commands, pathArr, singleShape = this.data.singleShape;
        if (singleShape) {
            var xPos = 0, yPos = 0, lineWidths = documentData.lineWidths, boxWidth = documentData.boxWidth, firstLine = true;
        }
        var cnt = 0;
        for (i = 0;i < len ;i += 1) {
            charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
            var shapeData;
            if(charData){
                shapeData = charData.data;
            } else {
                shapeData = null;
            }
            matrixHelper.reset();
            if(singleShape && letters[i].n) {
                xPos = 0;
                yPos += documentData.yOffset;
                yPos += firstLine ? 1 : 0;
                firstLine = false;
            }

            if(shapeData && shapeData.shapes){
                shapes = shapeData.shapes[0].it;
                jLen = shapes.length;
                matrixHelper.scale(documentData.s/100,documentData.s/100);
                if(singleShape){
                    if(documentData.ps){
                        matrixHelper.translate(documentData.ps[0],documentData.ps[1] + documentData.ascent,0);
                    }
                    switch(documentData.j){
                        case 1:
                            matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line]),0,0);
                            break;
                        case 2:
                            matrixHelper.translate(documentData.justifyOffset + (boxWidth - lineWidths[letters[i].line])/2,0,0);
                            break;
                    }
                    matrixHelper.translate(xPos,yPos,0);
                }
                commands = new Array(jLen);
                for(j=0;j<jLen;j+=1){
                    kLen = shapes[j].ks.k.i.length;
                    pathNodes = shapes[j].ks.k;
                    pathArr = [];
                    for(k=1;k<kLen;k+=1){
                        if(k==1){
                            pathArr.push(matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1],0),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1],0));
                        }
                        pathArr.push(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToX(pathNodes.i[k][0],pathNodes.i[k][1],0),matrixHelper.applyToY(pathNodes.i[k][0],pathNodes.i[k][1],0),matrixHelper.applyToX(pathNodes.v[k][0],pathNodes.v[k][1],0),matrixHelper.applyToY(pathNodes.v[k][0],pathNodes.v[k][1],0));
                    }
                    pathArr.push(matrixHelper.applyToX(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToY(pathNodes.o[k-1][0],pathNodes.o[k-1][1],0),matrixHelper.applyToX(pathNodes.i[0][0],pathNodes.i[0][1],0),matrixHelper.applyToY(pathNodes.i[0][0],pathNodes.i[0][1],0),matrixHelper.applyToX(pathNodes.v[0][0],pathNodes.v[0][1],0),matrixHelper.applyToY(pathNodes.v[0][0],pathNodes.v[0][1],0));
                    commands[j] = pathArr;
                }
            }else{
                commands = [];
            }
            if(singleShape){
                xPos += letters[i].l;
            }
            if(this.textSpans[cnt]){
                this.textSpans[cnt].elem = commands;
            } else {
                this.textSpans[cnt] = {elem: commands};
            }
            cnt +=1;
        }
    }

    CVTextElement.prototype.renderFrame = function(parentMatrix){
        if(this._parent.renderFrame.call(this, parentMatrix)===false){
            return;
        }
        var ctx = this.canvasContext;
        var finalMat = this.finalTransform.mat.props;
        this.globalData.renderer.save();
        this.globalData.renderer.ctxTransform(finalMat);
        this.globalData.renderer.ctxOpacity(this.finalTransform.opacity);
        ctx.font = this.values.fValue;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 4;

        if(!this.data.singleShape){
            this.getMeasures();
        }

        var  i,len, j, jLen, k, kLen;
        var renderedLetters = this.renderedLetters;

        var letters = this.currentTextDocumentData.l;

        len = letters.length;
        var renderedLetter;
        var lastFill = null, lastStroke = null, lastStrokeW = null, commands, pathArr;
        for(i=0;i<len;i+=1){
            if(letters[i].n){
                continue;
            }
            renderedLetter = renderedLetters[i];
            if(renderedLetter){
                this.globalData.renderer.save();
                this.globalData.renderer.ctxTransform(renderedLetter.props);
                this.globalData.renderer.ctxOpacity(renderedLetter.o);
            }
            if(this.fill){
                if(renderedLetter && renderedLetter.fc){
                    if(lastFill !== renderedLetter.fc){
                        lastFill = renderedLetter.fc;
                        ctx.fillStyle = renderedLetter.fc;
                    }
                }else if(lastFill !== this.values.fill){
                    lastFill = this.values.fill;
                    ctx.fillStyle = this.values.fill;
                }
                commands = this.textSpans[i].elem;
                jLen = commands.length;
                this.globalData.canvasContext.beginPath();
                for(j=0;j<jLen;j+=1) {
                    pathArr = commands[j];
                    kLen = pathArr.length;
                    this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
                    for (k = 2; k < kLen; k += 6) {
                        this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
                    }
                }
                this.globalData.canvasContext.closePath();
                this.globalData.canvasContext.fill();
                ///ctx.fillText(this.textSpans[i].val,0,0);
            }
            if(this.stroke){
                if(renderedLetter && renderedLetter.sw){
                    if(lastStrokeW !== renderedLetter.sw){
                        lastStrokeW = renderedLetter.sw;
                        ctx.lineWidth = renderedLetter.sw;
                    }
                }else if(lastStrokeW !== this.values.sWidth){
                    lastStrokeW = this.values.sWidth;
                    ctx.lineWidth = this.values.sWidth;
                }
                if(renderedLetter && renderedLetter.sc){
                    if(lastStroke !== renderedLetter.sc){
                        lastStroke = renderedLetter.sc;
                        ctx.strokeStyle = renderedLetter.sc;
                    }
                }else if(lastStroke !== this.values.stroke){
                    lastStroke = this.values.stroke;
                    ctx.strokeStyle = this.values.stroke;
                }
                commands = this.textSpans[i].elem;
                jLen = commands.length;
                this.globalData.canvasContext.beginPath();
                for(j=0;j<jLen;j+=1) {
                    pathArr = commands[j];
                    kLen = pathArr.length;
                    this.globalData.canvasContext.moveTo(pathArr[0], pathArr[1]);
                    for (k = 2; k < kLen; k += 6) {
                        this.globalData.canvasContext.bezierCurveTo(pathArr[k], pathArr[k + 1], pathArr[k + 2], pathArr[k + 3], pathArr[k + 4], pathArr[k + 5]);
                    }
                }
                this.globalData.canvasContext.closePath();
                this.globalData.canvasContext.stroke();
                ///ctx.strokeText(letters[i].val,0,0);
            }
            if(renderedLetter) {
                this.globalData.renderer.restore();
            }
        }
        /*if(this.data.hasMask){
         this.globalData.renderer.restore(true);
         }*/
        this.globalData.renderer.restore(this.data.hasMask);
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };
    function HBaseElement(data,parentContainer,globalData,comp, placeholder){
        this.globalData = globalData;
        this.comp = comp;
        this.data = data;
        this.matteElement = null;
        this.parentContainer = parentContainer;
        this.layerId = placeholder ? placeholder.layerId : 'ly_'+randomString(10);
        this.placeholder = placeholder;
        this.init();
    };

    createElement(BaseElement, HBaseElement);
    HBaseElement.prototype.checkBlendMode = function(){

    };
    HBaseElement.prototype.setBlendMode = BaseElement.prototype.setBlendMode;

    /*HBaseElement.prototype.appendNodeToParent = function(node) {
     if(this.data.hd){
     return;
     }
     if(this.placeholder){
     var g = this.placeholder.phElement;
     g.parentNode.insertBefore(node, g);
     //g.parentNode.removeChild(g);
     }else{
     this.parentContainer.appendChild(node);
     }
     };*/


    HBaseElement.prototype.getBaseElement = function(){
        return this.baseElement;
    };

    HBaseElement.prototype.createElements = function(){
        if(this.data.hasMask){
            this.layerElement = document.createElementNS(svgNS,'svg');
            styleDiv(this.layerElement);
            //this.appendNodeToParent(this.layerElement);
            this.baseElement = this.layerElement;
            this.maskedElement = this.layerElement;
        }else{
            this.layerElement = this.parentContainer;
        }
        this.transformedElement = this.layerElement;
        if(this.data.ln && (this.data.ty === 4 || this.data.ty === 0)){
            if(this.layerElement === this.parentContainer){
                this.layerElement = document.createElementNS(svgNS,'g');
                //this.appendNodeToParent(this.layerElement);
                this.baseElement = this.layerElement;
            }
            this.layerElement.setAttribute('id',this.data.ln);
        }
        this.setBlendMode();
        if(this.layerElement !== this.parentContainer){
            this.placeholder = null;
        }
        this.checkParenting();
    };

    HBaseElement.prototype.renderFrame = function(parentTransform){
        if(this.data.ty === 3){
            return false;
        }

        if(this.currentFrameNum === this.lastNum || !this.isVisible){
            return this.isVisible;
        }
        this.lastNum = this.currentFrameNum;

        this.finalTransform.opMdf = this.finalTransform.op.mdf;
        this.finalTransform.matMdf = this.finalTransform.mProp.mdf;
        this.finalTransform.opacity = this.finalTransform.op.v;
        if(this.firstFrame){
            this.finalTransform.opMdf = true;
            this.finalTransform.matMdf = true;
        }

        var mat;
        var finalMat = this.finalTransform.mat;

        if(this.hierarchy){
            var i, len = this.hierarchy.length;

            mat = this.finalTransform.mProp.v.props;
            finalMat.cloneFromProps(mat);
            for(i=0;i<len;i+=1){
                this.finalTransform.matMdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : this.finalTransform.matMdf;
                mat = this.hierarchy[i].finalTransform.mProp.v.props;
                finalMat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],mat[12],mat[13],mat[14],mat[15]);
            }
        }else{
            if(this.isVisible && this.finalTransform.matMdf){
                if(!parentTransform){
                    finalMat.cloneFromProps(this.finalTransform.mProp.v.props);
                }else{
                    mat = this.finalTransform.mProp.v.props;
                    finalMat.cloneFromProps(mat);
                }
            }
        }
        if(this.data.hasMask){
            this.maskManager.renderFrame(finalMat);
        }

        if(parentTransform){
            mat = parentTransform.mat.props;
            finalMat.cloneFromProps(mat);
            this.finalTransform.opacity *= parentTransform.opacity;
            this.finalTransform.opMdf = parentTransform.opMdf ? true : this.finalTransform.opMdf;
            this.finalTransform.matMdf = parentTransform.matMdf ? true : this.finalTransform.matMdf
        }

        if(this.finalTransform.matMdf){
            this.transformedElement.style.transform = this.transformedElement.style.webkitTransform = finalMat.toCSS();
            this.finalMat = finalMat;
        }
        if(this.finalTransform.opMdf){
            this.transformedElement.style.opacity = this.finalTransform.opacity;
        }
        return this.isVisible;
    };

    HBaseElement.prototype.destroy = function(){
        this.layerElement = null;
        this.transformedElement = null;
        this.parentContainer = null;
        if(this.matteElement) {
            this.matteElement = null;
        }
        if(this.maskManager) {
            this.maskManager.destroy();
            this.maskManager = null;
        }
    };

    HBaseElement.prototype.getDomElement = function(){
        return this.layerElement;
    };
    HBaseElement.prototype.addMasks = function(data){
        this.maskManager = new MaskElement(data,this,this.globalData);
    };

    HBaseElement.prototype.hide = function(){
    };

    HBaseElement.prototype.setMatte = function(){

    }

    HBaseElement.prototype.buildElementParenting = HybridRenderer.prototype.buildElementParenting;
    function HSolidElement(data,parentContainer,globalData,comp, placeholder){
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    }
    createElement(HBaseElement, HSolidElement);

    HSolidElement.prototype.createElements = function(){
        var parent = document.createElement('div');
        styleDiv(parent);
        var cont = document.createElementNS(svgNS,'svg');
        styleDiv(cont);
        cont.setAttribute('width',this.data.sw);
        cont.setAttribute('height',this.data.sh);
        parent.appendChild(cont);
        this.layerElement = parent;
        this.transformedElement = parent;
        //this.appendNodeToParent(parent);
        this.baseElement = parent;
        this.innerElem = parent;
        if(this.data.ln){
            this.innerElem.setAttribute('id',this.data.ln);
        }
        if(this.data.bm !== 0){
            this.setBlendMode();
        }
        var rect = document.createElementNS(svgNS,'rect');
        rect.setAttribute('width',this.data.sw);
        rect.setAttribute('height',this.data.sh);
        rect.setAttribute('fill',this.data.sc);
        cont.appendChild(rect);
        if(this.data.hasMask){
            this.maskedElement = rect;
        }
        this.checkParenting();
    };



    HSolidElement.prototype.hide = IImageElement.prototype.hide;
    HSolidElement.prototype.renderFrame = IImageElement.prototype.renderFrame;
    HSolidElement.prototype.destroy = IImageElement.prototype.destroy;
    function HCompElement(data,parentContainer,globalData,comp, placeholder){
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
        this.layers = data.layers;
        this.supports3d = true;
        this.completeLayers = false;
        this.pendingElements = [];
        this.elements = Array.apply(null,{length:this.layers.length});
        if(this.data.tm){
            this.tm = PropertyFactory.getProp(this,this.data.tm,0,globalData.frameRate,this.dynamicProperties);
        }
        if(this.data.hasMask) {
            this.supports3d = false;
        }
        if(this.data.xt){
            this.layerElement = document.createElement('div');
        }
        this.buildAllItems();

    }
    createElement(HBaseElement, HCompElement);

    HCompElement.prototype.createElements = function(){
        var divElement = document.createElement('div');
        styleDiv(divElement);
        if(this.data.ln){
            divElement.setAttribute('id',this.data.ln);
        }
        divElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
        if(this.data.hasMask){
            var compSvg = document.createElementNS(svgNS,'svg');
            styleDiv(compSvg);
            compSvg.setAttribute('width',this.data.w);
            compSvg.setAttribute('height',this.data.h);
            var g = document.createElementNS(svgNS,'g');
            compSvg.appendChild(g);
            divElement.appendChild(compSvg);
            this.maskedElement = g;
            this.baseElement = divElement;
            this.layerElement = g;
            this.transformedElement = divElement;
        }else{
            this.layerElement = divElement;
            this.baseElement = this.layerElement;
            this.transformedElement = divElement;
        }
        //this.appendNodeToParent(this.layerElement);
        this.checkParenting();
    };

    HCompElement.prototype.hide = ICompElement.prototype.hide;
    HCompElement.prototype.prepareFrame = ICompElement.prototype.prepareFrame;
    HCompElement.prototype.setElements = ICompElement.prototype.setElements;
    HCompElement.prototype.getElements = ICompElement.prototype.getElements;
    HCompElement.prototype.destroy = ICompElement.prototype.destroy;

    HCompElement.prototype.renderFrame = function(parentMatrix){
        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        var i,len = this.layers.length;
        if(renderParent===false){
            this.hide();
            return;
        }

        this.hidden = false;

        for( i = 0; i < len; i+=1 ){
            if(this.completeLayers || this.elements[i]){
                this.elements[i].renderFrame();
            }
        }
        if(this.firstFrame){
            this.firstFrame = false;
        }
    };

    HCompElement.prototype.checkLayers = BaseRenderer.prototype.checkLayers;
    HCompElement.prototype.buildItem = HybridRenderer.prototype.buildItem;
    HCompElement.prototype.checkPendingElements = HybridRenderer.prototype.checkPendingElements;
    HCompElement.prototype.addPendingElement = HybridRenderer.prototype.addPendingElement;
    HCompElement.prototype.buildAllItems = BaseRenderer.prototype.buildAllItems;
    HCompElement.prototype.createItem = HybridRenderer.prototype.createItem;
    HCompElement.prototype.buildElementParenting = HybridRenderer.prototype.buildElementParenting;
    HCompElement.prototype.createImage = HybridRenderer.prototype.createImage;
    HCompElement.prototype.createComp = HybridRenderer.prototype.createComp;
    HCompElement.prototype.createSolid = HybridRenderer.prototype.createSolid;
    HCompElement.prototype.createShape = HybridRenderer.prototype.createShape;
    HCompElement.prototype.createText = HybridRenderer.prototype.createText;
    HCompElement.prototype.createBase = HybridRenderer.prototype.createBase;
    HCompElement.prototype.appendElementInPos = HybridRenderer.prototype.appendElementInPos;
    function HShapeElement(data,parentContainer,globalData,comp, placeholder){
        this.shapes = [];
        this.shapeModifiers = [];
        this.shapesData = data.shapes;
        this.stylesList = [];
        this.viewData = [];
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
        this.addedTransforms = {
            mdf: false,
            mats: [this.finalTransform.mat]
        };
        this.currentBBox = {
            x:999999,
            y: -999999,
            h: 0,
            w: 0
        };
    }
    createElement(HBaseElement, HShapeElement);
    var parent = HShapeElement.prototype._parent;
    extendPrototype(IShapeElement, HShapeElement);
    HShapeElement.prototype._parent = parent;

    HShapeElement.prototype.createElements = function(){
        var parent = document.createElement('div');
        styleDiv(parent);
        var cont = document.createElementNS(svgNS,'svg');
        styleDiv(cont);
        var size = this.comp.data ? this.comp.data : this.globalData.compSize;
        cont.setAttribute('width',size.w);
        cont.setAttribute('height',size.h);
        if(this.data.hasMask){
            var g = document.createElementNS(svgNS,'g');
            parent.appendChild(cont);
            cont.appendChild(g);
            this.maskedElement = g;
            this.layerElement = g;
            this.shapesContainer = g;
        }else{
            parent.appendChild(cont);
            this.layerElement = cont;
            this.shapesContainer = document.createElementNS(svgNS,'g');
            this.layerElement.appendChild(this.shapesContainer);
        }
        if(!this.data.hd){
            //this.parentContainer.appendChild(parent);
            this.baseElement = parent;
        }
        this.innerElem = parent;
        if(this.data.ln){
            this.innerElem.setAttribute('id',this.data.ln);
        }
        this.searchShapes(this.shapesData,this.viewData,this.layerElement,this.dynamicProperties,0);
        this.buildExpressionInterface();
        this.layerElement = parent;
        this.transformedElement = parent;
        this.shapeCont = cont;
        if(this.data.bm !== 0){
            this.setBlendMode();
        }
        this.checkParenting();
    };

    HShapeElement.prototype.renderFrame = function(parentMatrix){
        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        if(renderParent===false){
            this.hide();
            return;
        }
        if(this.hidden){
            this.layerElement.style.display = 'block';
            this.hidden = false;
        }
        this.renderModifiers();
        this.addedTransforms.mdf = this.finalTransform.matMdf;
        this.addedTransforms.mats.length = 1;
        this.addedTransforms.mats[0] = this.finalTransform.mat;
        this.renderShape(null,null,true, null);

        if(this.isVisible && (this.elemMdf || this.firstFrame)){
            var boundingBox = this.shapeCont.getBBox();
            var changed = false;
            if(this.currentBBox.w !== boundingBox.width){
                this.currentBBox.w = boundingBox.width;
                this.shapeCont.setAttribute('width',boundingBox.width);
                changed = true;
            }
            if(this.currentBBox.h !== boundingBox.height){
                this.currentBBox.h = boundingBox.height;
                this.shapeCont.setAttribute('height',boundingBox.height);
                changed = true;
            }
            if(changed  || this.currentBBox.x !== boundingBox.x  || this.currentBBox.y !== boundingBox.y){
                this.currentBBox.w = boundingBox.width;
                this.currentBBox.h = boundingBox.height;
                this.currentBBox.x = boundingBox.x;
                this.currentBBox.y = boundingBox.y;

                this.shapeCont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
                this.shapeCont.style.transform = this.shapeCont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
            }
        }

    };
    function HTextElement(data,parentContainer,globalData,comp, placeholder){
        this.textSpans = [];
        this.textPaths = [];
        this.currentBBox = {
            x:999999,
            y: -999999,
            h: 0,
            w: 0
        }
        this.renderType = 'svg';
        this.isMasked = false;
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);

    }
    createElement(HBaseElement, HTextElement);

    HTextElement.prototype.init = ITextElement.prototype.init;
    HTextElement.prototype.getMeasures = ITextElement.prototype.getMeasures;
    HTextElement.prototype.createPathShape = ITextElement.prototype.createPathShape;
    HTextElement.prototype.prepareFrame = ITextElement.prototype.prepareFrame;

    HTextElement.prototype.createElements = function(){
        this.isMasked = this.checkMasks();
        var parent = document.createElement('div');
        styleDiv(parent);
        this.layerElement = parent;
        this.transformedElement = parent;
        if(this.isMasked){
            this.renderType = 'svg';
            var cont = document.createElementNS(svgNS,'svg');
            styleDiv(cont);
            this.cont = cont;
            this.compW = this.comp.data ? this.comp.data.w : this.globalData.compSize.w;
            this.compH = this.comp.data ? this.comp.data.h : this.globalData.compSize.h;
            cont.setAttribute('width',this.compW);
            cont.setAttribute('height',this.compH);
            var g = document.createElementNS(svgNS,'g');
            cont.appendChild(g);
            parent.appendChild(cont);
            this.maskedElement = g;
            this.innerElem = g;
        } else {
            this.renderType = 'html';
            this.innerElem = parent;
        }
        this.baseElement = parent;

        this.checkParenting();

    };

    HTextElement.prototype.buildNewText = function(){
        var documentData = this.currentTextDocumentData;
        this.renderedLetters = Array.apply(null,{length:this.currentTextDocumentData.l ? this.currentTextDocumentData.l.length : 0});
        if(documentData.fc) {
            this.innerElem.style.color = this.innerElem.style.fill = 'rgb(' + Math.round(documentData.fc[0]*255) + ',' + Math.round(documentData.fc[1]*255) + ',' + Math.round(documentData.fc[2]*255) + ')';
            ////this.innerElem.setAttribute('fill', 'rgb(' + documentData.fc[0] + ',' + documentData.fc[1] + ',' + documentData.fc[2] + ')');
        }else{
            this.innerElem.style.color = this.innerElem.style.fill = 'rgba(0,0,0,0)';
            ////this.innerElem.setAttribute('fill', 'rgba(0,0,0,0)');
        }
        if(documentData.sc){
            ////this.innerElem.setAttribute('stroke', 'rgb(' + documentData.sc[0] + ',' + documentData.sc[1] + ',' + documentData.sc[2] + ')');
            this.innerElem.style.stroke = 'rgb(' + Math.round(documentData.sc[0]*255) + ',' + Math.round(documentData.sc[1]*255) + ',' + Math.round(documentData.sc[2]*255) + ')';
            ////this.innerElem.setAttribute('stroke-width', documentData.sw);
            this.innerElem.style.strokeWidth = documentData.sw+'px';
        }
        ////this.innerElem.setAttribute('font-size', documentData.s);
        var fontData = this.globalData.fontManager.getFontByName(documentData.f);
        if(!this.globalData.fontManager.chars){
            this.innerElem.style.fontSize = documentData.s+'px';
            this.innerElem.style.lineHeight = documentData.s+'px';
            if(fontData.fClass){
                this.innerElem.className = fontData.fClass;
            } else {
                ////this.innerElem.setAttribute('font-family', fontData.fFamily);
                this.innerElem.style.fontFamily = fontData.fFamily;
                var fWeight = documentData.fWeight, fStyle = documentData.fStyle;
                ////this.innerElem.setAttribute('font-style', fStyle);
                this.innerElem.style.fontStyle = fStyle;
                ////this.innerElem.setAttribute('font-weight', fWeight);
                this.innerElem.style.fontWeight = fWeight;
            }
        }
        var i, len;

        var letters = documentData.l;
        len = letters.length;
        var tSpan,tParent,tCont;
        var matrixHelper = this.mHelper;
        var shapes, shapeStr = '';
        var cnt = 0;
        for (i = 0;i < len ;i += 1) {
            if(this.globalData.fontManager.chars){
                if(!this.textPaths[cnt]){
                    tSpan = document.createElementNS(svgNS,'path');
                    tSpan.setAttribute('stroke-linecap', 'butt');
                    tSpan.setAttribute('stroke-linejoin','round');
                    tSpan.setAttribute('stroke-miterlimit','4');
                } else {
                    tSpan = this.textPaths[cnt];
                }
                if(!this.isMasked){
                    if(this.textSpans[cnt]){
                        tParent = this.textSpans[cnt];
                        tCont = tParent.children[0];
                    } else {

                        tParent = document.createElement('div');
                        tCont = document.createElementNS(svgNS,'svg');
                        tCont.appendChild(tSpan);
                        styleDiv(tParent);
                    }
                }
            }else{
                if(!this.isMasked){
                    if(this.textSpans[cnt]){
                        tParent = this.textSpans[cnt];
                        tSpan = this.textPaths[cnt];
                    } else {
                        tParent = document.createElement('span');
                        styleDiv(tParent);
                        tSpan = document.createElement('span');
                        styleDiv(tSpan);
                        tParent.appendChild(tSpan);
                    }
                } else {
                    tSpan = this.textPaths[cnt] ? this.textPaths[cnt] : document.createElementNS(svgNS,'text');
                }
            }
            //tSpan.setAttribute('visibility', 'hidden');
            if(this.globalData.fontManager.chars){
                var charData = this.globalData.fontManager.getCharData(documentData.t.charAt(i), fontData.fStyle, this.globalData.fontManager.getFontByName(documentData.f).fFamily);
                var shapeData;
                if(charData){
                    shapeData = charData.data;
                } else {
                    shapeData = null;
                }
                matrixHelper.reset();
                if(shapeData && shapeData.shapes){
                    shapes = shapeData.shapes[0].it;
                    matrixHelper.scale(documentData.s/100,documentData.s/100);
                    shapeStr = this.createPathShape(matrixHelper,shapes);
                    tSpan.setAttribute('d',shapeStr);
                }
                if(!this.isMasked){
                    this.innerElem.appendChild(tParent);
                    if(shapeData && shapeData.shapes){
                        document.body.appendChild(tCont);

                        var boundingBox = tCont.getBBox();
                        tCont.setAttribute('width',boundingBox.width);
                        tCont.setAttribute('height',boundingBox.height);
                        tCont.setAttribute('viewBox',boundingBox.x+' '+ boundingBox.y+' '+ boundingBox.width+' '+ boundingBox.height);
                        tCont.style.transform = tCont.style.webkitTransform = 'translate(' + boundingBox.x + 'px,' + boundingBox.y + 'px)';

                        letters[i].yOffset = boundingBox.y;
                        tParent.appendChild(tCont);

                    } else{
                        tCont.setAttribute('width',1);
                        tCont.setAttribute('height',1);
                    }
                }else{
                    this.innerElem.appendChild(tSpan);
                }
            }else{
                tSpan.textContent = letters[i].val;
                tSpan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
                if(!this.isMasked){
                    this.innerElem.appendChild(tParent);
                    //
                    tSpan.style.transform = tSpan.style.webkitTransform = 'translate3d(0,'+ -documentData.s/1.2+'px,0)';
                } else {
                    this.innerElem.appendChild(tSpan);
                }
            }
            //
            if(!this.isMasked){
                this.textSpans[cnt] = tParent;
            }else{
                this.textSpans[cnt] = tSpan;
            }
            this.textSpans[cnt].style.display = 'block';
            this.textPaths[cnt] = tSpan;
            cnt += 1;
        }
        while(cnt < this.textSpans.length){
            this.textSpans[cnt].style.display = 'none';
            cnt += 1;
        }
    }

    HTextElement.prototype.hide = SVGTextElement.prototype.hide;

    HTextElement.prototype.renderFrame = function(parentMatrix){

        var renderParent = this._parent.renderFrame.call(this,parentMatrix);
        if(renderParent===false){
            this.hide();
            return;
        }
        if(this.hidden){
            this.hidden = false;
            this.innerElem.style.display = 'block';
            this.layerElement.style.display = 'block';
        }

        if(this.data.singleShape){
            if(!this.firstFrame && !this.lettersChangedFlag){
                return;
            } else {
                // Todo Benchmark if using this is better than getBBox
                if(this.isMasked && this.finalTransform.matMdf){
                    this.cont.setAttribute('viewBox',-this.finalTransform.mProp.p.v[0]+' '+ -this.finalTransform.mProp.p.v[1]+' '+this.compW+' '+this.compH);
                    this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + -this.finalTransform.mProp.p.v[0] + 'px,' + -this.finalTransform.mProp.p.v[1] + 'px)';
                }
            }
        }

        this.getMeasures();
        if(!this.lettersChangedFlag){
            return;
        }
        var  i,len;
        var renderedLetters = this.renderedLetters;

        var letters = this.currentTextDocumentData.l;

        len = letters.length;
        var renderedLetter;
        for(i=0;i<len;i+=1){
            if(letters[i].n){
                continue;
            }
            renderedLetter = renderedLetters[i];
            if(!this.isMasked){
                this.textSpans[i].style.transform = this.textSpans[i].style.webkitTransform = renderedLetter.m;
            }else{
                this.textSpans[i].setAttribute('transform',renderedLetter.m);
            }
            ////this.textSpans[i].setAttribute('opacity',renderedLetter.o);
            this.textSpans[i].style.opacity = renderedLetter.o;
            if(renderedLetter.sw){
                this.textPaths[i].setAttribute('stroke-width',renderedLetter.sw);
            }
            if(renderedLetter.sc){
                this.textPaths[i].setAttribute('stroke',renderedLetter.sc);
            }
            if(renderedLetter.fc){
                this.textPaths[i].setAttribute('fill',renderedLetter.fc);
                this.textPaths[i].style.color = renderedLetter.fc;
            }
        }
        if(this.isVisible && (this.elemMdf || this.firstFrame)){
            if(this.innerElem.getBBox){
                var boundingBox = this.innerElem.getBBox();

                if(this.currentBBox.w !== boundingBox.width){
                    this.currentBBox.w = boundingBox.width;
                    this.cont.setAttribute('width',boundingBox.width);
                }
                if(this.currentBBox.h !== boundingBox.height){
                    this.currentBBox.h = boundingBox.height;
                    this.cont.setAttribute('height',boundingBox.height);
                }
                if(this.currentBBox.w !== boundingBox.width || this.currentBBox.h !== boundingBox.height  || this.currentBBox.x !== boundingBox.x  || this.currentBBox.y !== boundingBox.y){
                    this.currentBBox.w = boundingBox.width;
                    this.currentBBox.h = boundingBox.height;
                    this.currentBBox.x = boundingBox.x;
                    this.currentBBox.y = boundingBox.y;

                    this.cont.setAttribute('viewBox',this.currentBBox.x+' '+this.currentBBox.y+' '+this.currentBBox.w+' '+this.currentBBox.h);
                    this.cont.style.transform = this.cont.style.webkitTransform = 'translate(' + this.currentBBox.x + 'px,' + this.currentBBox.y + 'px)';
                }
            }
        }
        if(this.firstFrame){
            this.firstFrame = false;
        }
    }


    HTextElement.prototype.destroy = SVGTextElement.prototype.destroy;
    function HImageElement(data,parentContainer,globalData,comp, placeholder){
        this.assetData = globalData.getAssetData(data.refId);
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
    }
    createElement(HBaseElement, HImageElement);

    HImageElement.prototype.createElements = function(){

        var assetPath = this.globalData.getAssetsPath(this.assetData);
        var img = new Image();

        if(this.data.hasMask){
            var parent = document.createElement('div');
            styleDiv(parent);
            var cont = document.createElementNS(svgNS,'svg');
            styleDiv(cont);
            cont.setAttribute('width',this.assetData.w);
            cont.setAttribute('height',this.assetData.h);
            parent.appendChild(cont);
            this.imageElem = document.createElementNS(svgNS,'image');
            this.imageElem.setAttribute('width',this.assetData.w+"px");
            this.imageElem.setAttribute('height',this.assetData.h+"px");
            this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink','href',assetPath);
            cont.appendChild(this.imageElem);
            this.layerElement = parent;
            this.transformedElement = parent;
            this.baseElement = parent;
            this.innerElem = parent;
            this.maskedElement = this.imageElem;
        } else {
            styleDiv(img);
            this.layerElement = img;
            this.baseElement = img;
            this.innerElem = img;
            this.transformedElement = img;
        }
        img.src = assetPath;
        if(this.data.ln){
            this.innerElem.setAttribute('id',this.data.ln);
        }
        this.checkParenting();
    };

    HImageElement.prototype.hide = HSolidElement.prototype.hide;
    HImageElement.prototype.renderFrame = HSolidElement.prototype.renderFrame;
    HImageElement.prototype.destroy = HSolidElement.prototype.destroy;
    function HCameraElement(data,parentContainer,globalData,comp, placeholder){
        this._parent.constructor.call(this,data,parentContainer,globalData,comp, placeholder);
        this.pe = PropertyFactory.getProp(this,data.pe,0,0,this.dynamicProperties);
        if(data.ks.p.s){
            this.px = PropertyFactory.getProp(this,data.ks.p.x,1,0,this.dynamicProperties);
            this.py = PropertyFactory.getProp(this,data.ks.p.y,1,0,this.dynamicProperties);
            this.pz = PropertyFactory.getProp(this,data.ks.p.z,1,0,this.dynamicProperties);
        }else{
            this.p = PropertyFactory.getProp(this,data.ks.p,1,0,this.dynamicProperties);
        }
        if(data.ks.a){
            this.a = PropertyFactory.getProp(this,data.ks.a,1,0,this.dynamicProperties);
        }
        if(data.ks.or.k.length){
            var i,len = data.ks.or.k.length;
            for(i=0;i<len;i+=1){
                data.ks.or.k[i].to = null;
                data.ks.or.k[i].ti = null;
            }
        }
        this.or = PropertyFactory.getProp(this,data.ks.or,1,degToRads,this.dynamicProperties);
        this.or.sh = true;
        this.rx = PropertyFactory.getProp(this,data.ks.rx,0,degToRads,this.dynamicProperties);
        this.ry = PropertyFactory.getProp(this,data.ks.ry,0,degToRads,this.dynamicProperties);
        this.rz = PropertyFactory.getProp(this,data.ks.rz,0,degToRads,this.dynamicProperties);
        this.mat = new Matrix();
    }
    createElement(HBaseElement, HCameraElement);

    HCameraElement.prototype.setup = function() {
        var i, len = this.comp.threeDElements.length, comp;
        for(i=0;i<len;i+=1){
            //[perspectiveElem,container]
            comp = this.comp.threeDElements[i];
            comp.perspectiveElem.style.perspective = comp.perspectiveElem.style.webkitPerspective = this.pe.v+'px';
            comp.container.style.transformOrigin = comp.container.style.mozTransformOrigin = comp.container.style.webkitTransformOrigin = "0px 0px 0px";
            comp.perspectiveElem.style.transform = comp.perspectiveElem.style.webkitTransform = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
        }
    };

    HCameraElement.prototype.createElements = function(){
    };

    HCameraElement.prototype.hide = function(){
    };

    HCameraElement.prototype.renderFrame = function(){
        var mdf = this.firstFrame;
        var i, len;
        if(this.hierarchy){
            len = this.hierarchy.length;
            for(i=0;i<len;i+=1){
                mdf = this.hierarchy[i].finalTransform.mProp.mdf ? true : mdf;
            }
        }
        if(mdf || (this.p && this.p.mdf) || (this.px && (this.px.mdf || this.py.mdf || this.pz.mdf)) || this.rx.mdf || this.ry.mdf || this.rz.mdf || this.or.mdf || (this.a && this.a.mdf)) {
            this.mat.reset();

            if(this.p){
                this.mat.translate(-this.p.v[0],-this.p.v[1],this.p.v[2]);
            }else{
                this.mat.translate(-this.px.v,-this.py.v,this.pz.v);
            }
            if(this.a){
                var diffVector = [this.p.v[0]-this.a.v[0],this.p.v[1]-this.a.v[1],this.p.v[2]-this.a.v[2]];
                var mag = Math.sqrt(Math.pow(diffVector[0],2)+Math.pow(diffVector[1],2)+Math.pow(diffVector[2],2));
                //var lookDir = getNormalizedPoint(getDiffVector(this.a.v,this.p.v));
                var lookDir = [diffVector[0]/mag,diffVector[1]/mag,diffVector[2]/mag];
                var lookLengthOnXZ = Math.sqrt( lookDir[2]*lookDir[2] + lookDir[0]*lookDir[0] );
                var m_rotationX = (Math.atan2( lookDir[1], lookLengthOnXZ ));
                var m_rotationY = (Math.atan2( lookDir[0], -lookDir[2]));
                this.mat.rotateY(m_rotationY).rotateX(-m_rotationX);

            }
            this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v);
            this.mat.rotateX(-this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]);
            this.mat.translate(this.globalData.compSize.w/2,this.globalData.compSize.h/2,0);
            this.mat.translate(0,0,this.pe.v);
            if(this.hierarchy){
                var mat;
                len = this.hierarchy.length;
                for(i=0;i<len;i+=1){
                    mat = this.hierarchy[i].finalTransform.mProp.iv.props;
                    this.mat.transform(mat[0],mat[1],mat[2],mat[3],mat[4],mat[5],mat[6],mat[7],mat[8],mat[9],mat[10],mat[11],-mat[12],-mat[13],mat[14],mat[15]);
                }
            }
            len = this.comp.threeDElements.length;
            var comp;
            for(i=0;i<len;i+=1){
                comp = this.comp.threeDElements[i];
                comp.container.style.transform = comp.container.style.webkitTransform = this.mat.toCSS();
            }
        }
        this.firstFrame = false;
    };

    HCameraElement.prototype.destroy = function(){
    };
    var Expressions = (function(){
        var ob = {};
        ob.initExpressions = initExpressions;


        function initExpressions(animation){
            animation.renderer.compInterface = CompExpressionInterface(animation.renderer);
            animation.renderer.globalData.projectInterface.registerComposition(animation.renderer);
        }
        return ob;
    }());

    expressionsPlugin = Expressions;

    (function addPropertyDecorator(){

        function getStaticValueAtTime(){
            return this.pv;
        }

        function getValueAtTime(frameNum, offsetTime) {
            var i = 0,len = this.keyframes.length- 1,dir= 1,flag = true;
            var keyData, nextKeyData;
            offsetTime = offsetTime === undefined ? this.offsetTime : 0;
            //console.log(this.offsetTime);
            var retVal = typeof this.pv === 'object' ? [this.pv.length] : 0;

            while(flag){
                keyData = this.keyframes[i];
                nextKeyData = this.keyframes[i+1];
                if(i == len-1 && frameNum >= nextKeyData.t - offsetTime){
                    if(keyData.h){
                        keyData = nextKeyData;
                    }
                    break;
                }
                if((nextKeyData.t - offsetTime) > frameNum){
                    break;
                }
                if(i < len - 1){
                    i += dir;
                }else{
                    flag = false;
                }
            }

            var k, kLen,perc,jLen, j = 0, fnc;
            if(keyData.to){

                if(!keyData.bezierData){
                    bez.buildBezierData(keyData);
                }
                var bezierData = keyData.bezierData;
                if(frameNum >= nextKeyData.t-offsetTime || frameNum < keyData.t-offsetTime){
                    var ind = frameNum >= nextKeyData.t-offsetTime ? bezierData.points.length - 1 : 0;
                    kLen = bezierData.points[ind].point.length;
                    for(k = 0; k < kLen; k += 1){
                        retVal[k] = bezierData.points[ind].point[k];
                    }
                }else{
                    if(keyData.__fnct){
                        fnc = keyData.__fnct;
                    }else{
                        //fnc = bez.getEasingCurve(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n);
                        fnc = BezierFactory.getBezierEasing(keyData.o.x,keyData.o.y,keyData.i.x,keyData.i.y,keyData.n).get;
                        keyData.__fnct = fnc;
                    }
                    perc = fnc((frameNum-(keyData.t-offsetTime))/((nextKeyData.t-offsetTime)-(keyData.t-offsetTime)));
                    var distanceInLine = bezierData.segmentLength*perc;

                    var segmentPerc;
                    var addedLength = 0;
                    dir = 1;
                    flag = true;
                    jLen = bezierData.points.length;
                    while(flag){
                        addedLength +=bezierData.points[j].partialLength*dir;
                        if(distanceInLine === 0 || perc === 0 || j == bezierData.points.length - 1){
                            kLen = bezierData.points[j].point.length;
                            for(k=0;k<kLen;k+=1){
                                retVal[k] = bezierData.points[j].point[k];
                            }
                            break;
                        }else if(distanceInLine >= addedLength && distanceInLine < addedLength + bezierData.points[j+1].partialLength){
                            segmentPerc = (distanceInLine-addedLength)/(bezierData.points[j+1].partialLength);
                            kLen = bezierData.points[j].point.length;
                            for(k=0;k<kLen;k+=1){
                                retVal[k] = bezierData.points[j].point[k] + (bezierData.points[j+1].point[k] - bezierData.points[j].point[k])*segmentPerc;
                            }
                            break;
                        }
                        if(j < jLen - 1 && dir == 1 || j > 0 && dir == -1){
                            j += dir;
                        }else{
                            flag = false;
                        }
                    }
                }
            }else{
                var outX,outY,inX,inY, isArray = false, keyValue;
                len = keyData.s.length;
                for(i=0;i<len;i+=1){
                    if(keyData.h !== 1){
                        if(keyData.o.x instanceof Array){
                            isArray = true;
                            if(!keyData.__fnct){
                                keyData.__fnct = [];
                            }
                            if(!keyData.__fnct[i]){
                                outX = keyData.o.x[i] || keyData.o.x[0];
                                outY = keyData.o.y[i] || keyData.o.y[0];
                                inX = keyData.i.x[i] || keyData.i.x[0];
                                inY = keyData.i.y[i] || keyData.i.y[0];
                            }
                        }else{
                            isArray = false;
                            if(!keyData.__fnct) {
                                outX = keyData.o.x;
                                outY = keyData.o.y;
                                inX = keyData.i.x;
                                inY = keyData.i.y;
                            }
                        }
                        if(isArray){
                            if(keyData.__fnct[i]){
                                fnc = keyData.__fnct[i];
                            }else{
                                //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                keyData.__fnct[i] = fnc;
                            }
                        }else{
                            if(keyData.__fnct){
                                fnc = keyData.__fnct;
                            }else{
                                //fnc = bez.getEasingCurve(outX,outY,inX,inY);
                                fnc = BezierFactory.getBezierEasing(outX,outY,inX,inY).get;
                                keyData.__fnct = fnc;
                            }
                        }
                        if(frameNum >= nextKeyData.t-offsetTime){
                            perc = 1;
                        }else if(frameNum < keyData.t-offsetTime){
                            perc = 0;
                        }else{
                            perc = fnc((frameNum-(keyData.t-offsetTime))/((nextKeyData.t-offsetTime)-(keyData.t-offsetTime)));
                        }
                    }
                    if(this.sh && keyData.h !== 1){
                        var initP = keyData.s[i];
                        var endP = keyData.e[i];
                        if(initP-endP < -180){
                            initP += 360;
                        } else if(initP-endP > 180){
                            initP -= 360;
                        }
                        keyValue = initP+(endP-initP)*perc;
                    } else {
                        keyValue = keyData.h === 1 ? keyData.s[i] : keyData.s[i]+(keyData.e[i]-keyData.s[i])*perc;
                    }
                    if(len === 1){
                        retVal = keyValue;
                    }else{
                        retVal[i] = keyValue;
                    }
                }
            }
            return retVal;
        }

        function getVelocityAtTime(frameNum) {
            if(this.vel !== undefined){
                return this.vel;
            }
            var delta = -0.01;
            frameNum *= this.elem.globalData.frameRate;
            //frameNum += this.elem.data.st;
            var v1 = this.getValueAtTime(frameNum,0);
            var v2 = this.getValueAtTime(frameNum + delta,0);
            var velocity;
            if(v1.length){
                velocity = Array.apply(null,{length:v1.length});
                var i;
                for(i=0;i<v1.length;i+=1){
                    velocity[i] = this.elem.globalData.frameRate*((v2[i] - v1[i])/delta);
                }
            } else {
                velocity = (v2 - v1)/delta;
            }
            return velocity;
        };

        function setGroupProperty(propertyGroup){
            this.propertyGroup = propertyGroup;
        }

        function searchExpressions(elem,data,prop){
            if(data.x){
                prop.k = true;
                prop.x = true;
                if(prop.getValue) {
                    prop.getPreValue = prop.getValue;
                }
                prop.getValue = ExpressionManager.initiateExpression.bind(prop)(elem,data,prop);
            }
        }

        var TextExpressionSelectorProp = (function(){

            function getValueProxy(index,total){
                this.textIndex = index+1;
                this.textTotal = total;
                this.getValue();
                return this.v;
            }

            return function TextExpressionSelectorProp(elem,data){
                this.pv = 1;
                this.comp = elem.comp;
                this.elem = elem;
                this.mult = .01;
                this.type = 'textSelector';
                this.textTotal = data.totalChars;
                this.selectorValue = 100;
                this.lastValue = [1,1,1];
                searchExpressions.bind(this)(elem,data,this);
                this.getMult = getValueProxy;
                this.getVelocityAtTime = getVelocityAtTime;
                if(this.kf){
                    this.getValueAtTime = getValueAtTime;
                } else {
                    this.getValueAtTime = getStaticValueAtTime;
                }
                this.setGroupProperty = setGroupProperty;
            }
        }());


        var propertyGetProp = PropertyFactory.getProp;
        PropertyFactory.getProp = function(elem,data,type, mult, arr){
            var prop = propertyGetProp(elem,data,type, mult, arr);
            prop.getVelocityAtTime = getVelocityAtTime;
            if(prop.kf){
                prop.getValueAtTime = getValueAtTime;
            } else {
                prop.getValueAtTime = getStaticValueAtTime;
            }
            prop.setGroupProperty = setGroupProperty;
            var isAdded = prop.k;
            if(data.ix !== undefined){
                Object.defineProperty(prop,'propertyIndex',{
                    get: function(){
                        return data.ix;
                    }
                })
            }
            searchExpressions(elem,data,prop);
            if(!isAdded && prop.x){
                arr.push(prop);
            }

            return prop;
        }

        var propertyGetShapeProp = ShapePropertyFactory.getShapeProp;
        ShapePropertyFactory.getShapeProp = function(elem,data,type, arr, trims){
            var prop = propertyGetShapeProp(elem,data,type, arr, trims);
            prop.setGroupProperty = setGroupProperty;
            var isAdded = prop.k;
            if(data.ix !== undefined){
                Object.defineProperty(prop,'propertyIndex',{
                    get: function(){
                        return data.ix;
                    }
                })
            }
            if(type === 3){
                searchExpressions(elem,data.pt,prop);
            } else if(type === 4){
                searchExpressions(elem,data.ks,prop);
            }
            if(!isAdded && prop.x){
                arr.push(prop);
            }
            return prop;
        }

        var propertyGetTextProp = PropertyFactory.getTextSelectorProp;
        PropertyFactory.getTextSelectorProp = function(elem, data,arr){
            if(data.t === 1){
                return new TextExpressionSelectorProp(elem, data,arr);
            } else {
                return propertyGetTextProp(elem,data,arr);
            }
        }
    }());
    var ExpressionManager = (function(){
        var ob = {};
        var Math = BMMath;

        function duplicatePropertyValue(value, mult){
            mult = mult || 1;

            if(typeof value === 'number'){
                return value*mult;
            }else if(value.i){
                return JSON.parse(JSON.stringify(value));
            }else{
                var arr = Array.apply(null,{length:value.length});
                var i, len = value.length;
                for(i=0;i<len;i+=1){
                    arr[i]=value[i]*mult;
                }
                return arr;
            }
        }

        function $bm_neg(a){
            var tOfA = typeof a;
            if(tOfA === 'number' || tOfA === 'boolean'){
                return -a;
            }
            if(tOfA === 'object'){
                var i, lenA = a.length;
                var retArr = [];
                for(i=0;i<lenA;i+=1){
                    retArr[i] = -a[i];
                }
                return retArr;
            }
        }

        function sum(a,b) {
            var tOfA = typeof a;
            var tOfB = typeof b;
            if(tOfA === 'string' || tOfB === 'string'){
                return a + b;
            }
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')) {
                return a + b;
            }
            if(tOfA === 'object' && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')){
                a[0] = a[0] + b;
                return a;
            }
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && tOfB === 'object'){
                b[0] = a + b[0];
                return b;
            }
            if(tOfA === 'object' && tOfB === 'object'){
                var i = 0, lenA = a.length, lenB = b.length;
                var retArr = [];
                while(i<lenA || i < lenB){
                    if(typeof a[i] === 'number' && typeof b[i] === 'number'){
                        retArr[i] = a[i] + b[i];
                    }else{
                        retArr[i] = b[i] == undefined ? a[i] : a[i] || b[i];
                    }
                    i += 1;
                }
                return retArr;
            }
            return 0;
        }

        function sub(a,b) {
            var tOfA = typeof a;
            var tOfB = typeof b;
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')) {
                return a - b;
            }
            if(tOfA === 'object' && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')){
                a[0] = a[0] - b;
                return a;
            }
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && tOfB === 'object'){
                b[0] = a - b[0];
                return b;
            }
            if(tOfA === 'object' && tOfB === 'object'){
                var i = 0, lenA = a.length, lenB = b.length;
                var retArr = [];
                while(i<lenA || i < lenB){
                    if(typeof a[i] === 'number' && typeof b[i] === 'number'){
                        retArr[i] = a[i] - b[i];
                    }else{
                        retArr[i] = b[i] == undefined ? a[i] : a[i] || b[i];
                    }
                    i += 1;
                }
                return retArr;
            }
            return 0;
        }

        function mul(a,b) {
            var tOfA = typeof a;
            var tOfB = typeof b;
            var arr;
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')) {
                return a * b;
            }

            var i, len;
            if(tOfA === 'object' && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')){
                len = a.length;
                arr = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    arr[i] = a[i] * b;
                }
                return arr;
            }
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && tOfB === 'object'){
                len = b.length;
                arr = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    arr[i] = a * b[i];
                }
                return arr;
            }
            return 0;
        }

        function div(a,b) {
            var tOfA = typeof a;
            var tOfB = typeof b;
            var arr;
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')) {
                return a / b;
            }
            var i, len;
            if(tOfA === 'object' && (tOfB === 'number' || tOfB === 'boolean' || tOfB === 'string')){
                len = a.length;
                arr = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    arr[i] = a[i] / b;
                }
                return arr;
            }
            if((tOfA === 'number' || tOfA === 'boolean' || tOfA === 'string') && tOfB === 'object'){
                len = b.length;
                arr = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    arr[i] = a / b[i];
                }
                return arr;
            }
            return 0;
        }

        function clamp(num, min, max) {
            if(min > max){
                var mm = max;
                max = min;
                min = mm;
            }
            return Math.min(Math.max(num, min), max);
        }

        function radiansToDegrees(val) {
            return val/degToRads;
        }
        var radians_to_degrees = radiansToDegrees;

        function degreesToRadians(val) {
            return val*degToRads;
        }
        var degrees_to_radians = radiansToDegrees;

        var helperLengthArray = [0,0,0,0,0,0];

        function length(arr1,arr2){
            if(typeof arr1 === "number"){
                arr2 = arr2 || 0;
                return Math.abs(arr1 - arr2);
            }
            if(!arr2){
                arr2 = helperLengthArray;
            }
            var i,len = Math.min(arr1.length,arr2.length);
            var addedLength = 0;
            for(i=0;i<len;i+=1){
                addedLength += Math.pow(arr2[i]-arr1[i],2);
            }
            return Math.sqrt(addedLength);
        }

        function normalize(vec){
            return div(vec, length(vec));
        }

        function rgbToHsl(val){
            var r = val[0]; var g = val[1]; var b = val[2];
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max == min){
                h = s = 0; // achromatic
            }else{
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return [h, s, l,val[3]];
        }
        function hslToRgb(val){
            var h = val[0];
            var s = val[1];
            var l = val[2];

            var r, g, b;

            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                function hue2rgb(p, q, t){
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return [r, g , b, val[3]];
        }

        function linear(t, tMin, tMax, value1, value2){
            if(value1 === undefined || value2 === undefined){
                return linear(t,0,1,tMin,tMax);
            }
            if(t <= tMin) {
                return value1;
            }else if(t >= tMax){
                return value2;
            }
            var perc = tMax === tMin ? 0 : (t-tMin)/(tMax-tMin);
            if(!value1.length){
                return value1 + (value2-value1)*perc;
            }
            var i, len = value1.length;
            var arr = Array.apply( null, { length: len } );
            for(i=0;i<len;i+=1){
                arr[i] = value1[i] + (value2[i]-value1[i])*perc;
            }
            return arr;
        }
        function random(min,max){
            if(max === undefined){
                if(min === undefined){
                    min = 0;
                    max = 1;
                } else {
                    max = min;
                    min = undefined;
                }
            }
            if(max.length){
                var i, len = max.length;
                if(!min){
                    min = Array.apply(null,{length:len});
                }
                var arr = Array.apply(null,{length:len});
                var rnd = BMMath.random();
                for(i=0;i<len;i+=1){
                    arr[i] = min[i] + rnd*(max[i]-min[i])
                }
                return arr;
            }
            if(min === undefined){
                min = 0;
            }
            var rndm = BMMath.random();
            return min + rndm*(max-min);
        }

        function initiateExpression(elem,data,property){
            var val = data.x;
            var needsVelocity = val.indexOf('velocity') !== -1;
            var elemType = elem.data.ty;
            var transform,content,effect;
            var thisComp = elem.comp;
            var thisProperty = property;
            elem.comp.frameDuration = 1/elem.comp.globalData.frameRate;
            var inPoint = elem.data.ip/elem.comp.globalData.frameRate;
            var outPoint = elem.data.op/elem.comp.globalData.frameRate;
            var thisLayer,thisComp;
            var fn = new Function();
            //var fnStr = 'var fn = function(){'+val+';this.v = $bm_rt;}';
            //eval(fnStr);
            var fn = eval('[function(){' + val+';this.v = $bm_rt;}' + ']')[0];
            var bindedFn = fn.bind(this);
            var numKeys = data.k ? data.k.length : 0;

            var wiggle = function wiggle(freq,amp){
                var i,j, len = this.pv.length ? this.pv.length : 1;
                var addedAmps = Array.apply(null,{len:len});
                for(j=0;j<len;j+=1){
                    addedAmps[j] = 0;
                }
                freq = 5;
                var iterations = Math.floor(time*freq);
                i = 0;
                j = 0;
                while(i<iterations){
                    //var rnd = BMMath.random();
                    for(j=0;j<len;j+=1){
                        addedAmps[j] += -amp + amp*2*BMMath.random();
                        //addedAmps[j] += -amp + amp*2*rnd;
                    }
                    i += 1;
                }
                //var rnd2 = BMMath.random();
                var periods = time*freq;
                var perc = periods - Math.floor(periods);
                var arr = Array.apply({length:len});
                for(j=0;j<len;j+=1){
                    arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp*2*BMMath.random())*perc;
                    //arr[j] = this.pv[j] + addedAmps[j] + (-amp + amp*2*rnd)*perc;
                    //arr[i] = this.pv[i] + addedAmp + amp1*perc + amp2*(1-perc);
                }
                return arr;
            }.bind(this);

            var loopIn = function loopIn(type,duration, durationFlag) {
                if(!this.k){
                    return this.pv;
                }
                var currentFrame = time*elem.comp.globalData.frameRate;
                var keyframes = this.keyframes;
                var firstKeyFrame = keyframes[0].t;
                if(currentFrame>=firstKeyFrame){
                    return this.pv;
                }else{
                    var cycleDuration, lastKeyFrame;
                    if(!durationFlag){
                        if(!duration || duration > keyframes.length - 1){
                            duration = keyframes.length - 1;
                        }
                        lastKeyFrame = keyframes[duration].t;
                        cycleDuration = lastKeyFrame - firstKeyFrame;
                    } else {
                        if(!duration){
                            cycleDuration = Math.max(0,this.elem.data.op - firstKeyFrame);
                        } else {
                            cycleDuration = Math.abs(elem.comp.globalData.frameRate*duration);
                        }
                        lastKeyFrame = firstKeyFrame + cycleDuration;
                    }
                    var i, len, ret;
                    if(type === 'pingpong') {
                        var iterations = Math.floor((firstKeyFrame - currentFrame)/cycleDuration);
                        if(iterations % 2 === 0){
                            return this.getValueAtTime((firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame, 0);
                        }
                    } else if(type === 'offset'){
                        var initV = this.getValueAtTime(firstKeyFrame, 0);
                        var endV = this.getValueAtTime(lastKeyFrame, 0);
                        var current = this.getValueAtTime(cycleDuration - (firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame, 0);
                        var repeats = Math.floor((firstKeyFrame - currentFrame)/cycleDuration)+1;
                        if(this.pv.length){
                            ret = new Array(initV.length);
                            len = ret.length;
                            for(i=0;i<len;i+=1){
                                ret[i] = current[i]-(endV[i]-initV[i])*repeats;
                            }
                            return ret;
                        }
                        return current-(endV-initV)*repeats;
                    } else if(type === 'continue'){
                        var firstValue = this.getValueAtTime(firstKeyFrame, 0);
                        var nextFirstValue = this.getValueAtTime(firstKeyFrame + 0.001, 0);
                        if(this.pv.length){
                            ret = new Array(firstValue.length);
                            len = ret.length;
                            for(i=0;i<len;i+=1){
                                ret[i] = firstValue[i] + (firstValue[i]-nextFirstValue[i])*(firstKeyFrame - currentFrame)/0.0005;
                            }
                            return ret;
                        }
                        return firstValue + (firstValue-nextFirstValue)*(firstKeyFrame - currentFrame)/0.0005;
                    }
                    return this.getValueAtTime(cycleDuration - (firstKeyFrame - currentFrame)%cycleDuration +  firstKeyFrame, 0);
                }
            }.bind(this);

            var loopInDuration = function loopInDuration(type,duration){
                return loopIn(type,duration,true);
            }.bind(this);

            var loopOut = function loopOut(type,duration,durationFlag){
                if(!this.k || !this.keyframes){
                    return this.pv;
                }
                var currentFrame = time*elem.comp.globalData.frameRate;
                var keyframes = this.keyframes;
                var lastKeyFrame = keyframes[keyframes.length - 1].t;
                if(currentFrame<=lastKeyFrame){
                    return this.pv;
                }else{
                    var cycleDuration, firstKeyFrame;
                    if(!durationFlag){
                        if(!duration || duration > keyframes.length - 1){
                            duration = keyframes.length - 1;
                        }
                        firstKeyFrame = keyframes[keyframes.length - 1 - duration].t;
                        cycleDuration = lastKeyFrame - firstKeyFrame;
                    } else {
                        if(!duration){
                            cycleDuration = Math.max(0,lastKeyFrame - this.elem.data.ip);
                        } else {
                            cycleDuration = Math.abs(lastKeyFrame - elem.comp.globalData.frameRate*duration);
                        }
                        firstKeyFrame = lastKeyFrame - cycleDuration;
                    }
                    var i, len, ret;
                    if(type === 'pingpong') {
                        var iterations = Math.floor((currentFrame - firstKeyFrame)/cycleDuration);
                        if(iterations % 2 !== 0){
                            return this.getValueAtTime(cycleDuration - (currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame, 0);
                        }
                    } else if(type === 'offset'){
                        var initV = this.getValueAtTime(firstKeyFrame, 0);
                        var endV = this.getValueAtTime(lastKeyFrame, 0);
                        var current = this.getValueAtTime((currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame, 0);
                        var repeats = Math.floor((currentFrame - firstKeyFrame)/cycleDuration);
                        if(this.pv.length){
                            ret = new Array(initV.length);
                            len = ret.length;
                            for(i=0;i<len;i+=1){
                                ret[i] = (endV[i]-initV[i])*repeats + current[i];
                            }
                            return ret;
                        }
                        return (endV-initV)*repeats + current;
                    } else if(type === 'continue'){
                        var lastValue = this.getValueAtTime(lastKeyFrame, 0);
                        var nextLastValue = this.getValueAtTime(lastKeyFrame - 0.001, 0);
                        if(this.pv.length){
                            ret = new Array(lastValue.length);
                            len = ret.length;
                            for(i=0;i<len;i+=1){
                                ret[i] = lastValue[i] + (lastValue[i]-nextLastValue[i])*(currentFrame - lastKeyFrame)/0.0005;
                            }
                            return ret;
                        }
                        return lastValue + (lastValue-nextLastValue)*(currentFrame - lastKeyFrame)/0.0005;
                    }
                    return this.getValueAtTime((currentFrame - firstKeyFrame)%cycleDuration +  firstKeyFrame, 0);
                }
            }.bind(this);
            var loop_out = loopOut;

            var loopOutDuration = function loopOutDuration(type,duration){
                return loopOut(type,duration,true);
            }.bind(this);

            var valueAtTime = function valueAtTime(t) {
                return this.getValueAtTime(t*elem.comp.globalData.frameRate, 0);
            }.bind(this);

            var velocityAtTime = function velocityAtTime(t) {
                return this.getVelocityAtTime(t);
            }.bind(this);

            var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData.projectInterface);

            function lookAt(elem1,elem2){
                var fVec = [elem2[0]-elem1[0],elem2[1]-elem1[1],elem2[2]-elem1[2]];
                var pitch = Math.atan2(fVec[0],Math.sqrt(fVec[1]*fVec[1]+fVec[2]*fVec[2]))/degToRads;
                var yaw = -Math.atan2(fVec[1],fVec[2])/degToRads;
                return [yaw,pitch,0];
            }

            function easeOut(t, val1, val2){
                return -(val2-val1) * t*(t-2) + val1;
            }

            function nearestKey(time){
                var i, len = data.k.length,index,keyTime;
                if(!data.k.length || typeof(data.k[0]) === 'number'){
                    index = 0;
                    keyTime = 0;
                } else {
                    index = -1;
                    time *= elem.comp.globalData.frameRate;
                    for(i=0;i<len-1;i+=1){
                        if(time === data.k[i].t){
                            index = i + 1;
                            keyTime = data.k[i].t;
                            break;
                        }else if(time>data.k[i].t && time<data.k[i+1].t){
                            if(time-data.k[i].t > data.k[i+1].t - time){
                                index = i + 2;
                                keyTime = data.k[i+1].t;
                            } else {
                                index = i + 1;
                                keyTime = data.k[i].t;
                            }
                            break;
                        }
                    }
                    if(index === -1){
                        index = i + 1;
                        keyTime = data.k[i].t;
                    }
                }
                var ob = {};
                ob.index = index;
                ob.time = keyTime/elem.comp.globalData.frameRate;
                return ob;
            }

            function key(ind){
                if(!data.k.length || typeof(data.k[0]) === 'number'){
                    return {time:0};
                }
                ind -= 1;
                var ob = {
                    time: data.k[ind].t/elem.comp.globalData.frameRate
                };
                var arr;
                if(ind === data.k.length - 1){
                    arr = data.k[ind-1].e;
                }else{
                    arr = data.k[ind].s;
                }
                var i, len = arr.length;
                for(i=0;i<len;i+=1){
                    ob[i] = arr[i];
                }
                return ob;
            }

            function framesToTime(frames,fps){
                if(!fps){
                    fps = elem.comp.globalData.frameRate;
                }
                return frames/fps;
            }

            function timeToFrames(t,fps){
                if(!t){
                    t = time;
                }
                if(!fps){
                    fps = elem.comp.globalData.frameRate;
                }
                return t*fps;
            }

            var toworldMatrix = new Matrix();
            function toWorld(arr){
                toworldMatrix.reset();
                elem.finalTransform.mProp.applyToMatrix(toworldMatrix);
                if(elem.hierarchy && elem.hierarchy.length){
                    var i, len = elem.hierarchy.length;
                    for(i=0;i<len;i+=1){
                        elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toworldMatrix);
                    }
                    return toworldMatrix.applyToPointArray(arr[0],arr[1],arr[2]||0);
                }
                return toworldMatrix.applyToPointArray(arr[0],arr[1],arr[2]||0);
            }

            var fromworldMatrix = new Matrix();
            function fromWorld(arr){
                fromworldMatrix.reset();
                var pts = [];
                pts.push(arr);
                elem.finalTransform.mProp.applyToMatrix(fromworldMatrix);
                if(elem.hierarchy && elem.hierarchy.length){
                    var i, len = elem.hierarchy.length;
                    for(i=0;i<len;i+=1){
                        elem.hierarchy[i].finalTransform.mProp.applyToMatrix(fromworldMatrix);
                    }
                    return fromworldMatrix.inversePoints(pts)[0];
                }
                return fromworldMatrix.inversePoints(pts)[0];
            }

            function seedRandom(seed){
                BMMath.seedrandom(randSeed + seed);
            };

            var time,velocity, value,textIndex,textTotal,selectorValue, index = elem.data.ind + 1;
            var hasParent = !!(elem.hierarchy && elem.hierarchy.length);
            var parent;
            var randSeed = Math.floor(Math.random()*1000000);
            function execute(){
                seedRandom(randSeed);
                if(this.frameExpressionId === elem.globalData.frameId && this.type !== 'textSelector'){
                    return;
                }
                if(this.lock){
                    this.v = duplicatePropertyValue(this.pv,this.mult);
                    return true;
                }
                if(this.type === 'textSelector'){
                    textIndex = this.textIndex;
                    textTotal = this.textTotal;
                    selectorValue = this.selectorValue;
                }
                if(!thisLayer){
                    thisLayer = elem.layerInterface;
                    thisComp = elem.comp.compInterface;
                }
                if(!transform){
                    transform = elem.layerInterface("ADBE Transform Group");
                }
                if(elemType === 4 && !content){
                    content = thisLayer("ADBE Root Vectors Group");
                }
                if(!effect){
                    effect = thisLayer(4);
                }
                hasParent = !!(elem.hierarchy && elem.hierarchy.length);
                if(hasParent && !parent){
                    parent = elem.hierarchy[elem.hierarchy.length - 1].layerInterface;
                }
                this.lock = true;
                if(this.getPreValue){
                    this.getPreValue();
                }
                value = this.pv;
                time = this.comp.renderedFrame/this.comp.globalData.frameRate;
                if(needsVelocity){
                    velocity = velocityAtTime(time);
                }
                bindedFn();
                this.frameExpressionId = elem.globalData.frameId;
                var i,len;
                if(this.mult){
                    if(typeof this.v === 'number'){
                        this.v *= this.mult;
                    }else{
                        len = this.v.length;
                        if(value === this.v){
                            this.v = len === 2 ? [value[0],value[1]] : [value[0],value[1],value[2]];
                        }
                        for(i = 0; i < len; i += 1){
                            this.v[i] *= this.mult;
                        }
                    }
                }

                /*if(!this.v){
                 console.log(val);
                 }*/
                if(typeof this.v === 'number'){
                    if(this.lastValue !== this.v){
                        this.lastValue = this.v;
                        this.mdf = true;
                    }
                }else if(this.v.i){
                    // Todo Improve validation for masks and shapes
                    this.mdf = true;
                    this.paths.length = 0;
                    this.paths[0] = this.v;
                }else{
                    /*if(!this.lastValue){
                     }*/
                    len = this.v.length;
                    for(i = 0; i < len; i += 1){
                        if(this.v[i] !== this.lastValue[i]){
                            this.lastValue[i] = this.v[i];
                            this.mdf = true;
                        }
                    }
                }
                this.lock = false;
            }
            return execute;
        }

        ob.initiateExpression = initiateExpression;
        return ob;
    }());
    var ShapeExpressionInterface = (function(){
        var ob = {
            createShapeInterface:createShapeInterface,
            createGroupInterface:createGroupInterface,
            createTrimInterface:createTrimInterface,
            createStrokeInterface:createStrokeInterface,
            createTransformInterface:createTransformInterface,
            createEllipseInterface:createEllipseInterface,
            createStarInterface:createStarInterface,
            createRectInterface:createRectInterface,
            createRoundedInterface:createRoundedInterface,
            createPathInterface:createPathInterface,
            createFillInterface:createFillInterface
        };
        function createShapeInterface(shapes,view,propertyGroup){
            return shapeInterfaceFactory(shapes,view,propertyGroup);
        }
        function createGroupInterface(shapes,view,propertyGroup){
            return groupInterfaceFactory(shapes,view,propertyGroup);
        }
        function createFillInterface(shape,view,propertyGroup){
            return fillInterfaceFactory(shape,view,propertyGroup);
        }
        function createStrokeInterface(shape,view,propertyGroup){
            return strokeInterfaceFactory(shape,view,propertyGroup);
        }
        function createTrimInterface(shape,view,propertyGroup){
            return trimInterfaceFactory(shape,view,propertyGroup);
        }
        function createTransformInterface(shape,view,propertyGroup){
            return transformInterfaceFactory(shape,view,propertyGroup);
        }
        function createEllipseInterface(shape,view,propertyGroup){
            return ellipseInterfaceFactory(shape,view,propertyGroup);
        }
        function createStarInterface(shape,view,propertyGroup){
            return starInterfaceFactory(shape,view,propertyGroup);
        }
        function createRectInterface(shape,view,propertyGroup){
            return rectInterfaceFactory(shape,view,propertyGroup);
        }
        function createRoundedInterface(shape,view,propertyGroup){
            return roundedInterfaceFactory(shape,view,propertyGroup);
        }
        function createPathInterface(shape,view,propertyGroup){
            return pathInterfaceFactory(shape,view,propertyGroup);
        }

        function iterateElements(shapes,view, propertyGroup){
            var arr = [];
            var i, len = shapes ? shapes.length : 0;
            for(i=0;i<len;i+=1){
                if(shapes[i].ty == 'gr'){
                    arr.push(ShapeExpressionInterface.createGroupInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'fl'){
                    arr.push(ShapeExpressionInterface.createFillInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'st'){
                    arr.push(ShapeExpressionInterface.createStrokeInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'tm'){
                    arr.push(ShapeExpressionInterface.createTrimInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'tr'){
                    //arr.push(ShapeExpressionInterface.createTransformInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'el'){
                    arr.push(ShapeExpressionInterface.createEllipseInterface(shapes[i],view[i],propertyGroup));
                }else if(shapes[i].ty == 'sr'){
                    arr.push(ShapeExpressionInterface.createStarInterface(shapes[i],view[i],propertyGroup));
                } else if(shapes[i].ty == 'sh'){
                    arr.push(ShapeExpressionInterface.createPathInterface(shapes[i],view[i],propertyGroup));
                } else if(shapes[i].ty == 'rc'){
                    arr.push(ShapeExpressionInterface.createRectInterface(shapes[i],view[i],propertyGroup));
                } else if(shapes[i].ty == 'rd'){
                    arr.push(ShapeExpressionInterface.createRoundedInterface(shapes[i],view[i],propertyGroup));
                } else{
                    //console.log(shapes[i].ty);
                }
            }
            return arr;
        }

        var shapeInterfaceFactory = (function(){
            return function(shapes,view,propertyGroup){
                var interfaces;
                function _interfaceFunction(value){
                    if(typeof value === 'number'){
                        return interfaces[value-1];
                    } else {
                        var i = 0, len = interfaces.length;
                        while(i<len){
                            if(interfaces[i]._name === value){
                                return interfaces[i];
                            }
                            i+=1;
                        }
                    }
                }
                _interfaceFunction.propertyGroup = propertyGroup;
                interfaces = iterateElements(shapes, view, _interfaceFunction);
                return _interfaceFunction;
            }
        }());

        var contentsInterfaceFactory = (function(){
            return function(shape,view, propertyGroup){
                var interfaces;
                var interfaceFunction = function _interfaceFunction(value){
                    if(typeof value === 'number'){
                        return interfaces[value-1];
                    }
                    var i = 0, len = interfaces.length;
                    while(i<len){
                        if(interfaces[i]._name === value || interfaces[i].mn === value){
                            return interfaces[i];
                        }
                        i+=1;
                    }
                };
                interfaceFunction.propertyGroup = function(val){
                    if(val === 1){
                        return interfaceFunction;
                    } else{
                        return propertyGroup(val-1);
                    }
                };
                interfaces = iterateElements(shape.it, view.it, interfaceFunction.propertyGroup);
                interfaceFunction.numProperties = interfaces.length;

                return interfaceFunction;
            }
        }());

        var groupInterfaceFactory = (function(){
            return function(shape,view, propertyGroup){
                var interfaceFunction = function _interfaceFunction(value){
                    switch(value){
                        case 'ADBE Vectors Group':
                        case 2:
                            return interfaceFunction.content;
                        case 'ADBE Vector Transform Group':
                        case 3:
                        default:
                            return interfaceFunction.transform;
                    }
                    /*if(value === 'ADBE Vector Transform Group'){
                     return interfaceFunction.transform;
                     var i = 0, len = interfaces.length;
                     while(i<len){
                     if(interfaces[i].ty === 'tr'){
                     return interfaces[i];
                     }
                     i+=1;
                     }
                     return null;
                     }
                     if(typeof value === 'number'){
                     return interfaces[value-1];
                     } else {
                     var i = 0, len = interfaces.length;
                     while(i<len){
                     if(interfaces[i]._name === value){
                     return interfaces[i];
                     }
                     i+=1;
                     }
                     }*/
                }
                interfaceFunction.propertyGroup = function(val){
                    if(val === 1){
                        return interfaceFunction;
                    } else{
                        return propertyGroup(val-1);
                    }
                };
                var content = contentsInterfaceFactory(shape,view,interfaceFunction.propertyGroup);
                var transformInterface = ShapeExpressionInterface.createTransformInterface(shape.it[shape.it.length - 1],view.it[view.it.length - 1],interfaceFunction.propertyGroup);
                interfaceFunction.content = content;
                interfaceFunction.transform = transformInterface;
                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                //interfaceFunction.content = interfaceFunction;
                interfaceFunction.numProperties = 1;
                interfaceFunction.nm = shape.nm;
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var fillInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){

                view.c.setGroupProperty(propertyGroup);
                view.o.setGroupProperty(propertyGroup);
                var ob = {
                    get color(){
                        if(view.c.k){
                            view.c.getValue();
                        }
                        return [view.c.v[0]/view.c.mult,view.c.v[1]/view.c.mult,view.c.v[2]/view.c.mult,1];
                    },
                    get opacity(){
                        if(view.o.k){
                            view.o.getValue();
                        }
                        return view.o.v;
                    },
                    _name: shape.nm,
                    mn: shape.mn
                };
                return ob;
            }
        }());

        var strokeInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val === 1){
                        return ob;
                    } else{
                        return propertyGroup(val-1);
                    }
                };
                view.c.setGroupProperty(_propertyGroup);
                view.o.setGroupProperty(_propertyGroup);
                view.w.setGroupProperty(_propertyGroup);
                var ob = {
                    get color(){
                        if(view.c.k){
                            view.c.getValue();
                        }
                        return [view.c.v[0]/view.c.mult,view.c.v[1]/view.c.mult,view.c.v[2]/view.c.mult,1];
                    },
                    get opacity(){
                        if(view.o.k){
                            view.o.getValue();
                        }
                        return view.o.v;
                    },
                    get strokeWidth(){
                        if(view.w.k){
                            view.w.getValue();
                        }
                        return view.w.v;
                    },
                    dashOb: {},
                    get dash(){
                        var d = view.d;
                        var dModels = shape.d;
                        var i, len = dModels.length;
                        for(i=0;i<len;i+=1){
                            if(d.dataProps[i].p.k){
                                d.dataProps[i].p.getValue();
                            }
                            d.dataProps[i].p.setGroupProperty(propertyGroup);
                            this.dashOb[dModels[i].nm] = d.dataProps[i].p.v;
                        }
                        return this.dashOb;
                    },
                    _name: shape.nm,
                    mn: shape.mn
                };
                return ob;
            }
        }());

        var trimInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                interfaceFunction.propertyIndex = shape.ix;

                view.s.setGroupProperty(_propertyGroup);
                view.e.setGroupProperty(_propertyGroup);
                view.o.setGroupProperty(_propertyGroup);

                function interfaceFunction(val){
                    if(val === shape.e.ix){
                        return interfaceFunction.end;
                    }
                    if(val === shape.s.ix){
                        return interfaceFunction.start;
                    }
                    if(val === shape.o.ix){
                        return interfaceFunction.offset;
                    }
                }
                interfaceFunction.propertyIndex = shape.ix;
                Object.defineProperty(interfaceFunction, 'start', {
                    get: function(){
                        if(view.s.k){
                            view.s.getValue();
                        }
                        return view.s.v/view.s.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'end', {
                    get: function(){
                        if(view.e.k){
                            view.e.getValue();
                        }
                        return view.e.v/view.e.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'offset', {
                    get: function(){
                        if(view.o.k){
                            view.o.getValue();
                        }
                        return view.o.v;
                    }
                });
                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var transformInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                view.transform.mProps.o.setGroupProperty(_propertyGroup);
                view.transform.mProps.p.setGroupProperty(_propertyGroup);
                view.transform.mProps.a.setGroupProperty(_propertyGroup);
                view.transform.mProps.s.setGroupProperty(_propertyGroup);
                view.transform.mProps.r.setGroupProperty(_propertyGroup);
                if(view.transform.mProps.sk){
                    view.transform.mProps.sk.setGroupProperty(_propertyGroup);
                    view.transform.mProps.sa.setGroupProperty(_propertyGroup);
                }
                view.transform.op.setGroupProperty(_propertyGroup);

                function interfaceFunction(value){
                    if(shape.a.ix === value){
                        return interfaceFunction.anchorPoint;
                    }
                    if(shape.o.ix === value){
                        return interfaceFunction.opacity;
                    }
                    if(shape.p.ix === value){
                        return interfaceFunction.position;
                    }
                    if(shape.r.ix === value){
                        return interfaceFunction.rotation;
                    }
                    if(shape.s.ix === value){
                        return interfaceFunction.scale;
                    }
                    if(shape.sk && shape.sk.ix === value){
                        return interfaceFunction.skew;
                    }
                    if(shape.sa && shape.sa.ix === value){
                        return interfaceFunction.skewAxis;
                    }
                    if(value === 'Opacity') {
                        return interfaceFunction.opacity;
                    }
                    if(value === 'Position') {
                        return interfaceFunction.position;
                    }
                    if(value === 'Anchor Point') {
                        return interfaceFunction.anchorPoint;
                    }
                    if(value === 'Scale') {
                        return interfaceFunction.scale;
                    }
                    if(value === 'Rotation') {
                        return interfaceFunction.rotation;
                    }
                    if(value === 'Skew') {
                        return interfaceFunction.skew;
                    }
                    if(value === 'Skew Axis') {
                        return interfaceFunction.skewAxis;
                    }

                }
                Object.defineProperty(interfaceFunction, 'opacity', {
                    get: function(){
                        if(view.transform.mProps.o.k){
                            view.transform.mProps.o.getValue();
                        }
                        return view.transform.mProps.o.v/view.transform.mProps.o.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'position', {
                    get: function(){
                        if(view.transform.mProps.p.k){
                            view.transform.mProps.p.getValue();
                        }
                        return [view.transform.mProps.p.v[0],view.transform.mProps.p.v[1]];
                    }
                });
                Object.defineProperty(interfaceFunction, 'anchorPoint', {
                    get: function(){
                        if(view.transform.mProps.a.k){
                            view.transform.mProps.a.getValue();
                        }
                        return [view.transform.mProps.a.v[0],view.transform.mProps.a.v[1]];
                    }
                });
                var scaleArray = [];
                Object.defineProperty(interfaceFunction, 'scale', {
                    get: function(){
                        if(view.transform.mProps.s.k){
                            view.transform.mProps.s.getValue();
                        }
                        scaleArray[0] = view.transform.mProps.s.v[0]/view.transform.mProps.s.mult;
                        scaleArray[1] = view.transform.mProps.s.v[1]/view.transform.mProps.s.mult;
                        return scaleArray;
                    }
                });
                Object.defineProperty(interfaceFunction, 'rotation', {
                    get: function(){
                        if(view.transform.mProps.r.k){
                            view.transform.mProps.r.getValue();
                        }
                        return view.transform.mProps.r.v/view.transform.mProps.r.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'skew', {
                    get: function(){
                        if(view.transform.mProps.sk.k){
                            view.transform.mProps.sk.getValue();
                        }
                        return view.transform.mProps.sk.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'skewAxis', {
                    get: function(){
                        if(view.transform.mProps.sa.k){
                            view.transform.mProps.sa.getValue();
                        }
                        return view.transform.mProps.sa.v;
                    }
                });
                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.ty = 'tr';
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var ellipseInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                interfaceFunction.propertyIndex = shape.ix;
                var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
                prop.s.setGroupProperty(_propertyGroup);
                prop.p.setGroupProperty(_propertyGroup);
                function interfaceFunction(value){
                    if(shape.p.ix === value){
                        return interfaceFunction.position;
                    }
                    if(shape.s.ix === value){
                        return interfaceFunction.size;
                    }
                }
                Object.defineProperty(interfaceFunction, 'size', {
                    get: function(){
                        if(prop.s.k){
                            prop.s.getValue();
                        }
                        return [prop.s.v[0],prop.s.v[1]];
                    }
                });
                Object.defineProperty(interfaceFunction, 'position', {
                    get: function(){
                        if(prop.p.k){
                            prop.p.getValue();
                        }
                        return [prop.p.v[0],prop.p.v[1]];
                    }
                });
                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var starInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
                interfaceFunction.propertyIndex = shape.ix;
                prop.or.setGroupProperty(_propertyGroup);
                prop.os.setGroupProperty(_propertyGroup);
                prop.pt.setGroupProperty(_propertyGroup);
                prop.p.setGroupProperty(_propertyGroup);
                prop.r.setGroupProperty(_propertyGroup);
                if(shape.ir){
                    prop.ir.setGroupProperty(_propertyGroup);
                    prop.is.setGroupProperty(_propertyGroup);
                }

                function interfaceFunction(value){
                    if(shape.p.ix === value){
                        return interfaceFunction.position;
                    }
                    if(shape.r.ix === value){
                        return interfaceFunction.rotation;
                    }
                    if(shape.pt.ix === value){
                        return interfaceFunction.points;
                    }
                    if(shape.or.ix === value || 'ADBE Vector Star Outer Radius' === value){
                        return interfaceFunction.outerRadius;
                    }
                    if(shape.os.ix === value){
                        return interfaceFunction.outerRoundness;
                    }
                    if(shape.ir && (shape.ir.ix === value || 'ADBE Vector Star Inner Radius' === value)){
                        return interfaceFunction.innerRadius;
                    }
                    if(shape.is && shape.is.ix === value){
                        return interfaceFunction.innerRoundness;
                    }

                }
                Object.defineProperty(interfaceFunction, 'position', {
                    get: function(){
                        if(prop.p.k){
                            prop.p.getValue();
                        }
                        return prop.p.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'rotation', {
                    get: function(){
                        if(prop.r.k){
                            prop.r.getValue();
                        }
                        return prop.r.v/prop.r.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'points', {
                    get: function(){
                        if(prop.pt.k){
                            prop.pt.getValue();
                        }
                        return prop.pt.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'outerRadius', {
                    get: function(){
                        if(prop.or.k){
                            prop.or.getValue();
                        }
                        return prop.or.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'outerRoundness', {
                    get: function(){
                        if(prop.os.k){
                            prop.os.getValue();
                        }
                        return prop.os.v/prop.os.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, 'innerRadius', {
                    get: function(){
                        if(!prop.ir){
                            return 0;
                        }
                        if(prop.ir.k){
                            prop.ir.getValue();
                        }
                        return prop.ir.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'innerRoundness', {
                    get: function(){
                        if(!prop.is){
                            return 0;
                        }
                        if(prop.is.k){
                            prop.is.getValue();
                        }
                        return prop.is.v/prop.is.mult;
                    }
                });
                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var rectInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
                interfaceFunction.propertyIndex = shape.ix;
                prop.p.setGroupProperty(_propertyGroup);
                prop.s.setGroupProperty(_propertyGroup);
                prop.r.setGroupProperty(_propertyGroup);

                function interfaceFunction(value){
                    if(shape.p.ix === value){
                        return interfaceFunction.position;
                    }
                    if(shape.r.ix === value){
                        return interfaceFunction.rotation;
                    }
                    if(shape.pt.ix === value){
                        return interfaceFunction.points;
                    }
                    if(shape.or.ix === value || 'ADBE Vector Star Outer Radius' === value){
                        return interfaceFunction.outerRadius;
                    }
                    if(shape.os.ix === value){
                        return interfaceFunction.outerRoundness;
                    }
                    if(shape.ir && (shape.ir.ix === value || 'ADBE Vector Star Inner Radius' === value)){
                        return interfaceFunction.innerRadius;
                    }
                    if(shape.is && shape.is.ix === value){
                        return interfaceFunction.innerRoundness;
                    }

                }
                Object.defineProperty(interfaceFunction, 'position', {
                    get: function(){
                        if(prop.p.k){
                            prop.p.getValue();
                        }
                        return prop.p.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'roundness', {
                    get: function(){
                        if(prop.r.k){
                            prop.r.getValue();
                        }
                        return prop.r.v;
                    }
                });
                Object.defineProperty(interfaceFunction, 'size', {
                    get: function(){
                        if(prop.s.k){
                            prop.s.getValue();
                        }
                        return prop.s.v;
                    }
                });

                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var roundedInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                function _propertyGroup(val){
                    if(val == 1){
                        return interfaceFunction;
                    } else {
                        return propertyGroup(--val);
                    }
                }
                var prop = view;
                interfaceFunction.propertyIndex = shape.ix;
                prop.rd.setGroupProperty(_propertyGroup);

                function interfaceFunction(value){
                    if(shape.r.ix === value || 'Round Corners 1' === value){
                        return interfaceFunction.radius;
                    }

                }
                Object.defineProperty(interfaceFunction, 'radius', {
                    get: function(){
                        if(prop.rd.k){
                            prop.rd.getValue();
                        }
                        return prop.rd.v;
                    }
                });

                Object.defineProperty(interfaceFunction, '_name', {
                    get: function(){
                        return shape.nm;
                    }
                });
                interfaceFunction.mn = shape.mn;
                return interfaceFunction;
            }
        }());

        var pathInterfaceFactory = (function(){
            return function(shape,view,propertyGroup){
                var prop = view.sh.ty === 'tm' ? view.sh.prop : view.sh;
                prop.setGroupProperty(propertyGroup);
                var ob = {
                    get shape(){
                        if(prop.k){
                            prop.getValue();
                        }
                        return prop.v;
                    },
                    get path(){
                        if(prop.k){
                            prop.getValue();
                        }
                        return prop.v;
                    },
                    _name: shape.nm,
                    mn: shape.mn
                }
                return ob;
            }
        }());


        return ob;
    }())

    var LayerExpressionInterface = (function (){
        function toWorld(arr){
            var toWorldMat = new Matrix();
            toWorldMat.reset();
            this._elem.finalTransform.mProp.applyToMatrix(toWorldMat);
            if(this._elem.hierarchy && this._elem.hierarchy.length){
                var i, len = this._elem.hierarchy.length;
                for(i=0;i<len;i+=1){
                    this._elem.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
                }
                return toWorldMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
            }
            return toWorldMat.applyToPointArray(arr[0],arr[1],arr[2]||0);
        }


        return function(elem){

            var transformInterface = TransformExpressionInterface(elem.transform);

            function _registerMaskInterface(maskManager){
                _thisLayerFunction.mask = maskManager.getMask.bind(maskManager);
            }
            function _registerEffectsInterface(effects){
                _thisLayerFunction.effect = effects;
            }

            function _thisLayerFunction(name){
                switch(name){
                    case "ADBE Root Vectors Group":
                    case 2:
                        return _thisLayerFunction.shapeInterface;
                    case 1:
                    case "Transform":
                    case "transform":
                    case "ADBE Transform Group":
                        return transformInterface;
                    case 4:
                    case "ADBE Effect Parade":
                        return _thisLayerFunction.effect;
                }
            }
            _thisLayerFunction.toWorld = toWorld;
            _thisLayerFunction.toComp = toWorld;
            _thisLayerFunction._elem = elem;
            Object.defineProperty(_thisLayerFunction, 'hasParent', {
                get: function(){
                    return !!elem.hierarchy;
                }
            });
            Object.defineProperty(_thisLayerFunction, 'parent', {
                get: function(){
                    return elem.hierarchy[0].layerInterface;
                }
            });
            Object.defineProperty(_thisLayerFunction, "rotation", {
                get: function(){
                    return transformInterface.rotation;
                }
            });
            Object.defineProperty(_thisLayerFunction, "scale", {
                get: function () {
                    return transformInterface.scale;
                }
            });

            Object.defineProperty(_thisLayerFunction, "position", {
                get: function () {
                    return transformInterface.position;
                }
            });

            Object.defineProperty(_thisLayerFunction, "anchorPoint", {
                get: function () {
                    return transformInterface.anchorPoint;
                }
            });

            Object.defineProperty(_thisLayerFunction, "transform", {
                get: function () {
                    return transformInterface;
                }
            });
            Object.defineProperty(_thisLayerFunction, "_name", { value:elem.data.nm });
            Object.defineProperty(_thisLayerFunction, "content", {
                get: function(){
                    return _thisLayerFunction.shapeInterface;
                }
            });

            _thisLayerFunction.active = true;
            _thisLayerFunction.registerMaskInterface = _registerMaskInterface;
            _thisLayerFunction.registerEffectsInterface = _registerEffectsInterface;
            return _thisLayerFunction;
        }
    }());

    var CompExpressionInterface = (function (){
        return function(comp){
            function _thisLayerFunction(name){
                var i=0, len = comp.layers.length;
                while(i<len){
                    if(comp.layers[i].nm === name || comp.layers[i].ind === name - 1){
                        return comp.elements[i].layerInterface;
                    }
                    i += 1;
                }
            }
            _thisLayerFunction.layer = _thisLayerFunction;
            _thisLayerFunction.pixelAspect = 1;
            _thisLayerFunction.height = comp.globalData.compSize.h;
            _thisLayerFunction.width = comp.globalData.compSize.w;
            _thisLayerFunction.pixelAspect = 1;
            _thisLayerFunction.frameDuration = 1/comp.globalData.frameRate;
            return _thisLayerFunction;
        }
    }());
    var TransformExpressionInterface = (function (){
        return function(transform){
            function _thisFunction(name){
                switch(name){
                    case "scale":
                    case "Scale":
                    case "ADBE Scale":
                        return _thisFunction.scale;
                    case "rotation":
                    case "Rotation":
                    case "ADBE Rotation":
                        return _thisFunction.rotation;
                    case "position":
                    case "Position":
                    case "ADBE Position":
                        return transform.position;
                    case "anchorPoint":
                    case "AnchorPoint":
                    case "ADBE AnchorPoint":
                        return _thisFunction.anchorPoint;
                    case "opacity":
                    case "Opacity":
                        return _thisFunction.opacity;
                }
            }

            Object.defineProperty(_thisFunction, "rotation", {
                get: function(){
                    return transform.rotation;
                }
            });
            Object.defineProperty(_thisFunction, "scale", {
                get: function () {
                    var s = transform.scale;
                    var i, len = s.length;
                    var transformedS = Array.apply(null,{length:len});
                    for(i=0;i<len;i+=1){
                        transformedS[i] = s[i]*100;
                    }
                    return transformedS;
                }
            });

            Object.defineProperty(_thisFunction, "position", {
                get: function () {
                    return transform.position;
                }
            });

            Object.defineProperty(_thisFunction, "xPosition", {
                get: function () {
                    return transform.xPosition;
                }
            });

            Object.defineProperty(_thisFunction, "yPosition", {
                get: function () {
                    return transform.yPosition;
                }
            });

            Object.defineProperty(_thisFunction, "anchorPoint", {
                get: function () {
                    return transform.anchorPoint;
                }
            });

            Object.defineProperty(_thisFunction, "opacity", {
                get: function () {
                    return transform.opacity*100;
                }
            });

            Object.defineProperty(_thisFunction, "skew", {
                get: function () {
                    return transform.skew;
                }
            });

            Object.defineProperty(_thisFunction, "skewAxis", {
                get: function () {
                    return transform.skewAxis;
                }
            });

            return _thisFunction;
        }
    }());
    var ProjectInterface = (function (){

        function registerComposition(comp){
            this.compositions.push(comp);
        }

        return function(){
            function _thisProjectFunction(name){
                var i = 0, len = this.compositions.length;
                while(i<len){
                    if(this.compositions[i].data && this.compositions[i].data.nm === name){
                        this.compositions[i].prepareFrame(this.currentFrame);
                        return this.compositions[i].compInterface;
                    }
                    i+=1;
                }
                return this.compositions[0].compInterface;
            }

            _thisProjectFunction.compositions = [];
            _thisProjectFunction.currentFrame = 0;

            _thisProjectFunction.registerComposition = registerComposition;



            return _thisProjectFunction;
        }
    }());
    var EffectsExpressionInterface = (function (){
        var ob = {
            createEffectsInterface: createEffectsInterface
        };

        function createEffectsInterface(elem, propertyGroup){
            if(elem.effects){

                var effectElements = [];
                var effectsData = elem.data.ef;
                var i, len = elem.effects.effectElements.length;
                for(i=0;i<len;i+=1){
                    effectElements.push(createGroupInterface(effectsData[i],elem.effects.effectElements[i],propertyGroup,elem));
                }

                return function(name){
                    var effects = elem.data.ef, i = 0, len = effects.length;
                    while(i<len) {
                        if(name === effects[i].nm || name === effects[i].mn || name === effects[i].ix){
                            return effectElements[i];
                        }
                        i += 1;
                    }
                }
            }
        }

        function createGroupInterface(data,elements, propertyGroup, elem){
            var effectElements = [];
            var i, len = data.ef.length;
            for(i=0;i<len;i+=1){
                if(data.ef[i].ty === 5){
                    effectElements.push(createGroupInterface(data.ef[i],elements.effectElements[i],propertyGroup, elem));
                } else {
                    effectElements.push(createValueInterface(elements.effectElements[i],data.ef[i].ty, elem));
                }
            }
            var groupInterface = function(name){
                var effects = data.ef, i = 0, len = effects.length;
                // console.log('effects:',effects);
                while(i<len) {
                    if(name === effects[i].nm || name === effects[i].mn || name === effects[i].ix){
                        if(effects[i].ty === 5){
                            return effectElements[i];
                        } else {
                            return effectElements[i]();
                        }
                    }
                    i += 1;
                }
                return effectElements[0]();
            }
            groupInterface.active = data.en !== 0;
            return groupInterface
        }

        function createValueInterface(element, type, elem){
            return function(){
                if(type === 10){
                    return elem.comp.compInterface(element.p.v);
                }
                if(element.p.k){
                    element.p.getValue();
                }
                if(typeof element.p.v === 'number'){
                    return element.p.v;
                }
                var i, len = element.p.v.length;
                var arr = Array.apply(null,{length:len});
                for(i=0;i<len;i+=1){
                    arr[i] = element.p.v[i];
                }
                return arr;
            }
        }

        return ob;

    }());
    function SliderEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
    }
    function AngleEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
    }
    function ColorEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
    }
    function PointEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
    }
    function LayerIndexEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,0,0,dynamicProperties);
    }
    function CheckboxEffect(data,elem, dynamicProperties){
        this.p = PropertyFactory.getProp(elem,data.v,1,0,dynamicProperties);
    }
    function NoValueEffect(){
        this.p = {};
    }
    function EffectsManager(data,element,dynamicProperties){
        var effects = data.ef;
        this.effectElements = [];
        var i,len = effects.length;
        var effectItem;
        for(i=0;i<len;i++) {
            effectItem = new GroupEffect(effects[i],element,dynamicProperties);
            this.effectElements.push(effectItem);
        }
    }

    function GroupEffect(data,element,dynamicProperties){
        this.dynamicProperties = [];
        this.init(data,element,this.dynamicProperties);
        if(this.dynamicProperties.length){
            dynamicProperties.push(this);
        }
    }

    GroupEffect.prototype.getValue = function(){
        this.mdf = false;
        var i, len = this.dynamicProperties.length;
        for(i=0;i<len;i+=1){
            this.dynamicProperties[i].getValue();
            this.mdf = this.dynamicProperties[i].mdf ? true : this.mdf;
        }
    };

    GroupEffect.prototype.init = function(data,element,dynamicProperties){
        this.data = data;
        this.mdf = false;
        this.effectElements = [];
        var i, len = this.data.ef.length;
        var eff, effects = this.data.ef;
        for(i=0;i<len;i+=1){
            switch(effects[i].ty){
                case 0:
                    eff = new SliderEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 1:
                    eff = new AngleEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 2:
                    eff = new ColorEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 3:
                    eff = new PointEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 4:
                case 7:
                    eff = new CheckboxEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 10:
                    eff = new LayerIndexEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 5:
                    eff = new EffectsManager(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
                case 6:
                    eff = new NoValueEffect(effects[i],element,dynamicProperties);
                    this.effectElements.push(eff);
                    break;
            }
        }
    };var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === 'string'){ switch(value){ case 'high': defaultCurveSegments = 200; break; case 'medium': defaultCurveSegments = 50; break; case 'low': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } function installPlugin(type,plugin){ if(type==='expressions'){ expressionsPlugin = plugin; } } function getFactory(name){ switch(name){ case "propertyFactory": return PropertyFactory;case "shapePropertyFactory": return ShapePropertyFactory; case "matrix": return Matrix; } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.installPlugin = installPlugin; bodymovinjs.__getFactory = getFactory; bodymovinjs.version = '4.5.7'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split('&'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split('='); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = '__[STANDALONE]__'; var animationData = '__[ANIMATIONDATA]__'; var renderer = ''; if(standalone) { var scripts = document.getElementsByTagName('script'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\?]+\??/,''); renderer = getQueryVariable('renderer'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; }));
/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

/*!
 * Bootstrap v3.3.6 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 2)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.6
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.6
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.6'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.6'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.6
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.6'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.6
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.6'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.6
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.6'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.6'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.6
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.6'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.6
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.6'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.6
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.6'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.6'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.6
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.6'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/*!
	Colorbox 1.6.4
	license: MIT
	http://www.jacklmoore.com/colorbox
*/
(function ($, document, window) {
	var
	// Default settings object.
	// See http://jacklmoore.com/colorbox for details.
	defaults = {
		// data sources
		html: false,
		photo: false,
		iframe: false,
		inline: false,

		// behavior and appearance
		transition: "elastic",
		speed: 300,
		fadeOut: 300,
		width: false,
		initialWidth: "600",
		innerWidth: false,
		maxWidth: false,
		height: false,
		initialHeight: "450",
		innerHeight: false,
		maxHeight: false,
		scalePhotos: true,
		scrolling: true,
		opacity: 0.9,
		preloading: true,
		className: false,
		overlayClose: true,
		escKey: true,
		arrowKey: true,
		top: false,
		bottom: false,
		left: false,
		right: false,
		fixed: false,
		data: undefined,
		closeButton: true,
		fastIframe: true,
		open: false,
		reposition: true,
		loop: true,
		slideshow: false,
		slideshowAuto: true,
		slideshowSpeed: 2500,
		slideshowStart: "start slideshow",
		slideshowStop: "stop slideshow",
		photoRegex: /\.(gif|png|jp(e|g|eg)|bmp|ico|webp|jxr|svg)((#|\?).*)?$/i,

		// alternate image paths for high-res displays
		retinaImage: false,
		retinaUrl: false,
		retinaSuffix: '@2x.$1',

		// internationalization
		current: "image {current} of {total}",
		previous: "previous",
		next: "next",
		close: "close",
		xhrError: "This content failed to load.",
		imgError: "This image failed to load.",

		// accessbility
		returnFocus: true,
		trapFocus: true,

		// callbacks
		onOpen: false,
		onLoad: false,
		onComplete: false,
		onCleanup: false,
		onClosed: false,

		rel: function() {
			return this.rel;
		},
		href: function() {
			// using this.href would give the absolute url, when the href may have been inteded as a selector (e.g. '#container')
			return $(this).attr('href');
		},
		title: function() {
			return this.title;
		},
		createImg: function() {
			var img = new Image();
			var attrs = $(this).data('cbox-img-attrs');

			if (typeof attrs === 'object') {
				$.each(attrs, function(key, val){
					img[key] = val;
				});
			}

			return img;
		},
		createIframe: function() {
			var iframe = document.createElement('iframe');
			var attrs = $(this).data('cbox-iframe-attrs');

			if (typeof attrs === 'object') {
				$.each(attrs, function(key, val){
					iframe[key] = val;
				});
			}

			if ('frameBorder' in iframe) {
				iframe.frameBorder = 0;
			}
			if ('allowTransparency' in iframe) {
				iframe.allowTransparency = "true";
			}
			iframe.name = (new Date()).getTime(); // give the iframe a unique name to prevent caching
			iframe.allowFullscreen = true;

			return iframe;
		}
	},

	// Abstracting the HTML and event identifiers for easy rebranding
	colorbox = 'colorbox',
	prefix = 'cbox',
	boxElement = prefix + 'Element',

	// Events
	event_open = prefix + '_open',
	event_load = prefix + '_load',
	event_complete = prefix + '_complete',
	event_cleanup = prefix + '_cleanup',
	event_closed = prefix + '_closed',
	event_purge = prefix + '_purge',

	// Cached jQuery Object Variables
	$overlay,
	$box,
	$wrap,
	$content,
	$topBorder,
	$leftBorder,
	$rightBorder,
	$bottomBorder,
	$related,
	$window,
	$loaded,
	$loadingBay,
	$loadingOverlay,
	$title,
	$current,
	$slideshow,
	$next,
	$prev,
	$close,
	$groupControls,
	$events = $('<a/>'), // $({}) would be prefered, but there is an issue with jQuery 1.4.2

	// Variables for cached values or use across multiple functions
	settings,
	interfaceHeight,
	interfaceWidth,
	loadedHeight,
	loadedWidth,
	index,
	photo,
	open,
	active,
	closing,
	loadingTimer,
	publicMethod,
	div = "div",
	requests = 0,
	previousCSS = {},
	init;

	// ****************
	// HELPER FUNCTIONS
	// ****************

	// Convenience function for creating new jQuery objects
	function $tag(tag, id, css) {
		var element = document.createElement(tag);

		if (id) {
			element.id = prefix + id;
		}

		if (css) {
			element.style.cssText = css;
		}

		return $(element);
	}

	// Get the window height using innerHeight when available to avoid an issue with iOS
	// http://bugs.jquery.com/ticket/6724
	function winheight() {
		return window.innerHeight ? window.innerHeight : $(window).height();
	}

	function Settings(element, options) {
		if (options !== Object(options)) {
			options = {};
		}

		this.cache = {};
		this.el = element;

		this.value = function(key) {
			var dataAttr;

			if (this.cache[key] === undefined) {
				dataAttr = $(this.el).attr('data-cbox-'+key);

				if (dataAttr !== undefined) {
					this.cache[key] = dataAttr;
				} else if (options[key] !== undefined) {
					this.cache[key] = options[key];
				} else if (defaults[key] !== undefined) {
					this.cache[key] = defaults[key];
				}
			}

			return this.cache[key];
		};

		this.get = function(key) {
			var value = this.value(key);
			return $.isFunction(value) ? value.call(this.el, this) : value;
		};
	}

	// Determine the next and previous members in a group.
	function getIndex(increment) {
		var
		max = $related.length,
		newIndex = (index + increment) % max;

		return (newIndex < 0) ? max + newIndex : newIndex;
	}

	// Convert '%' and 'px' values to integers
	function setSize(size, dimension) {
		return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : winheight()) / 100) : 1) * parseInt(size, 10));
	}

	// Checks an href to see if it is a photo.
	// There is a force photo option (photo: true) for hrefs that cannot be matched by the regex.
	function isImage(settings, url) {
		return settings.get('photo') || settings.get('photoRegex').test(url);
	}

	function retinaUrl(settings, url) {
		return settings.get('retinaUrl') && window.devicePixelRatio > 1 ? url.replace(settings.get('photoRegex'), settings.get('retinaSuffix')) : url;
	}

	function trapFocus(e) {
		if ('contains' in $box[0] && !$box[0].contains(e.target) && e.target !== $overlay[0]) {
			e.stopPropagation();
			$box.focus();
		}
	}

	function setClass(str) {
		if (setClass.str !== str) {
			$box.add($overlay).removeClass(setClass.str).addClass(str);
			setClass.str = str;
		}
	}

	function getRelated(rel) {
		index = 0;

		if (rel && rel !== false && rel !== 'nofollow') {
			$related = $('.' + boxElement).filter(function () {
				var options = $.data(this, colorbox);
				var settings = new Settings(this, options);
				return (settings.get('rel') === rel);
			});
			index = $related.index(settings.el);

			// Check direct calls to Colorbox.
			if (index === -1) {
				$related = $related.add(settings.el);
				index = $related.length - 1;
			}
		} else {
			$related = $(settings.el);
		}
	}

	function trigger(event) {
		// for external use
		$(document).trigger(event);
		// for internal use
		$events.triggerHandler(event);
	}

	var slideshow = (function(){
		var active,
			className = prefix + "Slideshow_",
			click = "click." + prefix,
			timeOut;

		function clear () {
			clearTimeout(timeOut);
		}

		function set() {
			if (settings.get('loop') || $related[index + 1]) {
				clear();
				timeOut = setTimeout(publicMethod.next, settings.get('slideshowSpeed'));
			}
		}

		function start() {
			$slideshow
				.html(settings.get('slideshowStop'))
				.unbind(click)
				.one(click, stop);

			$events
				.bind(event_complete, set)
				.bind(event_load, clear);

			$box.removeClass(className + "off").addClass(className + "on");
		}

		function stop() {
			clear();

			$events
				.unbind(event_complete, set)
				.unbind(event_load, clear);

			$slideshow
				.html(settings.get('slideshowStart'))
				.unbind(click)
				.one(click, function () {
					publicMethod.next();
					start();
				});

			$box.removeClass(className + "on").addClass(className + "off");
		}

		function reset() {
			active = false;
			$slideshow.hide();
			clear();
			$events
				.unbind(event_complete, set)
				.unbind(event_load, clear);
			$box.removeClass(className + "off " + className + "on");
		}

		return function(){
			if (active) {
				if (!settings.get('slideshow')) {
					$events.unbind(event_cleanup, reset);
					reset();
				}
			} else {
				if (settings.get('slideshow') && $related[1]) {
					active = true;
					$events.one(event_cleanup, reset);
					if (settings.get('slideshowAuto')) {
						start();
					} else {
						stop();
					}
					$slideshow.show();
				}
			}
		};

	}());


	function launch(element) {
		var options;

		if (!closing) {

			options = $(element).data(colorbox);

			settings = new Settings(element, options);

			getRelated(settings.get('rel'));

			if (!open) {
				open = active = true; // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.

				setClass(settings.get('className'));

				// Show colorbox so the sizes can be calculated in older versions of jQuery
				$box.css({visibility:'hidden', display:'block', opacity:''});

				$loaded = $tag(div, 'LoadedContent', 'width:0; height:0; overflow:hidden; visibility:hidden');
				$content.css({width:'', height:''}).append($loaded);

				// Cache values needed for size calculations
				interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height();
				interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
				loadedHeight = $loaded.outerHeight(true);
				loadedWidth = $loaded.outerWidth(true);

				// Opens inital empty Colorbox prior to content being loaded.
				var initialWidth = setSize(settings.get('initialWidth'), 'x');
				var initialHeight = setSize(settings.get('initialHeight'), 'y');
				var maxWidth = settings.get('maxWidth');
				var maxHeight = settings.get('maxHeight');

				settings.w = Math.max((maxWidth !== false ? Math.min(initialWidth, setSize(maxWidth, 'x')) : initialWidth) - loadedWidth - interfaceWidth, 0);
				settings.h = Math.max((maxHeight !== false ? Math.min(initialHeight, setSize(maxHeight, 'y')) : initialHeight) - loadedHeight - interfaceHeight, 0);

				$loaded.css({width:'', height:settings.h});
				publicMethod.position();

				trigger(event_open);
				settings.get('onOpen');

				$groupControls.add($title).hide();

				$box.focus();

				if (settings.get('trapFocus')) {
					// Confine focus to the modal
					// Uses event capturing that is not supported in IE8-
					if (document.addEventListener) {

						document.addEventListener('focus', trapFocus, true);

						$events.one(event_closed, function () {
							document.removeEventListener('focus', trapFocus, true);
						});
					}
				}

				// Return focus on closing
				if (settings.get('returnFocus')) {
					$events.one(event_closed, function () {
						$(settings.el).focus();
					});
				}
			}

			var opacity = parseFloat(settings.get('opacity'));
			$overlay.css({
				opacity: opacity === opacity ? opacity : '',
				cursor: settings.get('overlayClose') ? 'pointer' : '',
				visibility: 'visible'
			}).show();

			if (settings.get('closeButton')) {
				$close.html(settings.get('close')).appendTo($content);
			} else {
				$close.appendTo('<div/>'); // replace with .detach() when dropping jQuery < 1.4
			}

			load();
		}
	}

	// Colorbox's markup needs to be added to the DOM prior to being called
	// so that the browser will go ahead and load the CSS background images.
	function appendHTML() {
		if (!$box) {
			init = false;
			$window = $(window);
			$box = $tag(div).attr({
				id: colorbox,
				'class': $.support.opacity === false ? prefix + 'IE' : '', // class for optional IE8 & lower targeted CSS.
				role: 'dialog',
				tabindex: '-1'
			}).hide();
			$overlay = $tag(div, "Overlay").hide();
			$loadingOverlay = $([$tag(div, "LoadingOverlay")[0],$tag(div, "LoadingGraphic")[0]]);
			$wrap = $tag(div, "Wrapper");
			$content = $tag(div, "Content").append(
				$title = $tag(div, "Title"),
				$current = $tag(div, "Current"),
				$prev = $('<button type="button"/>').attr({id:prefix+'Previous'}),
				$next = $('<button type="button"/>').attr({id:prefix+'Next'}),
				$slideshow = $('<button type="button"/>').attr({id:prefix+'Slideshow'}),
				$loadingOverlay
			);

			$close = $('<button type="button"/>').attr({id:prefix+'Close'});

			$wrap.append( // The 3x3 Grid that makes up Colorbox
				$tag(div).append(
					$tag(div, "TopLeft"),
					$topBorder = $tag(div, "TopCenter"),
					$tag(div, "TopRight")
				),
				$tag(div, false, 'clear:left').append(
					$leftBorder = $tag(div, "MiddleLeft"),
					$content,
					$rightBorder = $tag(div, "MiddleRight")
				),
				$tag(div, false, 'clear:left').append(
					$tag(div, "BottomLeft"),
					$bottomBorder = $tag(div, "BottomCenter"),
					$tag(div, "BottomRight")
				)
			).find('div div').css({'float': 'left'});

			$loadingBay = $tag(div, false, 'position:absolute; width:9999px; visibility:hidden; display:none; max-width:none;');

			$groupControls = $next.add($prev).add($current).add($slideshow);
		}
		if (document.body && !$box.parent().length) {
			$(document.body).append($overlay, $box.append($wrap, $loadingBay));
		}
	}

	// Add Colorbox's event bindings
	function addBindings() {
		function clickHandler(e) {
			// ignore non-left-mouse-clicks and clicks modified with ctrl / command, shift, or alt.
			// See: http://jacklmoore.com/notes/click-events/
			if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				launch(this);
			}
		}

		if ($box) {
			if (!init) {
				init = true;

				// Anonymous functions here keep the public method from being cached, thereby allowing them to be redefined on the fly.
				$next.click(function () {
					publicMethod.next();
				});
				$prev.click(function () {
					publicMethod.prev();
				});
				$close.click(function () {
					publicMethod.close();
				});
				$overlay.click(function () {
					if (settings.get('overlayClose')) {
						publicMethod.close();
					}
				});

				// Key Bindings
				$(document).bind('keydown.' + prefix, function (e) {
					var key = e.keyCode;
					if (open && settings.get('escKey') && key === 27) {
						e.preventDefault();
						publicMethod.close();
					}
					if (open && settings.get('arrowKey') && $related[1] && !e.altKey) {
						if (key === 37) {
							e.preventDefault();
							$prev.click();
						} else if (key === 39) {
							e.preventDefault();
							$next.click();
						}
					}
				});

				if ($.isFunction($.fn.on)) {
					// For jQuery 1.7+
					$(document).on('click.'+prefix, '.'+boxElement, clickHandler);
				} else {
					// For jQuery 1.3.x -> 1.6.x
					// This code is never reached in jQuery 1.9, so do not contact me about 'live' being removed.
					// This is not here for jQuery 1.9, it's here for legacy users.
					$('.'+boxElement).live('click.'+prefix, clickHandler);
				}
			}
			return true;
		}
		return false;
	}

	// Don't do anything if Colorbox already exists.
	if ($[colorbox]) {
		return;
	}

	// Append the HTML when the DOM loads
	$(appendHTML);


	// ****************
	// PUBLIC FUNCTIONS
	// Usage format: $.colorbox.close();
	// Usage from within an iframe: parent.jQuery.colorbox.close();
	// ****************

	publicMethod = $.fn[colorbox] = $[colorbox] = function (options, callback) {
		var settings;
		var $obj = this;

		options = options || {};

		if ($.isFunction($obj)) { // assume a call to $.colorbox
			$obj = $('<a/>');
			options.open = true;
		}

		if (!$obj[0]) { // colorbox being applied to empty collection
			return $obj;
		}

		appendHTML();

		if (addBindings()) {

			if (callback) {
				options.onComplete = callback;
			}

			$obj.each(function () {
				var old = $.data(this, colorbox) || {};
				$.data(this, colorbox, $.extend(old, options));
			}).addClass(boxElement);

			settings = new Settings($obj[0], options);

			if (settings.get('open')) {
				launch($obj[0]);
			}
		}

		return $obj;
	};

	publicMethod.position = function (speed, loadedCallback) {
		var
		css,
		top = 0,
		left = 0,
		offset = $box.offset(),
		scrollTop,
		scrollLeft;

		$window.unbind('resize.' + prefix);

		// remove the modal so that it doesn't influence the document width/height
		$box.css({top: -9e4, left: -9e4});

		scrollTop = $window.scrollTop();
		scrollLeft = $window.scrollLeft();

		if (settings.get('fixed')) {
			offset.top -= scrollTop;
			offset.left -= scrollLeft;
			$box.css({position: 'fixed'});
		} else {
			top = scrollTop;
			left = scrollLeft;
			$box.css({position: 'absolute'});
		}

		// keeps the top and left positions within the browser's viewport.
		if (settings.get('right') !== false) {
			left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.get('right'), 'x'), 0);
		} else if (settings.get('left') !== false) {
			left += setSize(settings.get('left'), 'x');
		} else {
			left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
		}

		if (settings.get('bottom') !== false) {
			top += Math.max(winheight() - settings.h - loadedHeight - interfaceHeight - setSize(settings.get('bottom'), 'y'), 0);
		} else if (settings.get('top') !== false) {
			top += setSize(settings.get('top'), 'y');
		} else {
			top += Math.round(Math.max(winheight() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
		}

		$box.css({top: offset.top, left: offset.left, visibility:'visible'});

		// this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
		// but it has to be shrank down around the size of div#colorbox when it's done.  If not,
		// it can invoke an obscure IE bug when using iframes.
		$wrap[0].style.width = $wrap[0].style.height = "9999px";

		function modalDimensions() {
			$topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = (parseInt($box[0].style.width,10) - interfaceWidth)+'px';
			$content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = (parseInt($box[0].style.height,10) - interfaceHeight)+'px';
		}

		css = {width: settings.w + loadedWidth + interfaceWidth, height: settings.h + loadedHeight + interfaceHeight, top: top, left: left};

		// setting the speed to 0 if the content hasn't changed size or position
		if (speed) {
			var tempSpeed = 0;
			$.each(css, function(i){
				if (css[i] !== previousCSS[i]) {
					tempSpeed = speed;
					return;
				}
			});
			speed = tempSpeed;
		}

		previousCSS = css;

		if (!speed) {
			$box.css(css);
		}

		$box.dequeue().animate(css, {
			duration: speed || 0,
			complete: function () {
				modalDimensions();

				active = false;

				// shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
				$wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
				$wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";

				if (settings.get('reposition')) {
					setTimeout(function () {  // small delay before binding onresize due to an IE8 bug.
						$window.bind('resize.' + prefix, publicMethod.position);
					}, 1);
				}

				if ($.isFunction(loadedCallback)) {
					loadedCallback();
				}
			},
			step: modalDimensions
		});
	};

	publicMethod.resize = function (options) {
		var scrolltop;

		if (open) {
			options = options || {};

			if (options.width) {
				settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
			}

			if (options.innerWidth) {
				settings.w = setSize(options.innerWidth, 'x');
			}

			$loaded.css({width: settings.w});

			if (options.height) {
				settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
			}

			if (options.innerHeight) {
				settings.h = setSize(options.innerHeight, 'y');
			}

			if (!options.innerHeight && !options.height) {
				scrolltop = $loaded.scrollTop();
				$loaded.css({height: "auto"});
				settings.h = $loaded.height();
			}

			$loaded.css({height: settings.h});

			if(scrolltop) {
				$loaded.scrollTop(scrolltop);
			}

			publicMethod.position(settings.get('transition') === "none" ? 0 : settings.get('speed'));
		}
	};

	publicMethod.prep = function (object) {
		if (!open) {
			return;
		}

		var callback, speed = settings.get('transition') === "none" ? 0 : settings.get('speed');

		$loaded.remove();

		$loaded = $tag(div, 'LoadedContent').append(object);

		function getWidth() {
			settings.w = settings.w || $loaded.width();
			settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
			return settings.w;
		}
		function getHeight() {
			settings.h = settings.h || $loaded.height();
			settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
			return settings.h;
		}

		$loaded.hide()
		.appendTo($loadingBay.show())// content has to be appended to the DOM for accurate size calculations.
		.css({width: getWidth(), overflow: settings.get('scrolling') ? 'auto' : 'hidden'})
		.css({height: getHeight()})// sets the height independently from the width in case the new width influences the value of height.
		.prependTo($content);

		$loadingBay.hide();

		// floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.

		$(photo).css({'float': 'none'});

		setClass(settings.get('className'));

		callback = function () {
			var total = $related.length,
				iframe,
				complete;

			if (!open) {
				return;
			}

			function removeFilter() { // Needed for IE8 in versions of jQuery prior to 1.7.2
				if ($.support.opacity === false) {
					$box[0].style.removeAttribute('filter');
				}
			}

			complete = function () {
				clearTimeout(loadingTimer);
				$loadingOverlay.hide();
				trigger(event_complete);
				settings.get('onComplete');
			};


			$title.html(settings.get('title')).show();
			$loaded.show();

			if (total > 1) { // handle grouping
				if (typeof settings.get('current') === "string") {
					$current.html(settings.get('current').replace('{current}', index + 1).replace('{total}', total)).show();
				}

				$next[(settings.get('loop') || index < total - 1) ? "show" : "hide"]().html(settings.get('next'));
				$prev[(settings.get('loop') || index) ? "show" : "hide"]().html(settings.get('previous'));

				slideshow();

				// Preloads images within a rel group
				if (settings.get('preloading')) {
					$.each([getIndex(-1), getIndex(1)], function(){
						var img,
							i = $related[this],
							settings = new Settings(i, $.data(i, colorbox)),
							src = settings.get('href');

						if (src && isImage(settings, src)) {
							src = retinaUrl(settings, src);
							img = document.createElement('img');
							img.src = src;
						}
					});
				}
			} else {
				$groupControls.hide();
			}

			if (settings.get('iframe')) {

				iframe = settings.get('createIframe');

				if (!settings.get('scrolling')) {
					iframe.scrolling = "no";
				}

				$(iframe)
					.attr({
						src: settings.get('href'),
						'class': prefix + 'Iframe'
					})
					.one('load', complete)
					.appendTo($loaded);

				$events.one(event_purge, function () {
					iframe.src = "//about:blank";
				});

				if (settings.get('fastIframe')) {
					$(iframe).trigger('load');
				}
			} else {
				complete();
			}

			if (settings.get('transition') === 'fade') {
				$box.fadeTo(speed, 1, removeFilter);
			} else {
				removeFilter();
			}
		};

		if (settings.get('transition') === 'fade') {
			$box.fadeTo(speed, 0, function () {
				publicMethod.position(0, callback);
			});
		} else {
			publicMethod.position(speed, callback);
		}
	};

	function load () {
		var href, setResize, prep = publicMethod.prep, $inline, request = ++requests;

		active = true;

		photo = false;

		trigger(event_purge);
		trigger(event_load);
		settings.get('onLoad');

		settings.h = settings.get('height') ?
				setSize(settings.get('height'), 'y') - loadedHeight - interfaceHeight :
				settings.get('innerHeight') && setSize(settings.get('innerHeight'), 'y');

		settings.w = settings.get('width') ?
				setSize(settings.get('width'), 'x') - loadedWidth - interfaceWidth :
				settings.get('innerWidth') && setSize(settings.get('innerWidth'), 'x');

		// Sets the minimum dimensions for use in image scaling
		settings.mw = settings.w;
		settings.mh = settings.h;

		// Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
		// If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
		if (settings.get('maxWidth')) {
			settings.mw = setSize(settings.get('maxWidth'), 'x') - loadedWidth - interfaceWidth;
			settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
		}
		if (settings.get('maxHeight')) {
			settings.mh = setSize(settings.get('maxHeight'), 'y') - loadedHeight - interfaceHeight;
			settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
		}

		href = settings.get('href');

		loadingTimer = setTimeout(function () {
			$loadingOverlay.show();
		}, 100);

		if (settings.get('inline')) {
			var $target = $(href).eq(0);
			// Inserts an empty placeholder where inline content is being pulled from.
			// An event is bound to put inline content back when Colorbox closes or loads new content.
			$inline = $('<div>').hide().insertBefore($target);

			$events.one(event_purge, function () {
				$inline.replaceWith($target);
			});

			prep($target);
		} else if (settings.get('iframe')) {
			// IFrame element won't be added to the DOM until it is ready to be displayed,
			// to avoid problems with DOM-ready JS that might be trying to run in that iframe.
			prep(" ");
		} else if (settings.get('html')) {
			prep(settings.get('html'));
		} else if (isImage(settings, href)) {

			href = retinaUrl(settings, href);

			photo = settings.get('createImg');

			$(photo)
			.addClass(prefix + 'Photo')
			.bind('error.'+prefix,function () {
				prep($tag(div, 'Error').html(settings.get('imgError')));
			})
			.one('load', function () {
				if (request !== requests) {
					return;
				}

				// A small pause because some browsers will occassionaly report a
				// img.width and img.height of zero immediately after the img.onload fires
				setTimeout(function(){
					var percent;

					if (settings.get('retinaImage') && window.devicePixelRatio > 1) {
						photo.height = photo.height / window.devicePixelRatio;
						photo.width = photo.width / window.devicePixelRatio;
					}

					if (settings.get('scalePhotos')) {
						setResize = function () {
							photo.height -= photo.height * percent;
							photo.width -= photo.width * percent;
						};
						if (settings.mw && photo.width > settings.mw) {
							percent = (photo.width - settings.mw) / photo.width;
							setResize();
						}
						if (settings.mh && photo.height > settings.mh) {
							percent = (photo.height - settings.mh) / photo.height;
							setResize();
						}
					}

					if (settings.h) {
						photo.style.marginTop = Math.max(settings.mh - photo.height, 0) / 2 + 'px';
					}

					if ($related[1] && (settings.get('loop') || $related[index + 1])) {
						photo.style.cursor = 'pointer';

						$(photo).bind('click.'+prefix, function () {
							publicMethod.next();
						});
					}

					photo.style.width = photo.width + 'px';
					photo.style.height = photo.height + 'px';
					prep(photo);
				}, 1);
			});

			photo.src = href;

		} else if (href) {
			$loadingBay.load(href, settings.get('data'), function (data, status) {
				if (request === requests) {
					prep(status === 'error' ? $tag(div, 'Error').html(settings.get('xhrError')) : $(this).contents());
				}
			});
		}
	}

	// Navigates to the next page/image in a set.
	publicMethod.next = function () {
		if (!active && $related[1] && (settings.get('loop') || $related[index + 1])) {
			index = getIndex(1);
			launch($related[index]);
		}
	};

	publicMethod.prev = function () {
		if (!active && $related[1] && (settings.get('loop') || index)) {
			index = getIndex(-1);
			launch($related[index]);
		}
	};

	// Note: to use this within an iframe use the following format: parent.jQuery.colorbox.close();
	publicMethod.close = function () {
		if (open && !closing) {

			closing = true;
			open = false;
			trigger(event_cleanup);
			settings.get('onCleanup');
			$window.unbind('.' + prefix);
			$overlay.fadeTo(settings.get('fadeOut') || 0, 0);

			$box.stop().fadeTo(settings.get('fadeOut') || 0, 0, function () {
				$box.hide();
				$overlay.hide();
				trigger(event_purge);
				$loaded.remove();

				setTimeout(function () {
					closing = false;
					trigger(event_closed);
					settings.get('onClosed');
				}, 1);
			});
		}
	};

	// Removes changes Colorbox made to the document, but does not remove the plugin.
	publicMethod.remove = function () {
		if (!$box) { return; }

		$box.stop();
		$[colorbox].close();
		$box.stop(false, true).remove();
		$overlay.remove();
		closing = false;
		$box = null;
		$('.' + boxElement)
			.removeData(colorbox)
			.removeClass(boxElement);

		$(document).unbind('click.'+prefix).unbind('keydown.'+prefix);
	};

	// A method for fetching the current element Colorbox is referencing.
	// returns a jQuery object.
	publicMethod.element = function () {
		return $(settings.el);
	};

	publicMethod.settings = defaults;

}(jQuery, document, window));

/*!
 * Justified Gallery - v3.6.0
 * http://miromannino.github.io/Justified-Gallery/
 * Copyright (c) 2015 Miro Mannino
 * Licensed under the MIT license.
 */
(function($) {

  /**
   * Justified Gallery controller constructor
   *
   * @param $gallery the gallery to build
   * @param settings the settings (the defaults are in $.fn.justifiedGallery.defaults)
   * @constructor
   */
  var JustifiedGallery = function ($gallery, settings) {

    this.settings = settings;
    this.checkSettings();

    this.imgAnalyzerTimeout = null;
    this.entries = null;
    this.buildingRow = {
      entriesBuff : [],
      width : 0,
      aspectRatio : 0
    };
    this.lastAnalyzedIndex = -1;
    this.yield = {
      every : 2, // do a flush every n flushes (must be greater than 1)
      flushed : 0 // flushed rows without a yield
    };
    this.border = settings.border >= 0 ? settings.border : settings.margins;
    this.maxRowHeight = this.retrieveMaxRowHeight();
    this.suffixRanges = this.retrieveSuffixRanges();
    this.offY = this.border;
    this.spinner = {
      phase : 0,
      timeSlot : 150,
      $el : $('<div class="spinner"><span></span><span></span><span></span></div>'),
      intervalId : null
    };
    this.checkWidthIntervalId = null;
    this.galleryWidth = $gallery.width();
    this.$gallery = $gallery;

  };

  /** @returns {String} the best suffix given the width and the height */
  JustifiedGallery.prototype.getSuffix = function (width, height) {
    var longestSide, i;
    longestSide = (width > height) ? width : height;
    for (i = 0; i < this.suffixRanges.length; i++) {
      if (longestSide <= this.suffixRanges[i]) {
        return this.settings.sizeRangeSuffixes[this.suffixRanges[i]];
      }
    }
    return this.settings.sizeRangeSuffixes[this.suffixRanges[i - 1]];
  };

  /**
   * Remove the suffix from the string
   *
   * @returns {string} a new string without the suffix
   */
  JustifiedGallery.prototype.removeSuffix = function (str, suffix) {
    return str.substring(0, str.length - suffix.length);
  };

  /**
   * @returns {boolean} a boolean to say if the suffix is contained in the str or not
   */
  JustifiedGallery.prototype.endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  /**
   * Get the used suffix of a particular url
   *
   * @param str
   * @returns {String} return the used suffix
   */
  JustifiedGallery.prototype.getUsedSuffix = function (str) {
    for (var si in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(si)) {
        if (this.settings.sizeRangeSuffixes[si].length === 0) continue;
        if (this.endsWith(str, this.settings.sizeRangeSuffixes[si])) return this.settings.sizeRangeSuffixes[si];
      }
    }
    return '';
  };

  /**
   * Given an image src, with the width and the height, returns the new image src with the
   * best suffix to show the best quality thumbnail.
   *
   * @returns {String} the suffix to use
   */
  JustifiedGallery.prototype.newSrc = function (imageSrc, imgWidth, imgHeight) {
    var matchRes = imageSrc.match(this.settings.extension);
    var ext = (matchRes != null) ? matchRes[0] : '';
    var newImageSrc = imageSrc.replace(this.settings.extension, '');
    newImageSrc = this.removeSuffix(newImageSrc, this.getUsedSuffix(newImageSrc));
    newImageSrc += this.getSuffix(imgWidth, imgHeight) + ext;
    return newImageSrc;
  };

  /**
   * Shows the images that is in the given entry
   *
   * @param $entry the entry
   * @param callback the callback that is called when the show animation is finished
   */
  JustifiedGallery.prototype.showImg = function ($entry, callback) {
    if (this.settings.cssAnimation) {
      $entry.addClass('entry-visible');
      if (callback) callback();
    } else {
      $entry.stop().fadeTo(this.settings.imagesAnimationDuration, 1.0, callback);
    }
  };

  /**
   * Extract the image src form the image, looking from the 'safe-src', and if it can't be found, from the
   * 'src' attribute. It saves in the image data the 'jg.originalSrc' field, with the extracted src.
   *
   * @param $image the image to analyze
   * @returns {String} the extracted src
   */
  JustifiedGallery.prototype.extractImgSrcFromImage = function ($image) {
    var imageSrc = (typeof $image.data('safe-src') !== 'undefined') ? $image.data('safe-src') : $image.attr('src');
    $image.data('jg.originalSrc', imageSrc);
    return imageSrc;
  };

  /** @returns {jQuery} the image in the given entry */
  JustifiedGallery.prototype.imgFromEntry = function ($entry) {
    var $img = $entry.find('> img');
    if ($img.length === 0) $img = $entry.find('> a > img');
    return $img.length === 0 ? null : $img;
  };

  /** @returns {jQuery} the caption in the given entry */
  JustifiedGallery.prototype.captionFromEntry = function ($entry) {
    var $caption = $entry.find('> .caption');
    return $caption.length === 0 ? null : $caption;
  };

  /**
   * Display the entry
   *
   * @param {jQuery} $entry the entry to display
   * @param {int} x the x position where the entry must be positioned
   * @param y the y position where the entry must be positioned
   * @param imgWidth the image width
   * @param imgHeight the image height
   * @param rowHeight the row height of the row that owns the entry
   */
  JustifiedGallery.prototype.displayEntry = function ($entry, x, y, imgWidth, imgHeight, rowHeight) {
    $entry.width(imgWidth);
    $entry.height(rowHeight);
    $entry.css('top', y);
    $entry.css('left', x);

    var $image = this.imgFromEntry($entry);
    if ($image !== null) {
      $image.css('width', imgWidth);
      $image.css('height', imgHeight);
      $image.css('margin-left', - imgWidth / 2);
      $image.css('margin-top', - imgHeight / 2);

      // Image reloading for an high quality of thumbnails
      var imageSrc = $image.attr('src');
      var newImageSrc = this.newSrc(imageSrc, imgWidth, imgHeight);

      $image.one('error', function () {
        $image.attr('src', $image.data('jg.originalSrc')); //revert to the original thumbnail, we got it.
      });

      var loadNewImage = function () {
        if (imageSrc !== newImageSrc) { //load the new image after the fadeIn
          $image.attr('src', newImageSrc);
        }
      };

      if ($entry.data('jg.loaded') === 'skipped') {
        this.onImageEvent(imageSrc, $.proxy(function() {
          this.showImg($entry, loadNewImage);
          $entry.data('jg.loaded', true);
        }, this));
      } else {
        this.showImg($entry, loadNewImage);
      }

    } else {
      this.showImg($entry);
    }

    this.displayEntryCaption($entry);
  };

  /**
   * Display the entry caption. If the caption element doesn't exists, it creates the caption using the 'alt'
   * or the 'title' attributes.
   *
   * @param {jQuery} $entry the entry to process
   */
  JustifiedGallery.prototype.displayEntryCaption = function ($entry) {
    var $image = this.imgFromEntry($entry);
    if ($image !== null && this.settings.captions) {
      var $imgCaption = this.captionFromEntry($entry);

      // Create it if it doesn't exists
      if ($imgCaption == null) {
        var caption = $image.attr('alt');
        if (typeof caption === 'undefined') caption = $entry.attr('title');
        if (typeof caption !== 'undefined') { // Create only we found something
          $imgCaption = $('<div class="caption">' + caption + '</div>');
          $entry.append($imgCaption);
          $entry.data('jg.createdCaption', true);
        }
      }

      // Create events (we check again the $imgCaption because it can be still inexistent)
      if ($imgCaption !== null) {
        if (!this.settings.cssAnimation) $imgCaption.stop().fadeTo(0, this.settings.captionSettings.nonVisibleOpacity);
        this.addCaptionEventsHandlers($entry);
      }
    } else {
      this.removeCaptionEventsHandlers($entry);
    }
  };

  /**
   * The callback for the event 'mouseenter'. It assumes that the event currentTarget is an entry.
   * It shows the caption using jQuery (or using CSS if it is configured so)
   *
   * @param {Event} eventObject the event object
   */
  JustifiedGallery.prototype.onEntryMouseEnterForCaption = function (eventObject) {
    var $caption = this.captionFromEntry($(eventObject.currentTarget));
    if (this.settings.cssAnimation) {
      $caption.addClass('caption-visible').removeClass('caption-hidden');
    } else {
      $caption.stop().fadeTo(this.settings.captionSettings.animationDuration,
          this.settings.captionSettings.visibleOpacity);
    }
  };

  /**
   * The callback for the event 'mouseleave'. It assumes that the event currentTarget is an entry.
   * It hides the caption using jQuery (or using CSS if it is configured so)
   *
   * @param {Event} eventObject the event object
   */
  JustifiedGallery.prototype.onEntryMouseLeaveForCaption = function (eventObject) {
    var $caption = this.captionFromEntry($(eventObject.currentTarget));
    if (this.settings.cssAnimation) {
      $caption.removeClass('caption-visible').removeClass('caption-hidden');
    } else {
      $caption.stop().fadeTo(this.settings.captionSettings.animationDuration,
          this.settings.captionSettings.nonVisibleOpacity);
    }
  };

  /**
   * Add the handlers of the entry for the caption
   *
   * @param $entry the entry to modify
   */
  JustifiedGallery.prototype.addCaptionEventsHandlers = function ($entry) {
    var captionMouseEvents = $entry.data('jg.captionMouseEvents');
    if (typeof captionMouseEvents === 'undefined') {
      captionMouseEvents = {
        mouseenter: $.proxy(this.onEntryMouseEnterForCaption, this),
        mouseleave: $.proxy(this.onEntryMouseLeaveForCaption, this)
      };
      $entry.on('mouseenter', undefined, undefined, captionMouseEvents.mouseenter);
      $entry.on('mouseleave', undefined, undefined, captionMouseEvents.mouseleave);
      $entry.data('jg.captionMouseEvents', captionMouseEvents);
    }
  };

  /**
   * Remove the handlers of the entry for the caption
   *
   * @param $entry the entry to modify
   */
  JustifiedGallery.prototype.removeCaptionEventsHandlers = function ($entry) {
    var captionMouseEvents = $entry.data('jg.captionMouseEvents');
    if (typeof captionMouseEvents !== 'undefined') {
      $entry.off('mouseenter', undefined, captionMouseEvents.mouseenter);
      $entry.off('mouseleave', undefined, captionMouseEvents.mouseleave);
      $entry.removeData('jg.captionMouseEvents');
    }
  };

  /**
   * Justify the building row, preparing it to
   *
   * @param isLastRow
   * @returns {*}
   */
  JustifiedGallery.prototype.prepareBuildingRow = function (isLastRow) {
    var i, $entry, imgAspectRatio, newImgW, newImgH, justify = true;
    var minHeight = 0;
    var availableWidth = this.galleryWidth - 2 * this.border - (
        (this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
    var rowHeight = availableWidth / this.buildingRow.aspectRatio;
    var justifiable = this.buildingRow.width / availableWidth > this.settings.justifyThreshold;

    //Skip the last row if we can't justify it and the lastRow == 'hide'
    if (isLastRow && this.settings.lastRow === 'hide' && !justifiable) {
      for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
        $entry = this.buildingRow.entriesBuff[i];
        if (this.settings.cssAnimation)
          $entry.removeClass('entry-visible');
        else
          $entry.stop().fadeTo(0, 0);
      }
      return -1;
    }

    // With lastRow = nojustify, justify if is justificable (the images will not become too big)
    if (isLastRow && !justifiable && this.settings.lastRow === 'nojustify') justify = false;

    for (i = 0; i < this.buildingRow.entriesBuff.length; i++) {
      $entry = this.buildingRow.entriesBuff[i];
      imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');

      if (justify) {
        newImgW = (i === this.buildingRow.entriesBuff.length - 1) ? availableWidth : rowHeight * imgAspectRatio;
        newImgH = rowHeight;

        /* With fixedHeight the newImgH must be greater than rowHeight.
         In some cases here this is not satisfied (due to the justification).
         But we comment it, because is better to have a shorter but justified row instead
         to have a cropped image at the end. */
        /*if (this.settings.fixedHeight && newImgH < this.settings.rowHeight) {
         newImgW = this.settings.rowHeight * imgAspectRatio;
         newImgH = this.settings.rowHeight;
         }*/

      } else {
        newImgW = this.settings.rowHeight * imgAspectRatio;
        newImgH = this.settings.rowHeight;
      }

      availableWidth -= Math.round(newImgW);
      $entry.data('jg.jwidth', Math.round(newImgW));
      $entry.data('jg.jheight', Math.ceil(newImgH));
      if (i === 0 || minHeight > newImgH) minHeight = newImgH;
    }

    if (this.settings.fixedHeight && minHeight > this.settings.rowHeight)
      minHeight = this.settings.rowHeight;

    return {minHeight: minHeight, justify: justify};
  };

  /**
   * Clear the building row data to be used for a new row
   */
  JustifiedGallery.prototype.clearBuildingRow = function () {
    this.buildingRow.entriesBuff = [];
    this.buildingRow.aspectRatio = 0;
    this.buildingRow.width = 0;
  };

  /**
   * Flush a row: justify it, modify the gallery height accordingly to the row height
   *
   * @param isLastRow
   */
  JustifiedGallery.prototype.flushRow = function (isLastRow) {
    var settings = this.settings;
    var $entry, minHeight, buildingRowRes, offX = this.border;

    buildingRowRes = this.prepareBuildingRow(isLastRow);
    minHeight = buildingRowRes.minHeight;
    if (isLastRow && settings.lastRow === 'hide' && minHeight === -1) {
      this.clearBuildingRow();
      return;
    }

    if (this.maxRowHeight.percentage) {
      if (this.maxRowHeight.value * settings.rowHeight < minHeight) minHeight = this.maxRowHeight.value * settings.rowHeight;
    } else {
      if (this.maxRowHeight.value > 0 && this.maxRowHeight.value < minHeight) minHeight = this.maxRowHeight.value;
    }

    for (var i = 0; i < this.buildingRow.entriesBuff.length; i++) {
      $entry = this.buildingRow.entriesBuff[i];
      this.displayEntry($entry, offX, this.offY, $entry.data('jg.jwidth'), $entry.data('jg.jheight'), minHeight);
      offX += $entry.data('jg.jwidth') + settings.margins;
    }

    //Gallery Height
    this.$gallery.height(this.offY + minHeight + this.border + (this.isSpinnerActive() ? this.getSpinnerHeight() : 0));

    if (!isLastRow || (minHeight <= this.settings.rowHeight && buildingRowRes.justify)) {
      //Ready for a new row
      this.offY += minHeight + this.settings.margins;
      this.clearBuildingRow();
      this.$gallery.trigger('jg.rowflush');
    }
  };

  /**
   * Checks the width of the gallery container, to know if a new justification is needed
   */
  JustifiedGallery.prototype.checkWidth = function () {
    this.checkWidthIntervalId = setInterval($.proxy(function () {
      var galleryWidth = parseInt(this.$gallery.width(), 10);
      if (this.galleryWidth !== galleryWidth) {
        this.galleryWidth = galleryWidth;
        this.rewind();

        // Restart to analyze
        this.startImgAnalyzer(true);
      }
    }, this), this.settings.refreshTime);
  };

  /**
   * @returns {boolean} a boolean saying if the spinner is active or not
   */
  JustifiedGallery.prototype.isSpinnerActive = function () {
    return this.spinner.intervalId != null;
  };

  /**
   * @returns {int} the spinner height
   */
  JustifiedGallery.prototype.getSpinnerHeight = function () {
    return this.spinner.$el.innerHeight();
  };

  /**
   * Stops the spinner animation and modify the gallery height to exclude the spinner
   */
  JustifiedGallery.prototype.stopLoadingSpinnerAnimation = function () {
    clearInterval(this.spinner.intervalId);
    this.spinner.intervalId = null;
    this.$gallery.height(this.$gallery.height() - this.getSpinnerHeight());
    this.spinner.$el.detach();
  };

  /**
   * Starts the spinner animation
   */
  JustifiedGallery.prototype.startLoadingSpinnerAnimation = function () {
    var spinnerContext = this.spinner;
    var $spinnerPoints = spinnerContext.$el.find('span');
    clearInterval(spinnerContext.intervalId);
    this.$gallery.append(spinnerContext.$el);
    this.$gallery.height(this.offY + this.getSpinnerHeight());
    spinnerContext.intervalId = setInterval(function () {
      if (spinnerContext.phase < $spinnerPoints.length) {
        $spinnerPoints.eq(spinnerContext.phase).fadeTo(spinnerContext.timeSlot, 1);
      } else {
        $spinnerPoints.eq(spinnerContext.phase - $spinnerPoints.length).fadeTo(spinnerContext.timeSlot, 0);
      }
      spinnerContext.phase = (spinnerContext.phase + 1) % ($spinnerPoints.length * 2);
    }, spinnerContext.timeSlot);
  };

  /**
   * Rewind the image analysis to start from the first entry.
   */
  JustifiedGallery.prototype.rewind = function () {
    this.lastAnalyzedIndex = -1;
    this.offY = this.border;
    this.clearBuildingRow();
  };

  /**
   * Hide the image of the buildingRow to prevent strange effects when the row will be
   * re-justified again
   */
  JustifiedGallery.prototype.hideBuildingRowImages = function () {
    for (var i = 0; i < this.buildingRow.entriesBuff.length; i++) {
      if (this.settings.cssAnimation) {
        this.buildingRow.entriesBuff[i].removeClass('entry-visible');
      } else {
        this.buildingRow.entriesBuff[i].stop().fadeTo(0, 0);
      }
    }
  };

  /**
   * Update the entries searching it from the justified gallery HTML element
   *
   * @param norewind if norewind only the new entries will be changed (i.e. randomized, sorted or filtered)
   * @returns {boolean} true if some entries has been founded
   */
  JustifiedGallery.prototype.updateEntries = function (norewind) {
    this.entries = this.$gallery.find(this.settings.selector).toArray();
    if (this.entries.length === 0) return false;

    // Filter
    if (this.settings.filter) {
      this.modifyEntries(this.filterArray, norewind);
    } else {
      this.modifyEntries(this.resetFilters, norewind);
    }

    // Sort or randomize
    if ($.isFunction(this.settings.sort)) {
      this.modifyEntries(this.sortArray, norewind);
    } else if (this.settings.randomize) {
      this.modifyEntries(this.shuffleArray, norewind);
    }

    return true;
  };

  /**
   * Apply the entries order to the DOM, iterating the entries and appending the images
   *
   * @param entries the entries that has been modified and that must be re-ordered in the DOM
   */
  JustifiedGallery.prototype.insertToGallery = function (entries) {
    var that = this;
    $.each(entries, function () {
      $(this).appendTo(that.$gallery);
    });
  };

  /**
   * Shuffle the array using the Fisher-Yates shuffle algorithm
   *
   * @param a the array to shuffle
   * @return the shuffled array
   */
  JustifiedGallery.prototype.shuffleArray = function (a) {
    var i, j, temp;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    this.insertToGallery(a);
    return a;
  };

  /**
   * Sort the array using settings.comparator as comparator
   *
   * @param a the array to sort (it is sorted)
   * @return the sorted array
   */
  JustifiedGallery.prototype.sortArray = function (a) {
    a.sort(this.settings.sort);
    this.insertToGallery(a);
    return a;
  };

  /**
   * Reset the filters removing the 'jg-filtered' class from all the entries
   *
   * @param a the array to reset
   */
  JustifiedGallery.prototype.resetFilters = function (a) {
    for (var i = 0; i < a.length; i++) $(a[i]).removeClass('jg-filtered');
    return a;
  };

  /**
   * Filter the entries considering theirs classes (if a string has been passed) or using a function for filtering.
   *
   * @param a the array to filter
   * @return the filtered array
   */
  JustifiedGallery.prototype.filterArray = function (a) {
    var settings = this.settings;
    if ($.type(settings.filter) === 'string') {
      // Filter only keeping the entries passed in the string
      return a.filter(function (el) {
        var $el = $(el);
        if ($el.is(settings.filter)) {
          $el.removeClass('jg-filtered');
          return true;
        } else {
          $el.addClass('jg-filtered');
          return false;
        }
      });
    } else if ($.isFunction(settings.filter)) {
      // Filter using the passed function
      return a.filter(settings.filter);
    }
  };

  /**
   * Modify the entries. With norewind only the new inserted images will be modified (the ones after lastAnalyzedIndex)
   *
   * @param functionToApply the function to call to modify the entries (e.g. sorting, randomization, filtering)
   * @param norewind specify if the norewind has been called or not
   */
  JustifiedGallery.prototype.modifyEntries = function (functionToApply, norewind) {
    var lastEntries = norewind ?
        this.entries.splice(this.lastAnalyzedIndex + 1, this.entries.length - this.lastAnalyzedIndex - 1)
        : this.entries;
    lastEntries = functionToApply.call(this, lastEntries);
    this.entries = norewind ? this.entries.concat(lastEntries) : lastEntries;
  };

  /**
   * Destroy the Justified Gallery instance.
   *
   * It clears all the css properties added in the style attributes. We doesn't backup the original
   * values for those css attributes, because it costs (performance) and because in general one
   * shouldn't use the style attribute for an uniform set of images (where we suppose the use of
   * classes). Creating a backup is also difficult because JG could be called multiple times and
   * with different style attributes.
   */
  JustifiedGallery.prototype.destroy = function () {
    clearInterval(this.checkWidthIntervalId);

    $.each(this.entries, $.proxy(function(_, entry) {
      var $entry = $(entry);

      // Reset entry style
      $entry.css('width', '');
      $entry.css('height', '');
      $entry.css('top', '');
      $entry.css('left', '');
      $entry.data('jg.loaded', undefined);
      $entry.removeClass('jg-entry');

      // Reset image style
      var $img = this.imgFromEntry($entry);
      $img.css('width', '');
      $img.css('height', '');
      $img.css('margin-left', '');
      $img.css('margin-top', '');
      $img.attr('src', $img.data('jg.originalSrc'));
      $img.data('jg.originalSrc', undefined);

      // Remove caption
      this.removeCaptionEventsHandlers($entry);
      var $caption = this.captionFromEntry($entry);
      if ($entry.data('jg.createdCaption')) {
        // remove also the caption element (if created by jg)
        $entry.data('jg.createdCaption', undefined);
        if ($caption != null) $caption.remove();
      } else {
        if ($caption != null) $caption.fadeTo(0, 1);
      }

    }, this));

    this.$gallery.css('height', '');
    this.$gallery.removeClass('justified-gallery');
    this.$gallery.data('jg.controller', undefined);
  };

  /**
   * Analyze the images and builds the rows. It returns if it found an image that is not loaded.
   *
   * @param isForResize if the image analyzer is called for resizing or not, to call a different callback at the end
   */
  JustifiedGallery.prototype.analyzeImages = function (isForResize) {
    for (var i = this.lastAnalyzedIndex + 1; i < this.entries.length; i++) {
      var $entry = $(this.entries[i]);
      if ($entry.data('jg.loaded') === true || $entry.data('jg.loaded') === 'skipped') {
        var availableWidth = this.galleryWidth - 2 * this.border - (
            (this.buildingRow.entriesBuff.length - 1) * this.settings.margins);
        var imgAspectRatio = $entry.data('jg.width') / $entry.data('jg.height');
        if (availableWidth / (this.buildingRow.aspectRatio + imgAspectRatio) < this.settings.rowHeight) {
          this.flushRow(false);
          if(++this.yield.flushed >= this.yield.every) {
            this.startImgAnalyzer(isForResize);
            return;
          }
        }

        this.buildingRow.entriesBuff.push($entry);
        this.buildingRow.aspectRatio += imgAspectRatio;
        this.buildingRow.width += imgAspectRatio * this.settings.rowHeight;
        this.lastAnalyzedIndex = i;

      } else if ($entry.data('jg.loaded') !== 'error') {
        return;
      }
    }

    // Last row flush (the row is not full)
    if (this.buildingRow.entriesBuff.length > 0) this.flushRow(true);

    if (this.isSpinnerActive()) {
      this.stopLoadingSpinnerAnimation();
    }

    /* Stop, if there is, the timeout to start the analyzeImages.
     This is because an image can be set loaded, and the timeout can be set,
     but this image can be analyzed yet.
     */
    this.stopImgAnalyzerStarter();

    //On complete callback
    this.$gallery.trigger(isForResize ? 'jg.resize' : 'jg.complete');
  };

  /**
   * Stops any ImgAnalyzer starter (that has an assigned timeout)
   */
  JustifiedGallery.prototype.stopImgAnalyzerStarter = function () {
    this.yield.flushed = 0;
    if (this.imgAnalyzerTimeout !== null) clearTimeout(this.imgAnalyzerTimeout);
  };

  /**
   * Starts the image analyzer. It is not immediately called to let the browser to update the view
   *
   * @param isForResize specifies if the image analyzer must be called for resizing or not
   */
  JustifiedGallery.prototype.startImgAnalyzer = function (isForResize) {
    var that = this;
    this.stopImgAnalyzerStarter();
    this.imgAnalyzerTimeout = setTimeout(function () {
      that.analyzeImages(isForResize);
    }, 0.001); // we can't start it immediately due to a IE different behaviour
  };

  /**
   * Checks if the image is loaded or not using another image object. We cannot use the 'complete' image property,
   * because some browsers, with a 404 set complete = true.
   *
   * @param imageSrc the image src to load
   * @param onLoad callback that is called when the image has been loaded
   * @param onError callback that is called in case of an error
   */
  JustifiedGallery.prototype.onImageEvent = function (imageSrc, onLoad, onError) {
    if (!onLoad && !onError) return;

    var memImage = new Image();
    var $memImage = $(memImage);
    if (onLoad) {
      $memImage.one('load', function () {
        $memImage.off('load error');
        onLoad(memImage);
      });
    }
    if (onError) {
      $memImage.one('error', function() {
        $memImage.off('load error');
        onError(memImage);
      });
    }
    memImage.src = imageSrc;
  };

  /**
   * Init of Justified Gallery controlled
   * It analyzes all the entries starting theirs loading and calling the image analyzer (that works with loaded images)
   */
  JustifiedGallery.prototype.init = function () {
    var imagesToLoad = false, skippedImages = false, that = this;
    $.each(this.entries, function (index, entry) {
      var $entry = $(entry);
      var $image = that.imgFromEntry($entry);

      $entry.addClass('jg-entry');

      if ($entry.data('jg.loaded') !== true && $entry.data('jg.loaded') !== 'skipped') {

        // Link Rel global overwrite
        if (that.settings.rel !== null) $entry.attr('rel', that.settings.rel);

        // Link Target global overwrite
        if (that.settings.target !== null) $entry.attr('target', that.settings.target);

        if ($image !== null) {

          // Image src
          var imageSrc = that.extractImgSrcFromImage($image);
          $image.attr('src', imageSrc);

          /* If we have the height and the width, we don't wait that the image is loaded, but we start directly
           * with the justification */
          if (that.settings.waitThumbnailsLoad === false) {
            var width = parseInt($image.attr('width'), 10);
            var height = parseInt($image.attr('height'), 10);
            if (!isNaN(width) && !isNaN(height)) {
              $entry.data('jg.width', width);
              $entry.data('jg.height', height);
              $entry.data('jg.loaded', 'skipped');
              skippedImages = true;
              that.startImgAnalyzer(false);
              return true; // continue
            }
          }

          $entry.data('jg.loaded', false);
          imagesToLoad = true;

          // Spinner start
          if (!that.isSpinnerActive()) {
            that.startLoadingSpinnerAnimation();
          }

          that.onImageEvent(imageSrc, function (loadImg) { // image loaded
            $entry.data('jg.width', loadImg.width);
            $entry.data('jg.height', loadImg.height);
            $entry.data('jg.loaded', true);
            that.startImgAnalyzer(false);
          }, function () { // image load error
            $entry.data('jg.loaded', 'error');
            that.startImgAnalyzer(false);
          });

        } else {
          $entry.data('jg.loaded', true);
          $entry.data('jg.width', $entry.width() | $entry.css('width') | 1);
          $entry.data('jg.height', $entry.height() | $entry.css('height') | 1);
        }

      }

    });

    if (!imagesToLoad && !skippedImages) this.startImgAnalyzer(false);
    this.checkWidth();
  };

  /**
   * Checks that it is a valid number. If a string is passed it is converted to a number
   *
   * @param settingContainer the object that contains the setting (to allow the conversion)
   * @param settingName the setting name
   */
  JustifiedGallery.prototype.checkOrConvertNumber = function (settingContainer, settingName) {
    if ($.type(settingContainer[settingName]) === 'string') {
      settingContainer[settingName] = parseFloat(settingContainer[settingName]);
    }

    if ($.type(settingContainer[settingName]) === 'number') {
      if (isNaN(settingContainer[settingName])) throw 'invalid number for ' + settingName;
    } else {
      throw settingName + ' must be a number';
    }
  };

  /**
   * Checks the sizeRangeSuffixes and, if necessary, converts
   * its keys from string (e.g. old settings with 'lt100') to int.
   */
  JustifiedGallery.prototype.checkSizeRangesSuffixes = function () {
    if ($.type(this.settings.sizeRangeSuffixes) !== 'object') {
      throw 'sizeRangeSuffixes must be defined and must be an object';
    }

    var suffixRanges = [];
    for (var rangeIdx in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(rangeIdx);
    }

    var newSizeRngSuffixes = {0: ''};
    for (var i = 0; i < suffixRanges.length; i++) {
      if ($.type(suffixRanges[i]) === 'string') {
        try {
          var numIdx = parseInt(suffixRanges[i].replace(/^[a-z]+/, ''), 10);
          newSizeRngSuffixes[numIdx] = this.settings.sizeRangeSuffixes[suffixRanges[i]];
        } catch (e) {
          throw 'sizeRangeSuffixes keys must contains correct numbers (' + e + ')';
        }
      } else {
        newSizeRngSuffixes[suffixRanges[i]] = this.settings.sizeRangeSuffixes[suffixRanges[i]];
      }
    }

    this.settings.sizeRangeSuffixes = newSizeRngSuffixes;
  };

  /**
   * check and convert the maxRowHeight setting
   */
  JustifiedGallery.prototype.retrieveMaxRowHeight = function () {
    var newMaxRowHeight = { };

    if ($.type(this.settings.maxRowHeight) === 'string') {
      if (this.settings.maxRowHeight.match(/^[0-9]+%$/)) {
        newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight.match(/^([0-9])+%$/)[1]) / 100;
        newMaxRowHeight.percentage = false;
      } else {
        newMaxRowHeight.value = parseFloat(this.settings.maxRowHeight);
        newMaxRowHeight.percentage = true;
      }
    } else if ($.type(this.settings.maxRowHeight) === 'number') {
      newMaxRowHeight.value = this.settings.maxRowHeight;
      newMaxRowHeight.percentage = false;
    } else {
      throw 'maxRowHeight must be a number or a percentage';
    }

    // check if the converted value is not a number
    if (isNaN(newMaxRowHeight.value)) throw 'invalid number for maxRowHeight';

    // check values
    if (newMaxRowHeight.percentage) {
      if (newMaxRowHeight.value < 100) newMaxRowHeight.value = 100;
    } else {
      if (newMaxRowHeight.value > 0 && newMaxRowHeight.value < this.settings.rowHeight) {
        newMaxRowHeight.value = this.settings.rowHeight;
      }
    }

    return newMaxRowHeight;

  };

  /**
   * Checks the settings
   */
  JustifiedGallery.prototype.checkSettings = function () {
    this.checkSizeRangesSuffixes();

    this.checkOrConvertNumber(this.settings, 'rowHeight');
    this.checkOrConvertNumber(this.settings, 'margins');
    this.checkOrConvertNumber(this.settings, 'border');

    if (this.settings.lastRow !== 'nojustify' &&
        this.settings.lastRow !== 'justify' &&
        this.settings.lastRow !== 'hide') {
      throw 'lastRow must be "nojustify", "justify" or "hide"';
    }

    this.checkOrConvertNumber(this.settings, 'justifyThreshold');
    if (this.settings.justifyThreshold < 0 || this.settings.justifyThreshold > 1) {
      throw 'justifyThreshold must be in the interval [0,1]';
    }
    if ($.type(this.settings.cssAnimation) !== 'boolean') {
      throw 'cssAnimation must be a boolean';
    }

    if ($.type(this.settings.captions) !== 'boolean') throw 'captions must be a boolean';
    this.checkOrConvertNumber(this.settings.captionSettings, 'animationDuration');

    this.checkOrConvertNumber(this.settings.captionSettings, 'visibleOpacity');
    if (this.settings.captionSettings.visibleOpacity < 0 ||
        this.settings.captionSettings.visibleOpacity > 1) {
      throw 'captionSettings.visibleOpacity must be in the interval [0, 1]';
    }

    this.checkOrConvertNumber(this.settings.captionSettings, 'nonVisibleOpacity');
    if (this.settings.captionSettings.nonVisibleOpacity < 0 ||
        this.settings.captionSettings.nonVisibleOpacity > 1) {
      throw 'captionSettings.nonVisibleOpacity must be in the interval [0, 1]';
    }

    if ($.type(this.settings.fixedHeight) !== 'boolean') throw 'fixedHeight must be a boolean';
    this.checkOrConvertNumber(this.settings, 'imagesAnimationDuration');
    this.checkOrConvertNumber(this.settings, 'refreshTime');
    if ($.type(this.settings.randomize) !== 'boolean') throw 'randomize must be a boolean';
    if ($.type(this.settings.selector) !== 'string') throw 'selector must be a string';

    if (this.settings.sort !== false && !$.isFunction(this.settings.sort)) {
      throw 'sort must be false or a comparison function';
    }

    if (this.settings.filter !== false && !$.isFunction(this.settings.sort) &&
        $.type(this.settings.filter) !== 'string') {
      throw 'filter must be false, a string or a filter function';
    }
  };

  /**
   * It brings all the indexes from the sizeRangeSuffixes and it orders them. They are then sorted and returned.
   * @returns {Array} sorted suffix ranges
   */
  JustifiedGallery.prototype.retrieveSuffixRanges = function () {
    var suffixRanges = [];
    for (var rangeIdx in this.settings.sizeRangeSuffixes) {
      if (this.settings.sizeRangeSuffixes.hasOwnProperty(rangeIdx)) suffixRanges.push(parseInt(rangeIdx, 10));
    }
    suffixRanges.sort(function (a, b) { return a > b ? 1 : a < b ? -1 : 0; });
    return suffixRanges;
  };

  /**
   * Update the existing settings only changing some of them
   *
   * @param newSettings the new settings (or a subgroup of them)
   */
  JustifiedGallery.prototype.updateSettings = function (newSettings) {
    // In this case Justified Gallery has been called again changing only some options
    this.settings = $.extend({}, this.settings, newSettings);
    this.checkSettings();

    // As reported in the settings: negative value = same as margins, 0 = disabled
    this.border = this.settings.border >= 0 ? this.settings.border : this.settings.margins;

    this.maxRowHeight = this.retrieveMaxRowHeight();
    this.suffixRanges = this.retrieveSuffixRanges();
  };

  /**
   * Justified Gallery plugin for jQuery
   *
   * Events
   *  - jg.complete : called when all the gallery has been created
   *  - jg.resize : called when the gallery has been resized
   *  - jg.rowflush : when a new row appears
   *
   * @param arg the action (or the settings) passed when the plugin is called
   * @returns {*} the object itself
   */
  $.fn.justifiedGallery = function (arg) {
    return this.each(function (index, gallery) {

      var $gallery = $(gallery);
      $gallery.addClass('justified-gallery');

      var controller = $gallery.data('jg.controller');
      if (typeof controller === 'undefined') {
        // Create controller and assign it to the object data
        if (typeof arg !== 'undefined' && arg !== null && $.type(arg) !== 'object') {
          throw 'The argument must be an object';
        }
        controller = new JustifiedGallery($gallery, $.extend({}, $.fn.justifiedGallery.defaults, arg));
        $gallery.data('jg.controller', controller);
      } else if (arg === 'norewind') {
        // In this case we don't rewind: we analyze only the latest images (e.g. to complete the last unfinished row
        controller.hideBuildingRowImages();
      } else if (arg === 'destroy') {
        controller.destroy();
        return;
      } else {
        // In this case Justified Gallery has been called again changing only some options
        controller.updateSettings(arg);
        controller.rewind();
      }

      // Update the entries list
      if (!controller.updateEntries(arg === 'norewind')) return;

      // Init justified gallery
      controller.init();

    });
  };

  // Default options
  $.fn.justifiedGallery.defaults = {
    sizeRangeSuffixes: { }, /* e.g. Flickr configuration
        {
          100: '_t',  // used when longest is less than 100px
          240: '_m',  // used when longest is between 101px and 240px
          320: '_n',  // ...
          500: '',
          640: '_z',
          1024: '_b'  // used as else case because it is the last
        }
    */
    rowHeight: 120,
    maxRowHeight: '200%', // negative value = no limits, number to express the value in pixels,
                          // '[0-9]+%' to express in percentage (e.g. 200% means that the row height
                          // can't exceed 2 * rowHeight)
    margins: 1,
    border: -1, // negative value = same as margins, 0 = disabled, any other value to set the border

    lastRow: 'nojustify', // or can be 'justify' or 'hide'
    justifyThreshold: 0.75, /* if row width / available space > 0.75 it will be always justified
                             * (i.e. lastRow setting is not considered) */
    fixedHeight: false,
    waitThumbnailsLoad: true,
    captions: true,
    cssAnimation: false,
    imagesAnimationDuration: 500, // ignored with css animations
    captionSettings: { // ignored with css animations
      animationDuration: 500,
      visibleOpacity: 0.7,
      nonVisibleOpacity: 0.0
    },
    rel: null, // rewrite the rel of each analyzed links
    target: null, // rewrite the target of all links
    extension: /\.[^.\\/]+$/, // regexp to capture the extension of an image
    refreshTime: 100, // time interval (in ms) to check if the page changes its width
    randomize: false,
    sort: false, /*
      - false: to do not sort
      - function: to sort them using the function as comparator (see Array.prototype.sort())
    */
    filter: false, /*
      - false: for a disabled filter
      - a string: an entry is kept if entry.is(filter string) returns true
                  see jQuery's .is() function for further information
      - a function: invoked with arguments (entry, index, array). Return true to keep the entry, false otherwise.
                    see Array.prototype.filter for further information.
    */
    selector: '> a, > div:not(.spinner)' // The selector that is used to know what are the entries of the gallery
  };

}(jQuery));

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
        var vidFrame = $(elem);
        var vidWidth = vidFrame.width();
        // If we switch the border width down to zero, which we do for mobile, we no longer need the adjustment
        var borderWidth = vidFrame.css("border-left-width");
        var adjustment = 20;
        if (borderWidth == "0px") {
            adjustment = 0;
        }
        vidHeight = (Math.round(vidWidth * 0.5625, 0) + adjustment);
        vidFrame.css('height', vidHeight);
    });
};

/**
 * Check the height of the About panels and ensure they match up correctly
 *
 * @param event
 */
var calcAboutTextPanelHeight = function (event) {
    var rowContainer = null;
    var leftContainer = null;
    var rightContainer = null;
    // On resize we recalculate the height of the About text panel to make sure is at least as big as the image one
    if ((rowContainer = $("#about-row-container"))
        && (leftContainer = $("#about-left-container"))
        && (rightContainer = $("#about-right-container"))) {
        leftContainer.css('min-height', rowContainer.height());
        // Must adjust the right hand panel to force it to fill the entire outer panel
        rightContainer.css('min-height', rowContainer.height() + 10);
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

var mail2 = function(name, dom1, dom2, tld, link) {
    document.location=('mailto:' + name + '@' + dom1 + dom2 + '.' + tld);
}
