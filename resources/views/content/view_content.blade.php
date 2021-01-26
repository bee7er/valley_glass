@extends('layouts.app')
@section('title') {!! $title !!} @parent @endsection
@section('content')

    @if($error)
        <div class="row-container">
            <div class="row error">
                {!! $error !!}
            </div>
        </div>
    @else

        {!! $resource->rendered !!}

    @endif

    <div class="go-top" onclick="scrollToAnchor('top');"><img class="square" src="img/gotop.png"
                                                              onmouseover="this.src='img/gotop_hv.png'"
                                                              onmouseout="this.src='img/gotop.png'"></div>

@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
        });
    </script>
@endsection
