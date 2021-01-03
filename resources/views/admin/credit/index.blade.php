@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {!! trans("admin/credit.title") !!}
:: @parent @endsection

{{-- Content --}}
@section('main')
    <div class="page-header">
        <h3>
            {!! trans("admin/credit.index_title") !!} for resource: {!! $resource->name !!}
            <div class="pull-right">
                <div class="pull-right">
                    <a href="{!! url('admin/credit/create') !!}"
                       class="btn btn-sm  btn-primary iframe"><span
                                class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/modal.new") }}</a>
                </div>
            </div>
        </h3>
    </div>

    <table id="table" class="table table-striped table-hover">
        <thead>
        <tr>
            <th>{!! trans("admin/credit.seq") !!}</th>
            <th>{!! trans("admin/credit.title") !!}</th>
            <th>{!! trans("admin/admin.created_at") !!}</th>
            <th>{!! trans("admin/admin.action") !!}</th>
        </tr>
        </thead>
        <tbody>
        @if(count($credits)>0)
            <div class="row">
                @foreach ($credits as $credit)
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
