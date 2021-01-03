@extends('layouts.app')
@section('title')
    {!! $image->name !!} :: @parent @endsection
@section('content')
    <div style="width: inherit;text-align: center;">

        {!! $image->rendered !!}

    </div>
@endsection
@section('scripts')
    <script>
        // Nothing to do here
    </script>
@endsection