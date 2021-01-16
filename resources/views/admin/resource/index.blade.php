@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {!! trans("admin/resource.resource") !!}
:: @parent @endsection

{{-- Content --}}
@section('main')
    <div class="page-header">
        <h3>
            {!! trans("admin/resource.resource") !!}
            <div class="pull-right">
                <div class="pull-right">
                    <a href="{!! url('admin/resource/create') !!}"
                       class="btn btn-sm  btn-primary iframe"><span
                                class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/modal.new") }}</a>
                </div>
            </div>
        </h3>
    </div>

    <table id="table" class="table table-striped table-hover">
        <thead>
        <tr>
            <th>{!! trans("admin/resource.seq") !!}</th>
            <th>{!! trans("admin/resource.name") !!}</th>
            <th>{!! trans("admin/resource.description") !!}</th>
            <th>{!! trans("admin/resource.template") !!}</th>
            <th>{!! trans("admin/admin.deleted_at") !!}</th>
            <th>{!! trans("admin/admin.created_at") !!}</th>
            <th>{!! trans("admin/admin.action") !!}</th>
        </tr>
        </thead>
        <tbody>
        @if(count($resources)>0)
            <div class="row">
                <h2>{!! trans("admin/resource.resource") !!}</h2>
                @foreach ($resources as $resource)
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
