
<div id="top">&nbsp;</div>

<div class="row logo-menu-container">
    <div class="hidden-xs hidden-sm col-md-12 col-lg-12 header-block">
        <div class="header-menu-left"><span onclick="gotoPage('home');">Valley Glass</span></div>
        <div class="header-menu-right">
            <span class="design" onclick="gotoPage('design');" onmouseover="$(this).addClass('white-link-hover');" onmouseout="$(this).removeClass('white-link-hover')">design</span><img class="square" src="{{config('app.base_url')}}img/square.png" /><span class="repair" onclick="gotoPage('repair');" onmouseover="$(this).addClass('white-link-hover');" onmouseout="$(this).removeClass('white-link-hover')">repair</span><img class="square" src="{{config('app.base_url')}}img/square.png" /><span class="contact" onclick="gotoPage('contact');" onmouseover="$(this).addClass('white-link-hover')" onmouseout="$(this).removeClass('white-link-hover')">free quote</span><img class="square" src="{{config('app.base_url')}}img/square.png" /><span class="about" onclick="gotoPage('about');" onmouseover="$(this).addClass('white-link-hover')" onmouseout="$(this).removeClass('white-link-hover')">about</span></div>
    </div>
    <div class="hidden-xs col-sm-12 hidden-md hidden-lg header-block">
        <span class="design" onclick="gotoPage('design');" onmouseover="$(this).addClass('white-link-hover');"
              onmouseout="$(this).removeClass('white-link-hover')">design</span>
        <img class="square" src="{{config('app.base_url')}}img/square.png" />
        <span class="repair" onclick="gotoPage('repair');" onmouseover="$(this).addClass('white-link-hover');"
              onmouseout="$(this).removeClass('white-link-hover')">repair</span>
        <img class="square" src="{{config('app.base_url')}}img/square.png" />
        <span class="contact" onclick="gotoPage('contact');" onmouseover="$(this).addClass('white-link-hover')"
              onmouseout="$(this).removeClass('white-link-hover')">free quote</span>
        <img class="square" src="{{config('app.base_url')}}img/square.png" />
        <span class="about" onclick="gotoPage('about');" onmouseover="$(this).addClass('white-link-hover')"
              onmouseout="$(this).removeClass('white-link-hover')">about</span>
    </div>
    <div class="col-xs-12 hidden-sm hidden-md hidden-lg header-block">
        <table class="logo-menu-table">
            <tbody>
            <tr>
                <td class="logo-menu-table-left">
                    <span class="white-link design" onclick="gotoPage('design');" onmouseover="$(this).addClass
                    ('white-link-hover');"
                          onmouseout="$(this).removeClass('white-link-hover')">design</span>
                </td>
                <td class="square-vertical logo-menu-table-center"><img src="{{config('app.base_url')}}img/square.png"
                    /></td>
                <td class="logo-menu-table-right">
                    <span class="white-link repair" onclick="gotoPage('repair');" onmouseover="$(this).addClass
                    ('white-link-hover')"
                          onmouseout="$(this).removeClass('white-link-hover')">repair</span>
                </td>
            </tr>
            <tr>
                <td class="logo-menu-table-left">
                    <span class="white-link contact" onclick="gotoPage('contact');" onmouseover="$(this).addClass
                    ('white-link-hover')"
                          onmouseout="$(this).removeClass('white-link-hover')
                                                    ">free quote</span>
                </td>
                <td class="square-vertical logo-menu-table-center"><img src="{{config('app.base_url')}}img/square.png" /></td>
                <td class="logo-menu-table-right">
                    <span class="white-link about" onclick="gotoPage('about');" onmouseover="$(this).addClass
                    ('white-link-hover')"
                          onmouseout="$(this).removeClass('white-link-hover')">about</span>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</div>

@section('global-scripts')
    <script type="text/javascript">
        function gotoPage(aid)
        {
            if (aid == "home") {
                scrollToAnchor(aid);
            } else if (aid == "design") {
                document.location = ("{{config('app.base_url')}}" + "design");
            } else if (aid == "repair") {
                document.location = ("{{config('app.base_url')}}" + "repair");
            } else if (aid == "contact") {
                document.location = ("{{config('app.base_url')}}" + "contact");
            } else if (aid == "about") {
                document.location = ("{{config('app.base_url')}}" + "about");
            } else {
                document.location = ("{{config('app.base_url')}}" + "home#" + aid);
            }
        }

        function scrollToAnchor(aid)
        {
            var aTag = $("div[id='"+ aid +"']");
            if (undefined === aTag.offset()) {
                document.location = ("{{config('app.base_url')}}" + "home");
            } else {
                $('html,body').animate({scrollTop: aTag.offset().top},'slow');
            }
        }

        $(document).ready( function()
        {
            // Set the active menu option
            let option = window.location.pathname.replace('/', '');
            if (!option || option == 'home') {
                option = 'design';
            }
            $('.' + option).each(function (index, value) {
                $(this).addClass('white-link-active');
            });
            // On page load and on resize we check some aspects of the page to ensure responsiveness is correct
            addEvent(window, "resize", handleResizeEvent);
            // Calculate the apsect ratio now, so that it is correct on page load
            calcAspectRatio();
            // Also ensure that the About text panel is at least as high as the image panel
            calcAboutTextPanelHeight();
        });
    </script>
@endsection
