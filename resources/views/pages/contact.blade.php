@extends('layouts.app')
@section('title') about @parent @endsection

@section('content')

    <div id="contact">&nbsp;</div>

    <div class="title-row-container">
        <div class="row template-title">
            Free Quote
        </div>
    </div>

        <div class="row-container">
            <div class="row">
                {!! $contactText !!}
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
