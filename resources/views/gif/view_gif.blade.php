@extends('layouts.app')
@section('title')
    {!! $gif->name !!} :: @parent @endsection
@section('content')
    <div style="width: inherit;text-align: center;">

        {!! $gif->rendered !!}

    </div>
@endsection
@section('scripts')
    <script>
        // Nothing to do here
    </script>
@endsection