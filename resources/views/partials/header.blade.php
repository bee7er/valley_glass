
<div id="top">&nbsp;</div>

<div class="row logo-menu-container">
    <div class="hidden-xs hidden-sm col-md-12 col-lg-12 header-block clearfix">
        <div class="header-menu-left"><span onclick="gotoPage('home');"><img
           class="" src="{{config('app.base_url')}}img/logo.png" width="128" title="Valley Glass Works" /></span>
        </div>
        <div class="header-menu-right">
            <span class="home" onclick="gotoPage('home');" onmouseover="$(this).addClass('white-link-hover');" onmouseout="$(this).removeClass('white-link-hover')">HOME</span><span class="design" onclick="gotoPage('design');" onmouseover="$(this).addClass('white-link-hover');" onmouseout="$(this).removeClass('white-link-hover')">DESIGN</span><span class="repair" onclick="gotoPage('repair');" onmouseover="$(this).addClass('white-link-hover');" onmouseout="$(this).removeClass('white-link-hover')">REPAIRS</span><span class="contact" onclick="gotoPage('contact');" onmouseover="$(this).addClass('white-link-hover')" onmouseout="$(this).removeClass('white-link-hover')">GET QUOTE</span>

            <div class="" style="border: 1px solid red;">
                <span>{!! $aboutText !!}</span>
            </div>
        </div>
    </div>
    <div class="hidden-xs col-sm-12 hidden-md hidden-lg header-block">
        <div><span onclick="gotoPage('home');"><img class="" src="{{config('app.base_url')
        }}img/logo.png" width="96" title="Valley Glass Works" /></span></div>
        <span class="design" onclick="gotoPage('design');" onmouseover="$(this).addClass('white-link-hover');"
              onmouseout="$(this).removeClass('white-link-hover')">design</span>
        <span class="repair" onclick="gotoPage('repair');" onmouseover="$(this).addClass('white-link-hover');"
              onmouseout="$(this).removeClass('white-link-hover')">repair</span>
        <span class="contact" onclick="gotoPage('contact');" onmouseover="$(this).addClass('white-link-hover')"
              onmouseout="$(this).removeClass('white-link-hover')">GET QUOTE</span>
    </div>
    <div class="col-xs-12 hidden-sm hidden-md hidden-lg header-block">
        <div><span onclick="gotoPage('home');"><img class="" src="{{config('app.base_url')
        }}img/logo.png" width="64" title="Valley Glass Works" /></span></div>
        <table class="logo-menu-table">
            <tbody>
            <tr>
                <td class="logo-menu-table-left">
                    <span class="white-link design" onclick="gotoPage('design');" onmouseover="$(this).addClass
                    ('white-link-hover');"
                          onmouseout="$(this).removeClass('white-link-hover')">design</span>
                </td>
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
                                                    ">contact</span>
                </td>
                <td class="logo-menu-table-right">
                    &nbsp;
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
            let option = window.location.pathname.replace('{{env('BASE_URL')}}', '');
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
