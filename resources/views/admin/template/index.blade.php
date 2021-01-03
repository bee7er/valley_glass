@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {!! trans("admin/template.template") !!}
:: @parent @endsection

{{-- Content --}}
@section('main')
    <div class="page-header">
        <h3>
            {!! trans("admin/template.template") !!}
            <div class="pull-right">
                <div class="pull-right">
                    <a href="{!! url('admin/template/create') !!}"
                       class="btn btn-sm  btn-primary iframe"><span
                                class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/modal.new") }}</a>
                </div>
            </div>
        </h3>
    </div>

    <table id="table" class="table table-striped table-hover">
        <thead>
        <tr>
            <th>{!! trans("admin/template.name") !!}</th>
            <th>{!! trans("admin/admin.created_at") !!}</th>
            <th>{!! trans("admin/admin.action") !!}</th>
        </tr>
        </thead>
        <tbody>
        @if(count($templates)>0)
            <div class="row">
                <h2>{!! trans("admin/template.template") !!}</h2>
                @foreach ($templates as $template)
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-md-8">
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif

        </tbody>
    </table>
@endsection

{{-- Scripts --}}
@section('scripts')
@endsection
