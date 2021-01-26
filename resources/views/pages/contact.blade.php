@extends('layouts.app')
@section('title') about @parent @endsection

@section('content')

        <div class="row-container">
            <div class="row">

                @if (null !== $success)
                    <div class="form-message">
                        {{ $success }}
                    </div>
                @else
                    <div style="margin-top: 24px;text-align: left;">
                        @if (null !== $error)
                            <div class="form-error-message">
                                {!! $error !!}
                            </div>
                        @endif

                        <div class="form-title">Please enter your details below and we will contact you to discuss
                            your requirements</div>
                        <form action="contact" id="contactForm" name="contactForm" method="post" class="" novalidate="novalidate">
                            <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" name="update" value="1">
                            <p>Your name<br><span class=""><input type="text" name="contactName" value="{{
                            $request->contactName }}" size="40"
                                                                  class="contact-name"></span></p>
                            <p>Your email<br><span class=""><input type="email" name="contactEmail" size="40"
                                                                   class="contact-email" value="{{
                            $request->contactEmail }}"></span> </p>
                            <p>Your message<br><span class=""><textarea name="contactMessage" cols="40" rows="4"
                                                                        class="contact-message">{{
                            $request->contactMessage }}</textarea></span></p>
                            <p>
                            @if(env('GOOGLE_RECAPTCHA_KEY'))
                                <div class="g-recaptcha" data-sitekey="{{env('GOOGLE_RECAPTCHA_KEY')}}"></div>
                            @endif
                            </p><br>
                            <p><input type="submit" value="Send" class="submit-button"></p>
                        </form>
                    </div><br>
                @endif
            </div>
        </div>

@endsection

@section('page-scripts')
    <script type="text/javascript">
        $(document).ready( function()
        {
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
