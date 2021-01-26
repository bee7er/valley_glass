@extends('layouts.app')
@section('title') about @parent @endsection

@section('content')

    <div id="about">&nbsp;</div>

        <div class="row-container">
            <div class="row">
                {!! $aboutText !!}
            </div>
        </div>

@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
        });
    </script>
@endsection
