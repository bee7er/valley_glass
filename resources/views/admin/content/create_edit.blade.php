@extends('admin.layouts.modal')
{{-- Content --}}
@section('content')

    @if (isset($content))
        <h2>Edit Content</h2>
    @else
        <h2>New Content</h2>
    @endif

        <!-- Tabs -->
<ul class="nav nav-tabs">
    <li class="active"><a href="#tab-general" data-toggle="tab"> {{
			trans("admin/modal.general") }}</a></li>
</ul>

<!-- ./ tabs -->
@if (isset($content))
{!! Form::model($content, array('url' => url('admin/content') . '/' . $content->id, 'method' => 'put','class' => 'bf')) !!}
@else
{!! Form::open(array('url' => url('admin/content'), 'method' => 'post', 'class' => 'bf')) !!}
@endif

        <!-- Tabs Content -->
<div class="tab-content">
    <!-- General tab -->
    <div class="tab-pane active" id="tab-general">
        <div class="form-group  {{ $errors->has('seq') ? 'has-error' : '' }}">
            {!! Form::label('Sequence', trans("admin/content.seq"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('seq', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('seq', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('title') ? 'has-error' : '' }}">
            {!! Form::label('Title', trans("admin/content.title"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('title', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('title', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('url') ? 'has-error' : '' }}">
            {!! Form::label('Image url', trans("admin/content.url"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('url', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('url', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('html') ? 'has-error' : '' }}">
            {!! Form::label('HTML', trans("admin/content.html"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::textarea('html', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('html', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('other') ? 'has-error' : '' }}">
            {!! Form::label('Other', trans("admin/content.other"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('other', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('other', ':message') }}</span>
            </div>
        </div>
        <div class="form-group  {{ $errors->has('videoUrl') ? 'has-error' : '' }}">
            {!! Form::label('Video url', trans("admin/content.videoUrl"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('videoUrl', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('url', ':message') }}</span>
            </div>
        </div>

        @if (isset($content))
            <input type="hidden" name="id" value="{{$content->id}}" id="id">
        @endif

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
                @if	(isset($content))
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
