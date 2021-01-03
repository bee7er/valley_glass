@extends('layouts.app')
@section('title') {!! $videoTitle !!} @parent @endsection
@section('content')

    @if($error)
        <div class="row-container">
            <div class="row error">
                {!! $error !!}
            </div>
        </div>
        <div class="go-top" onclick="scrollToAnchor('top');">
            <div id="goTopHand-work" class="bodymovin-hand" onmouseover="startBodymovinHand(WORK);"
                 onmouseout="stopBodymovinHand(WORK);">
            </div>
        </div>
    @else

        {!! $video->rendered !!}

    @endif

        <div class="go-top" onclick="scrollToAnchor('top');">
            <div id="goTopHand-video" class="bodymovin-hand" onmouseover="startBodymovinHand(VIDEO);"
                 onmouseout="stopBodymovinHand(VIDEO);">
            </div>
        </div>
@endsection

@section('page-scripts')
    <script type="text/javascript">
        var VIDEO = 0;
        $(document).ready( function()
        {
            // Setup the goto top hands and store them in an array
            handAnims[VIDEO] = createBodymovinHand(document.getElementById('goTopHand-video'));
        });
    </script>
@endsection
