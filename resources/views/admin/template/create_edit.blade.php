@extends('admin.layouts.modal')
{{-- Content --}}
@section('content')
        <!-- Tabs -->
<ul class="nav nav-tabs">
    <li class="active"><a href="#tab-general" data-toggle="tab"> {{
			trans("admin/modal.general") }}</a></li>
</ul>
<!-- ./ tabs -->
@if (isset($template))
{!! Form::model($template, array('url' => url('admin/template') . '/' . $template->id, 'method' => 'put','id'=>'fupload','class' => 'bf', 'files'=> true)) !!}
@else
{!! Form::open(array('url' => url('admin/template'), 'method' => 'post', 'class' => 'bf','id'=>'fupload', 'files'=> true)) !!}
@endif
        <!-- Tabs Content -->
<div class="tab-content">
    <!-- General tab -->
    <div class="tab-pane active" id="tab-general">
        <div class="form-group  {{ $errors->has('name') ? 'has-error' : '' }}">
            {!! Form::label('name', trans("admin/modal.title"), array('class' => 'control-label')) !!}
            <div class="controls">
                {!! Form::text('name', null, array('class' => 'form-control')) !!}
                <span class="help-block">{{ $errors->first('name', ':message') }}</span>
            </div>
        </div>

        <div style="border:1px solid #c2c2c2;padding:3px;margin-bottom:5px;">
            Use the following symbols to insert variable data:
            @foreach ($environmentVars as $symbol => $var) {!! "<div><strong>#" . $symbol . "#</strong>: " . current($var) . "</div>" !!} @endforeach
            @foreach ($resourceAttrs as $symbol => $var) {!! "<div><strong>#" . $symbol . "#</strong>: " . current($var) . "</div>" !!} @endforeach
        </div>

        <div class="form-group  {{ $errors->has('container') ? 'has-error' : '' }}">
            {!! Form::label('container_editor', trans("admin/template.container"), array('class' => 'control-label')) !!}
            <div class="controls">
                <input type="hidden" name="container" id="container" value="@if (isset($template))
                {{$template->container}}@endif" />
                <div name="container_editor" id="container_editor" contenteditable="true" style="border:1px solid
                #c2c2c2;padding:5px;">@if (isset($template)){!! htmlentities($template->container, ENT_HTML5) !!}@endif</div>
                <span class="help-block">{{ $errors->first('container', ':message') }}</span>

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
            <button type="reset" class="btn btn-sm btn-default" onclick="resetContainerEditor();">
                <span class="glyphicon glyphicon-remove-circle"></span> {{
						trans("admin/modal.reset") }}
            </button>
            <button type="submit" class="btn btn-sm btn-success">
                <span class="glyphicon glyphicon-ok-circle"></span>
                @if	(isset($template))
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
<script>
    document.addEventListener('keydown', function (event) {
        var esc = event.which == 27,
                nl = event.which == 13,
                el = event.target,
                input = el.nodeName != 'INPUT' && el.nodeName != 'TEXTAREA';

        if (input) {
            // trap the return key being pressed
            if (esc) {
                resetContainerEditor();
                // prevent the default behaviour of return key pressed
                return false;
            }
        }
    }, true);
    document.addEventListener('keyup', function (event) {
        var esc = event.which == 27,
                nl = event.which == 13,
                el = event.target,
                input = el.nodeName != 'INPUT' && el.nodeName != 'TEXTAREA';

        if (input) {
            //console.log(event);
            document.getElementById('container').value = JSON.stringify(el.innerHTML);
        }
    }, true);

    function resetContainerEditor() {
        document.getElementById('container_editor').innerHTML = "@if (isset($template)) {{$template->container}}@endif";
    }
</script>

@endsection
