@extends('layouts.app')
@section('title') bodymovin :: @parent @endsection

<script type="text/javascript">

//    $(document).ready( function()
//    {
//        bodymovin.loadAnimation({
//            container: element, // the dom element
//            renderer: 'svg',
//            loop: true,
//            autoplay: true,
//            animationData: JSON.parse(animationData) // the animation data
//        });
//    });

</script>

@section('content')

    <body style="background-color: #ff0076;" />

    <div style="width:100%;height:100%;background-color:#333;" id="bodymovin"></div>

    <script type="text/javascript">
        var animData = {
            wrapper: document.getElementById('bodymovin'),
            animType: 'html',
            loop: true,
            prerender: true,
            autoplay: true,
            path: 'animation/data.json'
        };
        var anim = bodymovin.loadAnimation(animData);
    </script>

@endsection
