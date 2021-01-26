@extends('layouts.app')
@section('title') home @parent @endsection

@section('content')

    @if($titleResource)
        <div class="title-row-container">
            <div class="row" onclick="document.location='{{url($titleResource->name)}}';">
                <img id="{!! $titleResource->id !!}" class="title-work-image" onmouseover="this.src='{!! $titleResource->titleThumbHover !!}'" onmouseout="this.src='{!! $titleResource->titleThumb !!}'" src="{!! $titleResource->titleThumb !!}" title="" alt="{!! $titleResource->name !!}" style="width: 100%">
            </div>
        </div>
    @endif

    @if(count($resources)>0)
        <div class="row-container">
            <div class="row">
                @foreach($resources as $key=>$resource)
                    @if($resource->video)
                        <div {!! $resource->clickAction !!}>
                            <video class="work-image {!! $resource->clickActionClass !!} col-xs-12 col-sm-6 col-md-6
                             col-lg-4"
                                   autoplay
                                   muted loop
                                   preload="auto">
                                <source src="{!! $resource->video !!}" type="video/mp4">
                                Your browser does not support the video tag
                            </video>
                        </div>
                    @else
                        <div {!! $resource->clickAction !!}>
                            <img id="{!! $resource->id !!}" class="work-image {!! $resource->clickActionClass !!}
                                    col-xs-12 col-sm-6 col-md-6 col-lg-4"
                                 {!! $resource->hoverActions !!}
                                 src="{!! $resource->thumb !!}" title="" alt="{!! $resource->name !!}">
                        </div>
                    @endif
                    @if($key > 0 && ($key + 1) % 3 === 0)
                        <!-- Add a blank separator line to ensue panels line up correctly -->
                        <div class="row-container"><div class="row">&nbsp;</div></div>
                    @endif
                @endforeach
            </div>
        </div>
    @else
        <div class="row-container">
            <div class="row">
                No glass projects found
            </div>
        </div>
    @endif

    <div class="go-top" onclick="scrollToAnchor('top');"><img class="square" src="img/gotop.png"
                                                              onmouseover="this.src='img/gotop_hv.png'"
                                                              onmouseout="this.src='img/gotop.png'"></div>

    @if(count($resources)>0)
        {{-- Preload images --}}
        <div style="visibility: hidden;">
            @foreach($resources as $resource)
                <img src="{!! $resource->thumb !!}" class="hidden-preload">
                <img src="{!! $resource->hover !!}" class="hidden-preload">
            @endforeach
        </div>
    @endif

@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
        });
    </script>
@endsection
