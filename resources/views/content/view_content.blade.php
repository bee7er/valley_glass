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
@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
        });
    </script>
@endsection
