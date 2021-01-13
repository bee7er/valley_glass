<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@section('title') Administration @show</title>
    @section('meta_keywords')
        <meta name="keywords" content="admin"/>
    @show @section('meta_author')
        <meta name="author" content="Jon Doe"/>
    @show @section('meta_description')
        <meta name="description" content="Admin portion of this website"/>
    @show

    <link href="{{ asset('css/admin.css') }}" rel="stylesheet">
    <script src="{{ asset('js/admin.js') }}"></script>

    @yield('styles')

    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
</head>
<body>
<div id="wrapper">
    @if (!isset($noSideBar))
        @include('admin.partials.nav')
    @endif
    <div id="page-wrapper">
        @yield('main')
    </div>
</div>

<script type="text/javascript">
    @if(isset($type))
    var oTable;
    $(document).ready(function () {
        oTable = $('#table').DataTable({
            "oLanguage": {
                "sProcessing": "{{ trans('table.processing') }}",
                "sLengthMenu": "{{ trans('table.showmenu') }}",
                "sZeroRecords": "{{ trans('table.noresult') }}",
                "sInfo": "{{ trans('table.show') }}",
                "sEmptyTable": "{{ trans('table.emptytable') }}",
                "sInfoEmpty": "{{ trans('table.view') }}",
                "sInfoFiltered": "{{ trans('table.filter') }}",
                "sInfoPostFix": "",
                "sSearch": "{{ trans('table.search') }}:",
                "sUrl": "",
                "oPaginate": {
                    "sFirst": "{{ trans('table.start') }}",
                    "sPrevious": "{{ trans('table.prev') }}",
                    "sNext": "{{ trans('table.next') }}",
                    "sLast": "{{ trans('table.last') }}"
                }
            },
            "processing": true,
            "serverSide": true,
            "order": [],
            "ajax": "{{ url('admin/'.$type.'/data') }}",
            "pagingType": "full_numbers",
            "fnDrawCallback": function (oSettings) {
                $(".iframe").colorbox({
                    iframe: true,
                    width: "80%",
                    height: "80%",
                    onClosed: function () {
                        oTable.ajax.reload();
                    }
                });
            }
        });
    });
    @endif
</script>
@yield('scripts')
</body>
</html>