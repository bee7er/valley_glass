<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Valley Glass :: @section('title') @show</title>
    @section('meta_keywords')
        <meta name="keywords" content="stained glass, leaded glass, leaded windows"/>
    @show @section('meta_author')
        <meta name="author" content="Brian Etheridge"/>
    @show @section('meta_description')
        <meta name="description" content="Brian Etheridge is a stained glass repairer, restorer and artisan"/>
    @show
        <meta property="og:title" content="Brian Etheridge">
        <meta property="og:image" content="img/images/black_hole.jpg">
        <meta property="og:description" content="Brian Etheridge is a stained glass artisan with many years experience.
        Please get in touch for more info and availability!">

		<link href="{{ asset('css/site.css?v4.2') }}" rel="stylesheet">
        <script src="{{ asset('js/site.js?v4') }}"></script>

    @yield('styles')
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">

    <link rel="stylesheet" href="https://bulma.io/css/bulma-docs.min.css?v=202012211605">
</head>
<body>


<div class="wrapper">

    @if (!Auth::guest())
        @include('partials.nav')
    @endif

    @include('partials.header')

    <div class="container-fluid">

        @yield('content')

    </div>

    <div class="row footer-row-container">
        <div style="text-align: center;padding-top:80px;">&copy; {{ (new DateTime)->format('Y') }} brian etheridge</div>
    </div>

</div>

@yield('global-scripts')
@yield('page-scripts')

<div id="imageModal" class="modal">
    <div class="modal-background"></div>
    <div class="modal-content has-background-white py-5 px-5">
        <img id="image" class="content-img" src="" width="600px">
    </div>
    <button id="modal1Close" class="modal-close is-large" aria-label="close"></button>
</div>

<script type="text/javascript">
    const imageModal = document.querySelector('#imageModal');
    const image = document.querySelector('#image');

    imageModal.addEventListener('click', function () {
        imageModal.classList.remove('is-active');
    });

    function imageClicked(elem) {
        image.src = elem.src;
        imageModal.classList.add('is-active');
    }
</script>

</body>
</html>