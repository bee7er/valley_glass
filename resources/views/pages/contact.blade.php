@extends('layouts.app')
@section('title') about @parent @endsection

@section('content')

        <div class="row-container">
            <div class="row">
                @if (isset($successMessage))
                    <div class="form-message">
                        {{ $successMessage }}
                    </div>
                @else
                    <div style="margin-top: 24px;text-align: left;">
                        <div class="form-title">Please enter your details below and we will contact you to discuss
                            your requirements</div>
                        <form action="contact" id="contactForm" name="contactForm" method="post" class="" novalidate="novalidate">
                            <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" name="update" value="1">
                            <p>Your name<br><span class=""><input type="text" id="contactName" name="contactName"
                                                                  value="{{
                            $request->contactName }}" size="40"
                                   class="contact-name
                                @if (is_array($errors) && isset($errors['contactName']))
                                    contact-form-error
                                @endif"></span>
                                @if (is_array($errors) && isset($errors['contactName']))
                                    @foreach ($errors['contactName'] as $error)
                                        <div class="form-error-message">{{ $error }}</div>
                                    @endforeach
                                @endif
                            </p>
                            <p>Your email<br><span class=""><input type="email" id="contactEmail" name="contactEmail"
                                                                   size="40"
                                                                   class="contact-email
                                   @if (is_array($errors) && isset($errors['contactEmail']))
                                         contact-form-error
                                   @endif" value="{{
                                $request->contactEmail }}"></span>
                                @if (is_array($errors) && isset($errors['contactEmail']))
                                    @foreach ($errors['contactEmail'] as $error)
                                        <div class="form-error-message">{{ $error }}</div>
                                    @endforeach
                                @endif
                            </p>
                            <p>Your message<br><span class=""><textarea id="contactMessage" name="contactMessage"
                                                                        cols="40" rows="4"
                                                                        class="contact-message
                                   @if (is_array($errors) && isset($errors['contactMessage']))
                                        contact-form-error
                                   @endif">{{
                            $request->contactMessage }}</textarea></span>
                                @if (is_array($errors) && isset($errors['contactMessage']))
                                    @foreach ($errors['contactMessage'] as $error)
                                        <div class="form-error-message">{{ $error }}</div>
                                    @endforeach
                                @endif
                            </p>
                            <p>
                            @if(env('GOOGLE_RECAPTCHA_KEY'))
                                <div class="g-recaptcha" data-sitekey="{{env('GOOGLE_RECAPTCHA_KEY')}}"></div>
                                @if (is_array($errors) && isset($errors['captcha']))
                                    @foreach ($errors['captcha'] as $error)
                                         <div class="form-error-message">{{ $error }}</div>
                                    @endforeach
                                @endif
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
                let msg = sep = '';
                // Validate the form fields
                if (!$('#contactName').val().trim()) {
                    msg += (sep + 'Please enter your name');
                    sep = "\n";
                }
                if (!$('#contactEmail').val().trim()) {
                    msg += (sep + 'Please enter your email address');
                    sep = "\n";
                }
                if (!$('#contactMessage').val().trim()) {
                    msg += (sep + 'Please enter your message');
                    sep = "\n";
                }
                if (msg) {
                    msg += ("\n\nDon't forget to check the Captcha\nThank you");
                    alert(msg);
                    return false;
                }

                $("#contactForm").submit();
                return true;
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
