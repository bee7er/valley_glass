@extends('layouts.app')
@section('title') Expressions :: @parent @endsection
@section('content')

    <address>N.B. Not all these scripts are my own they are taken from around the web, many being from expressions godfather himself Dan Ebberts. So if you choose to re-post them please reference the original author.</address>
    <a id="top"></a>
    <p><b>Contents</b></p>
    <p id="linksParagraph">
        <!-- This paragraph is built dynamically -->
    </p>

    <a id="0001"></a>
    <div id="block_0001" class="info-block closed" style="display:none;">
        <p><b>01 General - Small and Quick Expression Reference</b></p>
        <p>Expanded Time controlled animation expression</p>
    <pre>

    // Spin (rotate at a constant speed without keyframes)

    veloc = 360; //rotational velocity (degrees per second)

    r = rotation + (time - inPoint) *veloc;

    [r]

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Loop Expression Variations</p>
        <p>&nbsp;</p>
    <pre>

    loopIn()

    loopOut()

    loopOut("cycle",0)

    loopOut("ping-pong")

    </pre><a href="#top">Top</a>

    </div>

    <a id="0002"></a>
    <div id="block_0002" class="info-block closed" style="display:none;">
        <p><b> 02 Wiggle Expression Variations </b></p>
        <p>&nbsp;</p>
        <p>There are many ways of doing the wiggles to get different effects. You can add the Wiggle effect to everything position, scale, effects, etc.</p>
        <p>Basic wiggle, time followed by amount.</p>
    <pre>

    wiggle(1,50)

    </pre><a href="#top">Top</a>

        <p>Wiggle only on one axis. In this case property value 0, where the possible values are 0 and 1, represented as [X,Y].</p>

    <pre>

    org=value;

    temp=wiggle (5,50);

    [temp[0],org[1]];

    </pre><a href="#top">Top</a>

        <p>Shorthand version of the above.</p>

    <pre>

    [wiggle(5,50)[0],position[1]]

    </pre><a href="#top">Top</a>

        <p>Jumpy Wiggle 1 makes wiggle skip and hold rather than move fluidly.</p>

    <pre>

    // Jumpy Wiggle 1 (moves at a random FPS)

    v=wiggle(5,50);

    if(v &lt; 50)v=0;

    if(v &gt; 50)v=100;

    v

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Jumpy Wiggle 2 is similar to 1, but works at a defined FPS so your &#8220;jump&#8221; will happen at a regular pace.</p>
    <pre>

    // Jumpy Wiggle 2 (moves at a defined FPS)

    fps=5; //frequency

    amount=50; //amplitude

    wiggle(fps,amount,octaves = 1, amp_mult = 0.5,(Math.round(time*fps))/fps);

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Clamped Wiggle. Basically it stops your wiggle going through the floor.</p>
    <pre>

    w1 = wiggle(3,1000) - value;

    w2 = clamp(w1,[-40,-40],[40,0])

    value + w2

    </pre><a href="#top">Top</a>
        <p>Adjustable Position Wiggle. Allows you to keyframe your property with the addition of wiggle, in the case using the postion property.</p>
    <pre>

    wigfreq = 3; //wiggle frequency
    wigamt = 30; //wiggle amount
    wigdetail = 3; //detail of noise
    position.wiggle(wigfreq, wigamt, wigdetail)

    </pre><a href="#top">Top</a>
        <a href="#top">Top</a>
    </div>

    <a id="0003"></a>
    <div id="block_0003" class="info-block closed" style="display:none;">
        <p><b>03 Gravity Expression &#8211; Triggered by a layer marker</b></p>
        <p>&nbsp;</p>
        <p>Make a layer fall with gravity, toggled on and off by layer markers. Apply to position property.</p>
        <p>&nbsp;</p>
    <pre>

    g = 1000; // gravitational constant

    if (marker.numKeys &gt; 0 &amp;&amp; time &gt; marker.key(1).time){

    t = time - marker.key(1).time;

    y = g*t*t/2;

    value + [0,y]

    }else{

    value

    }

    </pre><a href="#top">Top</a>
    </div>

    <a id="0004"></a>
    <div id="block_0004" class="info-block closed" style="display:none;">
        <p><b>04 Scale Spring</b></p>
        <p>&nbsp;</p>
        <p>This is similar to the inertial bounce but no need for keyframes. Triggers immediately.</p>
        <p>&nbsp;</p>
<pre>

k=200; // final scale

a=5; // how quickly the bounce ends

b=20; // how many bounces it'll do (that is, the bounce speed)

x=k*(1-Math.exp(-a*time)*Math.cos(b*time));

[x,x]

