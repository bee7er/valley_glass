@extends('admin.layouts.modal')
{{-- Content --}}
@section('content')
        <!-- Tabs -->
<ul class="nav nav-tabs">
    <li class="active"><a href="#tab-general" data-toggle="tab"> {{
			trans("admin/modal.general") }}</a></li>
</ul>
<!-- ./ tabs -->
@if (isset($notice))
{!! Form::model($notice, array('url' => url('admin/notice') . '/' . $notice->id, 'method' => 'put','class' => 'bf')) !!}
@else
{!! Form::open(array('url' => url('admin/notice'), 'method' => 'post', 'class' => 'bf')) !!}
@endif
        <!-- Tabs Content -->
<div class="tab-content">
    <!-- General tab -->
    <div class="tab-pane active" id="tab-general">
        <div class="form-group  {{ $errors->has('seq') ? 'has-error' : '' }}">
            {!! Form::label('Sequence', trans("admin/notice.seq"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('seq', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('seq', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('notice') ? 'has-error' : '' }}">
            {!! Form::label('notice', trans("admin/notice.notice"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::textarea('notice', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('notice', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('url') ? 'has-error' : '' }}">
            {!! Form::label('url', trans("admin/notice.url"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('url', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('url', ':message') }}</span>
            </div>
        </div>
        <!-- ./ general tab -->
    </div>
    <!-- ./ tabs content -->

    <!-- Form Actions -->

    <div class="form-group">
        <div class="col-md-12">
            <button type="reset" class="btn btn-sm btn-warning close_popup">
                <span class="glyphicon glyphicon-ban-circle"></span> {{
						trans("admin/modal.cancel") }}
            </button>
            <button type="reset" class="btn btn-sm btn-default">
                <span class="glyphicon glyphicon-remove-circle"></span> {{
						trans("admin/modal.reset") }}
            </button>
            <button type="submit" class="btn btn-sm btn-success">
                <span class="glyphicon glyphicon-ok-circle"></span>
                @if	(isset($notice))
                    {{ trans("admin/modal.edit") }}
                @else
                    {{trans("admin/modal.create") }}
                @endif
            </button>
        </div>
    </div>
    <!-- ./ form actions -->
{!! Form::close() !!}
</div>
@endsection
