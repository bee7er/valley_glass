@extends('layouts.app')
@section('title') about @parent @endsection

@section('content')

    <div id="contact">&nbsp;</div>

    <div class="title-row-container">
        <div class="row template-title">
            Free Quote
        </div>
    </div>

        <div class="row-container">
            <div class="row">

                @if (null !== $formMessage)
                    <div class="form-message">
                        {{ $formMessage }}
                    </div>
                @else

                    {!! $contactText !!}

                @endif
            </div>
        </div>

@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
            // Capture csrf token on page load
            $('#_token').val('{{ csrf_token() }}');
            function processForm(e) {
                if (e.preventDefault) e.preventDefault();

                // Validate the form fields

                $("#contactForm").submit();
            }
            // Capture the submit form event
            let form = document.getElementById('contactForm');
            if (form) {
                if (form.attachEvent) {
                    form.attachEvent("submit", processForm);
                } else {
                    form.addEventListener("submit", processForm);
                }
            }
        });
    </script>
@endsection