</pre><a href="#top">Top</a>
    </div>

    <a id="0005"></a>
    <div id="block_0005" class="info-block closed" style="display:none;">
        <p><b>05 Opacity Flashing &#8211; Triggered by markers</b></p>
        <p>&nbsp;</p>
        <p>Sine wave driven flashing toggled on and off by layer markers.</p>
        <p>&nbsp;</p>
    <pre>

    n = 0;

    if (marker.numKeys &gt; 0){

    n = marker.nearestKey(time).index;

    if (marker.key(n).time &gt; time) n--;

    }

    &nbsp;

    if (n %2){

    f = 3; // frequency

    a = 100; // amount

    (Math.cos(time * f * 2 * Math.PI) + 1) * (a / 2);

    }else{

    value

    }

    </pre><a href="#top">Top</a>
    </div>

    <a id="0006"></a>
    <div id="block_0006" class="info-block closed" style="display:none;">
        <p><b>06 Inertial Bounce</b></p>
        <p>&nbsp;</p>
        <p>You can apply this to pretty much anything! Just add two key frames or more</p>
        <p>&nbsp;</p>
    <pre>

    amp = .1;

    freq = 2.0;

    decay = 2.0;

    &nbsp;

    n = 0;

    if (numKeys &gt; 0){

    n = nearestKey(time).index;

    if (key(n).time &gt; time){

    n--;

    }}

    &nbsp;

    if (n == 0){ t = 0;

    }else{

    t = time - key(n).time;

    }

    &nbsp;

    if (n &gt; 0){

    v = velocityAtTime(key(n).time - thisComp.frameDuration/10);

    value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);

    }else{value}

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Inertial bounce variation for text animator. Place in &#8220;expression selector&#8221; and animate amount %</p>
        <p>&nbsp;</p>
    <pre>

    delay = .1;

    tDelay = delay*textIndex;

    n = 0;

    if (numKeys &gt; 0){

    n = nearestKey(time-tDelay).index;

    if (key(n).time &gt; time) n--;

    }

    if (n == 0){

    t = 0;

    }else{

    t = time - key(n).time - tDelay;

    }

    &nbsp;

    if (n &gt; 0){

    v = velocityAtTime(key(n).time - thisComp.frameDuration/10);

    amp = .05;

    freq = 4.0;

    decay = 2.0;

    valueAtTime(time-tDelay) + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t);

    }else{

    value;

    }

    </pre><a href="#top">Top</a>
    </div>

    <a id="0007"></a>
    <div id="block_0007" class="info-block closed" style="display:none;">
        <p><b>07 Randomly Select and Hold a Keyframe</b></p>
        <p>&nbsp;</p>
        <p>Add this to the Time Remapping property.</p>
        <p>&nbsp;</p>
    <pre>

    segDur = .5;// duration of each "segment" of random time

    minVal = inPoint;

    maxVal = outPoint - segDur;

    &nbsp;

    seed = Math.floor(time/segDur);

    seedRandom(seed,true);

    random(minVal,maxVal);

    </pre><a href="#top">Top</a>
    </div>

    <a id="0008"></a>
    <div id="block_0008" class="info-block closed" style="display:none;">
        <p><b>08 Rolling Wheel</b></p>
        <p>&nbsp;</p>
        <p>Sticks the rotation of a layer to the ground like a working wheel. This works on the outer edge of the layer size. So the wheel size has the same dimensions as the layer, width and height. This also includes the scale, so the layer must be at 100% scale for the calculation to work.</p>
        <p>Add to rotation property then add position keyframes.</p>
    <pre>

    distance=position[0];
    circumference=width*Math.PI;
    distance/circumference*360;

    </pre><a href="#top">Top</a>
    </div>

    <a id="0009"></a>
    <div id="block_0009" class="info-block closed" style="display:none;">
        <p><b>09 Averaging</b></p>
        <p>Works out average distance between the layers and moves the target accordingly.</p>
    <pre>

    (thisComp.layer(1).position + thisComp.layer(2).position + thisComp.layer(3).position)/3

    </pre><a href="#top">Top</a>
    </div>

    <a id="0010"></a>
    <div id="block_0010" class="info-block closed" style="display:none;">
        <p><b>10 Jitter on the Y Axis</b></p>
        <p>&nbsp;</p>
        <p>You can change the probability of the jitter along with the position it moves</p>
        <p>&nbsp;</p>
    <pre>

    // Y Axis Jitter

    probability = 3 ;    //higher is less likely

    pos = 100;

    &nbsp;

    val    = random(-probability-2, 1);

    m = clamp(val, 0, 1);

    y = wiggle(10, pos*m)-position;

    value + [0, y[1]]

    </pre><a href="#top">Top</a>
    </div>

    <a id="0011"></a>
    <div id="block_0011" class="info-block closed" style="display:none;">
        <p><b>11 Linked Animation Time Offset</b></p>
        <p>&nbsp;</p>
        <p>Links animatable properties, but time offsets the animation in seconds.</p>
        <p>&nbsp;</p>
    <pre>

    thisComp.layer("layer3").transform.position.valueAtTime(time -3 )

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>This variation uses the layer index numbers to link the property to the layer below.</p>
        <p>&nbsp;</p>
    <pre>

    thisComp.layer(thisLayer, +1 ).transform.position.valueAtTime(time -0.5 )

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Another variation with index numbers and delay based on frame number.</p>
        <p>&nbsp;</p>
    <pre>

    thisComp.layer("layer_name").transform.rotation

    delay = 30; //number of frames to delay

    &nbsp;

    d = delay*thisComp.frameDuration*(index - 1);

    thisComp.layer("layer_name").transform.rotation.valueAtTime(time - d)

    </pre><a href="#top">Top</a>
    </div>

    <a id="0012"></a>
    <div id="block_0012" class="info-block closed" style="display:none;">
        <p><b>12 Wobble &#8211; Triggered by layer markers</b></p>
        <p>&nbsp;</p>
        <p>Wobble expression toggled on and off at layer markers.</p>
        <p>&nbsp;</p>
    <pre>

    n = 0;

    t = 0;

    if (marker.numKeys &gt; 0){

    n = marker.nearestKey(time).index;

    if (marker.key(n).time &gt; time) n--;

    }

    if (n &gt; 0) t = time - marker.key(n).time;

    amp = 15;

    freq = 5;

    decay = 3.0;

    angle = freq * 2 * Math.PI * t;

    scaleFact = (100 + amp * Math.sin(angle) / Math.exp(decay * t)) / 100;

    [value[0] * scaleFact, value[1] / scaleFact];

    </pre><a href="#top">Top</a>
    </div>

    <a id="0013"></a>
    <div id="block_0013" class="info-block closed" style="display:none;">
        <p><b>13 Speed Value</b></p>
        <p>&nbsp;</p>
        <p>This function calculates the speed of a layer, I think it&#8217;s the same as velocity. Not tested.</p>
        <p>&nbsp;</p>
    <pre>

    position.speed

    </pre><a href="#top">Top</a>
    </div>

    <a id="0014"></a>
    <div id="block_0014" class="info-block closed" style="display:none;">
        <p><b>14 Bouncing Ball Expression</b></p>
        <p>&nbsp;</p>
        <p>Add to position property</p>
        <p>&nbsp;</p>
    <pre>

    Vy0 = 500; //initial y velocity (pixels/second)

    Vx0 = 100; // initial x velocity (pixels/second)

    g = 2500; // gravity (pixels/second/second)

    floor = 1000;

    e = .85; //elasticity

    b = floor - position[1];

    h = b + Vy0*Vy0/(2*g);

    T = Vy0/g + Math.sqrt(2*h/g);

    if (time &lt; T){

    y = Vy0*time - g*time*time/2 + b;

    }else{

    Vy = -(Vy0 - g*T);

    while (true){

    Vy *= e;

    t = T;

    T += 2*Vy/g;

    if (time &lt; T){

    t = time - t;

    y = Vy*t - g*t*t/2;

    break;

    }else if (T - t &lt; thisComp.frameDuration){

    y = 0;

    break;

    }

    }

    }

    [position[0] + Vx0*time, floor - y]

    </pre><a href="#top">Top</a>
    </div>

    <a id="0015"></a>
    <div id="block_0015" class="info-block closed" style="display:none;">
        <p><b>15 Angle Based sin wave animation</b></p>
        <p>&nbsp;</p>
        <p>Sin wave based animation, the multiplier adjusts the angle in degrees.</p>
        <p>&nbsp;</p>
    <pre>

    80*Math.sin(time*3)

    </pre><a href="#top">Top</a>
    </div>

    <a id="0016"></a>
    <div id="block_0016" class="info-block closed" style="display:none;">
        <p><b>16 Avoid Me</b></p>
        <p>&nbsp;</p>
        <p>Create some shape layers and animate one of them moving through the others. Add the expression and they will move as if being pushed by the target layer.</p>
        <p>&nbsp;</p>
        <p>1) name the target layer &#8216;Avoid Me&#8217;</p>
        <p>2) Adjusting with the max and min displacement</p>
        <p>&nbsp;</p>
        <p>Apply the below to the still shapes (not the animated one)</p>
        <p>&nbsp;</p>
    <pre>

    avoidPos = thisComp.layer("Avoid Me").position;

    maxDisplacement = 200; //maximum amount to move the layer

    minDistance = 100; //minimum distance to begin displacing at

    //--

    finalPos = position.valueAtTime(0);

    oldDirectionVec = normalize([1,1]);

    for( i = 0 ; i &lt;= time; i+= thisComp.frameDuration ){

    try{

    vec = finalPos - avoidPos.valueAtTime( i );

    directionVec = normalize( vec );

    oldDirectionVec = directionVec;

    distance = length( vec );

    displaceAmt = ease( distance , 0 , minDistance , maxDisplacement , 0 );

    displacementVec = displaceAmt * directionVec;

    finalPos += displacementVec

    } catch ( exception ){

    finalPos += oldDirectionVec * displaceAmt;

    }

    }

    finalPos

    </pre><a href="#top">Top</a>
    </div>

    <a id="0017"></a>
    <div id="block_0017" class="info-block closed" style="display:none;">
        <p><b>17 Follow the Leader &#8211; with elasticity from linked layers</b></p>
        <p>&nbsp;</p>
        <p>This will take the velocity of a layer and link layers to it via an elastic type movement creating a dynamic chain.</p>
        <p>&nbsp;</p>
    <pre>

    rapidity=3; //following speed

    inertia=0.15; //how dull the following will be (0-1)

    leader=thisComp.layer("leader")

    &nbsp;

    pos1=leader.position;

    pos2=leader.position;

    v=0; i=0;

    while (i&lt;=time)

    {

    pos1=leader.position.valueAtTime(i);

    delta=sub(pos1,pos2);

    a=delta*rapidity*thisComp.frameDuration;

    v=(v+a)*(1-inertia);

    pos2 += v;

    i += thisComp.frameDuration;

    }

    pos2

    </pre><a href="#top">Top</a>
    </div>

    <a id="0018"></a>
    <div id="block_0018" class="info-block closed" style="display:none;">
        <p><b>18 Child Tracking</b></p>
        <p>Get absolute position and rotation from a layer that is parented.</p>
        <p>Position:</p>
    <pre>

    c=thisComp.layer("<b>target_layer</b>");

    p = c.toWorld(thisComp.layer("<b>target_layer</b>").transform.anchorPoint);

    &nbsp;

    [p[0],p[1],p[2]]

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Rotation:</p>
    <pre>

    C = thisComp.layer("<b>target_layer</b>");

    u = C.toWorldVec([1,0,0]);

    v = C.toWorldVec([0,1,0]);

    w = C.toWorldVec([0,0,1]);

    &nbsp;

    sinb = clamp(w[0],-1,1);

    b = Math.asin(sinb);

    cosb = Math.cos(b);

    if (Math.abs(cosb) &gt; .0005){

    c = -Math.atan2(v[0],u[0]);

    a = -Math.atan2(w[1],w[2]);

    }else{

    a = Math.atan2(u[1],v[1]);

    c = 0;

    }

    [radiansToDegrees(a),radiansToDegrees(b),radiansToDegrees(c)]

    </pre><a href="#top">Top</a>
    </div>

    <a id="0019"></a>
    <div id="block_0019" class="info-block closed" style="display:none;">
        <p><b>19 3D Lines made with solids</b></p>
        <p>&nbsp;</p>
        <p>Using beam is a great way to create lines between points but it&#8217;s difficult if you need it to create perspective in 3D. (use this for simple stuff, but use Plexus if you have lots of points to join together.</p>
        <p>&nbsp;</p>
        <p>- Make a solid 4&#215;100 pixels</p>
        <p>- Make two 3D nulls called &#8216;v1&#8242; and &#8216;v2&#8242;</p>
        <p>- Apply two &#8216;Layer&#8217; expression controls called &#8216;vec1&#8242; &#8216;vec2&#8242; to the solid called &#8216;vec1&#8242; and &#8216;vec2&#8242;</p>
        <p>- Set the &#8216;vec1&#8242; layer to &#8216;v1&#8242; and the &#8216;vec2&#8242; to &#8216;v2&#8242;</p>
        <p>- Apply the following expressions to the relevant properties of the solid:</p>
        <p>&nbsp;</p>
        <p>Position:</p>
        <p>&nbsp;</p>
    <pre>

    effect("vec1")("Layer").transform.position

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Scale:</p>
        <p>&nbsp;</p>
    <pre>

    v1 = effect("vec1")("Layer");

    v2 = effect("vec2")("Layer");

    y = length(v1.transform.position, v2.transform.position);

    &nbsp;

    [value[0], y, value[2]]

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Orientation:</p>
        <p>&nbsp;</p>
    <pre>

    v1 = effect("vec1")("Layer");

    v2 = effect("vec2")("Layer");

    &nbsp;

    lookAt(v1.transform.position, v2.transform.position)

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>NB. You may have to rotate one of the axis by 90 degrees for the end to point the correct direction (probably X rot).</p>
    </div>

    <a id="0020"></a>
    <div id="block_0020" class="info-block closed" style="display:none;">
        <p><b>20 2D position of a 3D layer</b></p>
        <p>Converts the position of a 3D layer to a &#8220;comp view&#8221; 2D position.</p>
        <p>&nbsp;</p>
        <p>A good use for this is to make Shine work in 3D like a controllable volumetric light.</p>
        <p>- In a 3D scene with a camera link a 3D null to a 3D solid</p>
        <p>- Apply shine to the solid using a 2D adjustment layer</p>
        <p>- Apply this expression to the Source Point property of the shine effect</p>
        <p>- Replace &#8220;your3Dlayername&#8221; with the name of your null</p>
        <p>- It will make the 3d position of your null the source of the shine effect, giving you a 3D volumetric light.</p>
        <p>&nbsp;</p>
    <pre>

    this_comp.layer("your3Dlayername").to_comp([0,0])

    </pre><a href="#top">Top</a>
    </div>

    <a id="0021"></a>
    <div id="block_0021" class="info-block closed" style="display:none;">
        <p><b>21 Range Mapping</b></p>
        <p>Converts one range of values into another chosen range. E.g. -5462 to 23 can become 0% to 100%.</p>
        <p>&nbsp;</p>
    <pre>

    input = effect("Slider Control")("Slider");

    inputLow = 0;

    inputHigh = 100;

    outputLow = -100;

    outputHigh = 100;

    &nbsp;

    linear(input,inputLow,inputHigh,outputLow,outputHigh)

    &nbsp;

    </pre><a href="#top">Top</a>
    </div>

    <a id="0022"></a>
    <div id="block_0022" class="info-block closed" style="display:none;">
        <p><b>22 BG Renderer using terminal or MSDOS Prompt</b></p>
        <p>Renders your after effects project in your favourite command line application (terminal, msDOS?) without needing to purchase the the popular script.</p>
        <p>Below is an osx terminal example. Adobe&#8217;s explanation and examples can be found here:</p>
        <p><a href="http://help.adobe.com/en_US/aftereffects/cs/using/WS3878526689cb91655866c1103a4f2dff7-79a3a.html">http://help.adobe.com/en_US/aftereffects/cs/using/WS3878526689cb91655866c1103a4f2dff7-79a3a.html</a></p>
        <p>&nbsp;</p>
        <p>cd /Applications/Adobe\ After\ Effects\ CS5</p>
        <p>&nbsp;</p>
        <p>./aerender -continueOnMissingFootage -project /YOUR_PROJECT_LOCATION/your_project.aep</p>
    </div>

    <a id="0023"></a>
    <div id="block_0023" class="info-block closed" style="display:none;">
        <p><b>23 Motion Blur with directional blur using velocity and atan2</b></p>
        <p>&nbsp;</p>
        <p>Put this on the blur length (increases blur amount as velocity increases)</p>
        <p>&nbsp;</p>
    <pre>

    other = thisComp.layer("square");

    s1 = other.position.velocityAtTime( time )[0];

    s2 = other.position.velocityAtTime( time )[1];

    Math.sqrt(s1*s1+s2*s2)/20

    </pre><a href="#top">Top</a>
        <p>&nbsp;</p>
        <p>Put this on blur angle (calculates angle based on velocity but the maths are a bit shit at the end, not quite right but works anyway)</p>
        <p>&nbsp;</p>
    <pre>

    other = thisComp.layer("square");

    s1 = other.position.velocityAtTime( time )[0];

    s2 = other.position.velocityAtTime( time )[1];

    angle = Math.atan2(s2,s1);

    radians_to_degrees(angle)-90

    </pre><a href="#top">Top</a>
    </div>

    <a id="0024"></a>
    <div id="block_0024" class="info-block closed" style="display:none;">
        <p><b>24 Point Colour Sampling</b></p>
        <p>Continuously sample a colour from a layer using a point expression control.</p>
        <p>Put a point control effect on your destination layer and put this code in your destination colour property:</p>
    <pre>

    thisComp.layer("sampled_layer").sampleImage(thisComp.layer("sampled_layer").effect("Point Control")("Point"));

    </pre><a href="#top">Top</a>
        <p>Using the sampleImage function works as follows:</p>
    <pre>

    sampleImage(pointposition, radius = [.5, .5], postEffect=true, t=time)

    </pre><a href="#top">Top</a>
        <p>Where &#8220;point&#8221; is where the data is coming from (a position array), &#8220;radius&#8221; is the size of the pixel sample, &#8220;postEffect&#8221; allows you to define if the colour sampling occurs AFTER all masks and effects, and I&#8217;m assuming &#8220;time&#8221; would allow you to specify a time offset. The example above has ignored the last two parameters, they are optional properties.</p>
    </div>

    <a id="0025"></a>
    <div id="block_0025" class="info-block closed" style="display:none;">
        <p><b>25 Convert camera FOV (degrees) to after effects zoom (pixels)</b></p>
        <p>If you want to control the &#8216;zoom&#8217; property of an after effects camera which is natively in pixels, linked to an angle in degrees.</p>
        <p>Put this on the zoom property. N.B. &#8220;math.PI/180&#8243; converts your degrees value into radians, as this is what javascript uses internally for angles.</p>
        <p>&nbsp;</p>
    <pre>

    a = *PICKWHIP YOUR ANGLE CONTROL HERE*/2;

    &nbsp;

    960/Math.tan(a*(Math.PI/180))

    </pre><a href="#top">Top</a>
    </div>

    <a id="0026"></a>
    <div id="block_0026" class="info-block closed" style="display:none;">
        <p><b>26 Only do something when layer is visible in the comp</b></p>
        <p>Used for example on particular light emitters, so it doesn&#8217;t continue emitting off screen</p>
        <p>&nbsp;</p>
    <pre>

    //only when visible in comp

    posX = thisLayer.to_comp([0,0])[0];

    posY = thisLayer.to_comp([0,0])[1];

    compW = thisComp.width;

    compH = thisComp.height;

    &nbsp;

    if (posX &gt; 0 &amp;&amp; posX &lt; compW &amp;&amp; posY &gt; 0 &amp;&amp; posY &lt; compH){

    [100]

    }else{

    [0]

    }

    </pre><a href="#top">Top</a>
    </div>

    <a id="0027"></a>
    <div id="block_0027" class="info-block closed" style="display:none;">
        <p><b>27 2D Look At rotation</b></p>
        <p>Makes the rotation of one layer point at another layer. The start of an IK chain, or to make a line between 2 points that keeps it&#8217;s length.</p>
        <p>&nbsp;</p>
    <pre>

    pointA = thisLayer;

    pointB = thisComp.layer("Null 2");

    &nbsp;

    a = pointA.position[0] - pointB.position[0];

    b = pointA.position[1] - pointB.position[1];

    &nbsp;

    switcher = 0;

    &nbsp;

    if (b &lt; 0) {switcher = -180};

    if (b == 0) {degree = 90} else {degree = -radiansToDegrees(Math.atan(a/b))}

    &nbsp;

    degree + value + switcher

    </pre><a href="#top">Top</a>
    </div>

    <a id="0028"></a>
    <div id="block_0028" class="info-block closed" style="display:none;">
        <p><b>28 Speed Control LoopOut</b></p>
        <p>Loops the animation on a property and also allows you to animate a slider that controls the speed of the loop.</p>
        <p>&nbsp;</p>
        <p>Add a slider controller to the layer and add this script to the desired property.</p>
        <p>&nbsp;</p>
    <pre>

    spd = effect("Slider Control")("Slider");

    n = spd.numKeys;

    &nbsp;

    if (n &gt; 0 &amp;&amp; spd.key(1).time &lt; time){

    &nbsp;

    accum = spd.key(1).value*(spd.key(1).time - inPoint);

    &nbsp;

    for (i = 2; i &lt;= n; i++){

    &nbsp;

    if (spd.key(i).time &gt; time) break;

    &nbsp;

    k1 = spd.key(i-1);

    &nbsp;

    k2 = spd.key(i);

    &nbsp;

    accum += (k1.value + k2.value)*(k2.time - k1.time)/2;

    &nbsp;

    }

    &nbsp;

    accum += (spd.value + spd.key(i-1).value)*(time - spd.key(i-1).time)/2;

    &nbsp;

    }else{

    &nbsp;

    accum = spd.value*(time - inPoint);

    &nbsp;

    }

    &nbsp;

    if (numKeys &gt; 1){

    &nbsp;

    d = key(numKeys).time - key(1).time;

    &nbsp;

    t = (accum - key(1).time)%d;

    &nbsp;

    valueAtTime (key(1).time + t);

    &nbsp;

    }else

    &nbsp;

    value

    </pre><a href="#top">Top</a>
    </div>

    <a id="0029"></a>
    <div id="block_0029" class="info-block closed" style="display:none;">
        <p><b>29 Delete every nth frame of footage</b></p>
        <p>Add this to the time remap property and change the &#8217;5&#8242; to the nth frame you want to be removed.</p>
        <p>NB. The first frame is incorrectly deleted, you may have to shift the footage by 1 frame for it to remove the frames desired.</p>
        <p>&nbsp;</p>
    <pre>

    f = timeToFrames();

    n = Math.floor(f/5);

    framesToTime(n+f);

    </pre><a href="#top">Top</a>
    </div>

    <a id="0030"></a>
    <div id="block_0030" class="info-block closed" style="display:none;">
        <p><b>30 Standard If/else statement</b></p>
        <p>Put the value you want to test where &#8216;propertylink&#8217; is. If you want an AND operator use &amp;&amp;, if you want and OR operator use ||.</p>
        <p>&nbsp;</p>
    <pre>

    eg. if (value &lt; 10 || value &gt; 20)

    &nbsp;

    value = propertylink;

    if (value &lt; 10){

    [100];

    }else{

    [0];

    }

    </pre><a href="#top">Top</a>
    </div>

    <a id="0031"></a>
    <div id="block_0031" class="info-block closed" style="display:none;">
        <p><b>31 ASCII animation</b></p>
        <p>Add this to the source text property on a text layer, adjust your rows and columns as you see fit. Put in a comp called &#8216;target&#8217; and off you pop! This is a Dan Ebberts script, bloody genius. Although it&#8217;s a bit heavy because of how poorly After Effects handles text.</p>
        <p>&nbsp;</p>
    <pre>

    density = " .'`,^:" + '";~-_+&lt;&gt;i!lI?/|()1{}[]rcvunxzjftLCJUYXZO0Qoahkbdpqwm*WMB8&amp;%$#@';

    target = thisComp.layer("target");

    cols = 105;

    rows = 36;

    w = thisComp.width/cols;

    h = thisComp.height/rows;

    s = ""

    for (var i = 0; i &lt; rows; i++){

    for(var j = 0; j &lt; cols; j++){

    center = [w/2 + j*w, h/2 + i*h];

    sample = target.sampleImage(center,[(w-1)/2,(h-1)/2]);

    s += density[Math.round(linear(sample[0],0,1,0,density.length - 1))];

    }

    s += "\r";

    }

    s

    </pre><a href="#top">Top</a>
    </div>

    <a id="0032"></a>
    <div id="block_0032" class="info-block closed" style="display:none;">
        <p><b>32 Proper Parenting with Expressions</b></p>
        <p>This will replicate parenting the position property rather than just directly linking the position with a simple pickwhip expression.</p>
    <pre>

    <span style="line-height: 1.5em;">myParent = thisComp.layer("Null 1");
    </span>myProp = myParent.transform.position;
    value + (myProp.value - myProp.valueAtTime(0))

    </pre><a href="#top">Top</a>
    </div>

    <a id="0033"></a>
    <div id="block_0033" class="info-block closed" style="display:none;">
        <p><b>33 SinWave animation 2</b></p>
        <p>Add this to a property to make it wave up and down.</p>
    <pre>

    amp = 100;//Height of wave in pixels
    freq = 2;//Oscillations per sec
    beginTime = 0;//in seconds
    endTime = 5;//in seconds

    y = amp*Math.sin(freq*time*2*Math.PI) + (thisComp.height/2);

    x =linear(time, beginTime, endTime, 0, thisComp.width);

    [x,y]

    </pre><a href="#top">Top</a>
    </div>

    <a id="0034"></a>
    <div id="block_0034" class="info-block closed" style="display:none;">
        <p><b>34 Mask Vertex Expression Script &#8211; Link to Null</b></p>
        <p>Use this expression in conjunction with the free &#8220;MaskVertexExpression&#8221; Script, to link a single vertex point to a null.</p>
    <pre>

    if (thisProperty.propertyGroup(1).propertyIndex == 1)
    thisComp.layer("Null1").position;
    else
    value;

    </pre><a href="#top">Top</a>
    </div>

    <a id="0035"></a>
    <div id="block_0035" class="info-block closed" style="display:none;">
        <p><b>Expanded LOOPOUT script (works on paths!)</b></p>
        <p>This expression looks only at keyframes, and is more editable than the original loopOut expression. You can offset the timing of your loop with the offset property at the top.</p>
    <pre>

    // Offset N.B this doesn't work as expected, not sure what it's doing...
    offset = framesToTime(0);

    // get the total time of movement
    endOfMovement = key(numKeys).time;

    // get time of first key
    startOfMovment = key(1).time;

    // get duration of movment
    durationOfMovment = endOfMovement - startOfMovment;

    // Set value to time percent duration
    valueAtTime( ((time + offset ) % durationOfMovment) + startOfMovment );

    </pre>

        <p>An alternative version with no offset.</p>
    <pre>

   	// get the total time of movement
	lastKeyTime = key(numKeys).time;

	// get time of first key
	firstKeyTime = key(1).time;

	// get duration of movment
	durationOfMovment = lastKeyTime - firstKeyTime;

	// Set value to time percent duration
	valueAtTime( ((time + firstKeyTime ) % durationOfMovment) + firstKeyTime );

    </pre><a href="#top">Top</a>
    </div>

    <a id="0036"></a>
    <div id="block_0036" class="info-block closed" style="display:none;">
        <p><b>Shape Layer and Effects Index numbers - Group Properties</b></p>
        <p>Apply this to a property in a shape layer or an effect to find the index number of the property's hierarchy. For example if you put the following into a standard shape layer's stroke width property it will give you the index number for the shape group it is in. So if this was the second shape group within the shape layer's contents it would return 2.</p>
    <pre>

    thisProperty.propertyGroup(3).propertyIndex

    </pre>
        <p>The number in propertyGroup() steps backwards through the hierarchy. So 1 would be it's containing property group, 2 would be the next one up and so on.</p>
        <p>You can also get the number of properties within a certain property group by using the following:</p>

    <pre>

    thisProperty.propertyGroup(3).numProperties

    </pre>

        <a href="#top">Top</a>
    </div>

    <a id="0037"></a>
    <div id="block_0037" class="info-block closed" style="display:none;">
        <p><b>Using Layer and Shape titles as Index numbers</b></p>
        <p>This is useful if you want to use the layer name as an index number rather than it's own layer index. For it to work you have to have a one word title like "Layer" then a space then a number. If you don;t follow this structure it won't work.</p>
    <pre>

    parseInt(thisLayer.name.split(" ")[1],10)

    </pre>

        <p>The most useful way of using this is to use it within a shape layer to reference linked properties via an index. There might be a better way, but using the following expression will access the index number based on the layer name of the containing shape. E.g. "Shape 1" it will return the 1.</p>

    <pre>

    parseInt(thisProperty.propertyGroup(3).name.split(" ")[1],10)

    </pre>

        <p>So the following expression will link to the Trim Paths End of the previous shape group.</p>

    <pre>

    content ("DOT " + (parseInt(thisProperty.propertyGroup(3).name.split(" ")[1],10) - 1)).content("Trim Paths 1").end

    </pre>
        <a href="#top">Top</a>
    </div>

    <a id="0038"></a>
    <div id="block_0038" class="info-block closed" style="display:none;">
        <p><b>NEW TEMPLATE</b></p>
        <p>Description.</p>
    <pre>

    Expression example goes here

    </pre><a href="#top">Top</a>
    </div>


    <!-- ***************************** Web References ***************************** -->
    <a id="1001"></a>
    <div id="block_1001" class="info-block closed" style="display:none;">
        <p><b>Useful Expression Related Links</b></p>
        <p>Adobe <a href="http://helpx.adobe.com/en/after-effects/using/expression-language-reference.html">Expressions Language reference</a></p>
        <p>http://helpx.adobe.com/en/after-effects/using/expression-language-reference.html</a></p>
        <p>Adobe <a href="http://helpx.adobe.com/after-effects/using/expression-basics.html">expressions basics</a></p>
        <p>http://helpx.adobe.com/after-effects/using/expression-basics.html</a></p>
        <p><a href="http://motionscript.com">MotionScript.com</a> home of Dan Ebberts, excellent place for expressions novices and veterans alike.</p>
        <p>Creative Cow forums, <a href="http://forums.creativecow.net/adobe_after_effects_expressions">regular haunt of Dan Ebberts</a></p>
        <p>http://forums.creativecow.net/adobe_after_effects_expressions</p>
        <p>Good list of <a href="http://yenaphe.info/top-10-scripts-for-after-effects-for-workflow-enhancement/">AE scripts</a> (not all free, and opinion of Yenaphe)</p>
        <p>http://yenaphe.info/top-10-scripts-for-after-effects-for-workflow-enhancement/</p>
        <p>&nbsp;</p><a href="#top">Top</a>
    </div>

    <script type='text/javascript'>
        /**
         * Handles the open/close event for a given type of block
         * NB The actionClass parameter identifies all the other blocks of the same type
         * It allows us to close them all without affecting other open block types
         * @param elemId
         */
        function toggleBlock(elemId, actionClass) {
            if (jQuery('#'+elemId).hasClass('closed')) {
                jQuery('.open').each(function() {
                    // Close all other elems
                    if (jQuery(this).hasClass(actionClass)) {
                        closeElem(jQuery(this), jQuery(this).attr('id'));
                    }
                });
                openElem(jQuery('#'+elemId), elemId);
            } else {
                closeElem(jQuery('#'+elemId), elemId);
            }
        }
        function openElem(infoElem, elemId) {
            infoElem.show('slow');
            infoElem.removeClass('closed');
            infoElem.addClass('open');
            // Find its corresponding link and adjust its inner text
            jQuery('#link_'+elemId).text('close');
        }
        function closeElem(infoElem, elemId) {
            infoElem.hide('slow');
            infoElem.removeClass('open');
            infoElem.addClass('closed');
            // Find its corresponding link and adjust its inner text
            jQuery('#link_'+elemId).text('open');
        }
        function getTitle(sessionData) {
            return ('Session ('+sessionData.id+'):'+sessionData.name);
        }
        jQuery(document).ready(function () {
            var links = new Array();
            // **********************************************************************
            // Links
            links.push({ id:"0001", title:"General - Small and Quick Expressions", newSection: false });
            links.push({ id:"0002", title:"Wiggle Expression Variations", newSection: false });
            links.push({ id:"0003", title:"Gravity Expression - Triggered by a layer marker", newSection: false });
            links.push({ id:"0004", title:"Scale Spring", newSection: false });
            links.push({ id:"0005", title:"Opacity Flashing - Triggered by markers", newSection: false });
            links.push({ id:"0006", title:"Inertial Bounce", newSection: false });
            links.push({ id:"0007", title:"Randomly Select and Hold a Keyframe", newSection: false });
            links.push({ id:"0008", title:"Rolling Wheel", newSection: false });
            links.push({ id:"0009", title:"Averaging", newSection: false });
            links.push({ id:"0010", title:"Jitter on the Y axis", newSection: false });
            links.push({ id:"0011", title:"Linked Animation Time Offset", newSection: false });
            links.push({ id:"0012", title:"Wobble - Triggered by layer markers", newSection: false });
            links.push({ id:"0013", title:"Speed Value", newSection: false });
            links.push({ id:"0014", title:"Bouncing Ball Expression", newSection: false });
            links.push({ id:"0015", title:"Angle Based sin wave animation", newSection: false });
            links.push({ id:"0016", title:"Avoid Me", newSection: false });
            links.push({ id:"0017", title:"Follow the Leader - with elasticity from linked layers", newSection: false });
            links.push({ id:"0018", title:"Child Tracking", newSection: false });
            links.push({ id:"0019", title:"3D Lines made with solids", newSection: false });
            links.push({ id:"0020", title:"2D position of a 3D layer", newSection: false });
            links.push({ id:"0021", title:"Range Mapping", newSection: false });
            links.push({ id:"0022", title:"BG Renderer using terminal or MSDOS Prompt", newSection: false });
            links.push({ id:"0023", title:"Motion Blur with directional blur using velocity and atan2", newSection: false });
            links.push({ id:"0024", title:"Point Colour Sampling", newSection: false });
            links.push({ id:"0025", title:"Convert camera FOV (degrees) to after effects zoom (pixels)", newSection: false });
            links.push({ id:"0026", title:"Only do something when layer is visible in the comp", newSection: false });
            links.push({ id:"0027", title:"2D look at Rotation", newSection: false });
            links.push({ id:"0028", title:"Speed Control loopOut", newSection: false });
            links.push({ id:"0029", title:"Delete every nth frame of footage", newSection: false });
            links.push({ id:"0030", title:"Standard If/else statement", newSection: false });
            links.push({ id:"0031", title:"ASCII Animation", newSection: false });
            links.push({ id:"0032", title:"Proper Parenting with Expressions", newSection: false });
            links.push({ id:"0033", title:"Sin Wave Animation 2", newSection: false });
            links.push({ id:"0034", title:"Mask Vertex Expression Script - Link to Null", newSection: false });
            links.push({ id:"0035", title:"Expanded LOOPOUT script (works on paths!)", newSection: false });
            links.push({ id:"0036", title:"Shape Layer and Effects Index numbers - Group Properties", newSection: false });
            links.push({ id:"0037", title:"Using Layer and Shape titles as Index numbers", newSection: false });
            links.push({ id:"0038", title:"NEW TEMPLATE", newSection: false });
            // Web references are kept separate and at the bottom of the list
            links.push({ id:"1001", title:"Useful Expression Related Links", newSection: true});
            // **********************************************************************
            var targetParagraph = document.getElementById('linksParagraph');
            if (targetParagraph) {
                for (var i=0; i<links.length; i++) {
                    var link = links[i];
                    // Check if we have a new section
                    if (link.newSection) {
                        // Attach a dividing line
                        var sectionElem = document.createElement('hr');
                        targetParagraph.appendChild(sectionElem);
                    }
                    // Attach the new link
                    var newDiv = document.createElement('div');
                    newDiv.innerHTML = ('(-'+link.id+'-) <a href="#'+link.id+'" onclick="toggleBlock(\'block_'+link.id+'\', \'info-block\');">'+link.title+'</a>');
                    targetParagraph.appendChild(newDiv);
                }
            } else {
                alert("Could not find target paragraph");
            }
        });
    </script>
@endsection