@extends('layouts.app')
@section('title') wordle @parent @endsection

@section('content')

        <div class="row-container">
            <div class="row">
                @if (isset($successMessage))
                    <div class="form-message">
                        {{ $successMessage }}
                    </div>
                @else
                    <div style="margin-top: 4px;text-align: left;">
                        <div id="errorMessage" class="error-message">{{ $msg }}</div>
                        <form action="wordle" id="wordleForm" name="wordleForm" method="post" class="" novalidate="novalidate">
                            <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" name="row" value="{{ $row }}">
                            <input type="hidden" name="word" value="{{ $word }}">

                            <p>
                                <input type="text" id="wletter11" name="wletter11" size="1" class="{{$wletter11}}" value="{{$request->wletter11 }}" readonly>
                                <input type="text" id="wletter12" name="wletter12" size="1" class="{{$wletter12}}" value="{{$request->wletter12 }}" readonly>
                                <input type="text" id="wletter13" name="wletter13" size="1" class="{{$wletter13}}" value="{{$request->wletter13 }}" readonly>
                                <input type="text" id="wletter14" name="wletter14" size="1" class="{{$wletter14}}" value="{{$request->wletter14 }}" readonly>
                                <input type="text" id="wletter15" name="wletter15" size="1" class="{{$wletter15}}" value="{{$request->wletter15 }}" readonly>
                            </p>

                            <p>
                                <input type="text" id="wletter21" name="wletter21" size="1" class="{{$wletter21}}" value="{{$request->wletter21 }}" readonly>
                                <input type="text" id="wletter22" name="wletter22" size="1" class="{{$wletter22}}" value="{{$request->wletter22 }}" readonly>
                                <input type="text" id="wletter23" name="wletter23" size="1" class="{{$wletter23}}" value="{{$request->wletter23 }}" readonly>
                                <input type="text" id="wletter24" name="wletter24" size="1" class="{{$wletter24}}" value="{{$request->wletter24 }}" readonly>
                                <input type="text" id="wletter25" name="wletter25" size="1" class="{{$wletter25}}" value="{{$request->wletter25 }}" readonly>
                            </p>

                            <p>
                                <input type="text" id="wletter31" name="wletter31" size="1" class="{{$wletter31}}" value="{{$request->wletter31 }}" readonly>
                                <input type="text" id="wletter32" name="wletter32" size="1" class="{{$wletter32}}" value="{{$request->wletter32 }}" readonly>
                                <input type="text" id="wletter33" name="wletter33" size="1" class="{{$wletter33}}" value="{{$request->wletter33 }}" readonly>
                                <input type="text" id="wletter34" name="wletter34" size="1" class="{{$wletter34}}" value="{{$request->wletter34 }}" readonly>
                                <input type="text" id="wletter35" name="wletter35" size="1" class="{{$wletter35}}" value="{{$request->wletter35 }}" readonly>
                            </p>

                            <p>
                                <input type="text" id="wletter41" name="wletter41" size="1" class="{{$wletter41}}" value="{{$request->wletter41 }}" readonly>
                                <input type="text" id="wletter42" name="wletter42" size="1" class="{{$wletter42}}" value="{{$request->wletter42 }}" readonly>
                                <input type="text" id="wletter43" name="wletter43" size="1" class="{{$wletter43}}" value="{{$request->wletter43 }}" readonly>
                                <input type="text" id="wletter44" name="wletter44" size="1" class="{{$wletter44}}" value="{{$request->wletter44 }}" readonly>
                                <input type="text" id="wletter45" name="wletter45" size="1" class="{{$wletter45}}" value="{{$request->wletter45 }}" readonly>
                            </p>

                            <p>
                                <input type="text" id="wletter51" name="wletter51" size="1" class="{{$wletter51}}" value="{{$request->wletter51 }}" readonly>
                                <input type="text" id="wletter52" name="wletter52" size="1" class="{{$wletter52}}" value="{{$request->wletter52 }}" readonly>
                                <input type="text" id="wletter53" name="wletter53" size="1" class="{{$wletter53}}" value="{{$request->wletter53 }}" readonly>
                                <input type="text" id="wletter54" name="wletter54" size="1" class="{{$wletter54}}" value="{{$request->wletter54 }}" readonly>
                                <input type="text" id="wletter55" name="wletter55" size="1" class="{{$wletter55}}" value="{{$request->wletter55 }}" readonly>
                            </p>

                            <p>
                                <input type="text" id="wletter61" name="wletter61" size="1" class="{{$wletter61}}" value="{{$request->wletter61 }}" readonly>
                                <input type="text" id="wletter62" name="wletter62" size="1" class="{{$wletter62}}" value="{{$request->wletter62 }}" readonly>
                                <input type="text" id="wletter63" name="wletter63" size="1" class="{{$wletter63}}" value="{{$request->wletter63 }}" readonly>
                                <input type="text" id="wletter64" name="wletter64" size="1" class="{{$wletter64}}" value="{{$request->wletter64 }}" readonly>
                                <input type="text" id="wletter65" name="wletter65" size="1" class="{{$wletter65}}" value="{{$request->wletter65 }}" readonly>
                            </p>

                            <p>&nbsp;</p>
                            <div id="keyboard">
                                <div class="row">
                                    <button class="{{$wletterq}}" onclick="return addLetter(this)">q</button>
                                    <button class="{{$wletterw}}" onclick="return addLetter(this)">w</button>
                                    <button class="{{$wlettere}}" onclick="return addLetter(this)">e</button>
                                    <button class="{{$wletterr}}" onclick="return addLetter(this)">r</button>
                                    <button class="{{$wlettert}}" onclick="return addLetter(this)">t</button>
                                    <button class="{{$wlettery}}" onclick="return addLetter(this)">y</button>
                                    <button class="{{$wletteru}}" onclick="return addLetter(this)">u</button>
                                    <button class="{{$wletteri}}" onclick="return addLetter(this)">i</button>
                                    <button class="{{$wlettero}}" onclick="return addLetter(this)">o</button>
                                    <button class="{{$wletterp}}" onclick="return addLetter(this)">p</button>
                                </div>
                                <div class="row" style="padding: 5px 5px 5px 15px;">
                                    <button class="{{$wlettera}}" onclick="return addLetter(this)">a</button>
                                    <button class="{{$wletters}}" onclick="return addLetter(this)">s</button>
                                    <button class="{{$wletterd}}" onclick="return addLetter(this)">d</button>
                                    <button class="{{$wletterf}}" onclick="return addLetter(this)">f</button>
                                    <button class="{{$wletterg}}" onclick="return addLetter(this)">g</button>
                                    <button class="{{$wletterh}}" onclick="return addLetter(this)">h</button>
                                    <button class="{{$wletterj}}" onclick="return addLetter(this)">j</button>
                                    <button class="{{$wletterk}}" onclick="return addLetter(this)">k</button>
                                    <button class="{{$wletterl}}" onclick="return addLetter(this)">l</button>
                                </div>
                                <div class="row">
                                    <button class="{{$wletterenter}}" onclick="return processForm()">enter</button>
                                    <button class="{{$wletterz}}" onclick="return addLetter(this)">z</button>
                                    <button class="{{$wletterx}}" onclick="return addLetter(this)">x</button>
                                    <button class="{{$wletterc}}" onclick="return addLetter(this)">c</button>
                                    <button class="{{$wletterv}}" onclick="return addLetter(this)">v</button>
                                    <button class="{{$wletterb}}" onclick="return addLetter(this)">b</button>
                                    <button class="{{$wlettern}}" onclick="return addLetter(this)">n</button>
                                    <button class="{{$wletterm}}" onclick="return addLetter(this)">m</button>
                                    <button class="{{$wletterdel}}" onclick="return addLetter(this)">del</button>
                                </div>
                                <div class="row">
                                    <p>&nbsp;</p>
                                    <button class="{{$wletterenter}}" onclick="return showWord()">Show word</button>
                                    &nbsp;&nbsp;
                                    <button class="{{$wletterenter}}" onclick="return nextWord()">Next word</button>
                                    &nbsp;&nbsp;
                                    <button class="{{$wletterenter}}" onclick="return copyForm()">Share</button>
                                </div>
                            </div>
                        </form>
                    </div><br>
                @endif
            </div>
        </div>

@endsection

@section('page-scripts')
    <script type="text/javascript">

        let pos = 1;

        function addLetter(buttonElem)
        {
            //console.log('but=' + $(buttonElem).text());

            if ($(buttonElem).text() == 'enter') {
                // Ignore
            } else if ($(buttonElem).text() == 'del') {
                deleteChar();
            } else {
                setChar($(buttonElem).text());
            }
            // Lose focus of the button so that enter does not repeat it
            $(buttonElem).blur();

            return false;
        }

        function deleteChar()
        {
            if (pos == 5 && $('#wletter{{ $row }}' + pos).val() != '') {
                $('#wletter{{ $row }}' + pos).val('');
            } else {
                pos -= 1;
                if (pos < 1) {
                    pos = 1;
                }
                $('#wletter{{ $row }}' + pos).val('');
            }
        }

        function setChar(char)
        {
            $('#wletter{{ $row }}' + pos).val(char);
            pos += 1;
            if (pos > 5) {
                pos = 5;
            }
        }


        function copyToClipboard(elem)
        {
            // create hidden text element, if it doesn't already exist
            var targetId = "_hiddenCopyText_";
            var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
            var origSelectionStart, origSelectionEnd;
            if (isInput) {
                // can just use the original source element for the selection and copy
                target = elem;
                origSelectionStart = elem.selectionStart;
                origSelectionEnd = elem.selectionEnd;
            } else {
                // must use a temporary form element for the selection and copy
                target = document.getElementById(targetId);
                if (!target) {
                    var target = document.createElement("textarea");
                    target.style.position = "absolute";
                    target.style.left = "-9999px";
                    target.style.top = "0";
                    target.id = targetId;
                    document.body.appendChild(target);
                }

                let clipboard = '';
                for (let r=1; r<={{$row}}; r++) {
                    for (let c=1; c<=5; c++) {
                        let elemClass = $('#wletter' + r + c).attr('class');

                        if (elemClass == 'missing') {
                            clipboard += 'x';
                        } else if (elemClass == 'present') {
                            clipboard += 'p';
                        } else if (elemClass == 'correct') {
                            clipboard += 'c';
                        }
                    }
                    clipboard += "\n";
                }
                clipboard += 'x=not present, p=present, c=correct';

                target.textContent = clipboard;
            }

            // select the content
            var currentFocus = document.activeElement;
            target.focus();
            target.setSelectionRange(0, target.value.length);

            // copy the selection
            var succeed;
            try {
                succeed = document.execCommand("copy");
            } catch(e) {
                succeed = false;
            }

            // restore original focus
            if (currentFocus && typeof currentFocus.focus === "function") {
                currentFocus.focus();
            }

            if (isInput) {
                // restore prior selection
                elem.setSelectionRange(origSelectionStart, origSelectionEnd);
            } else {
                // clear temporary content
                target.textContent = "";
            }

            return succeed;
        }

        function copyForm()
        {
            copyToClipboard(document.getElementById("errorMessage"));
            return false;
        }

        function showWord()
        {
            $('#errorMessage').html('The current word is: {{$word}}');
            return false;
        }

        function nextWord()
        {
            window.location.href = '/wordle';
            return false;
        }

        function processForm()
        {
            let char = $.trim($('#wletter{{ $row }}' + pos).val());
            if (pos == 5 && char != '') {
                $("#wordleForm").submit();
                return true;
            }
            return false;
        }

        // Capture and process keyboard events
        $(document).keyup(function(event)
        {
            if (event.preventDefault) event.preventDefault();

            let char = $.trim(event.key.toLowerCase());

            console.log(char);

            if (char == 'enter') {
                return processForm();
            } else if (char == 'backspace') {
                deleteChar();
            } else if (char.length > 1) {
                // Ignore
            } else if (char >= 'a' && char <= 'z') {
                setChar(char);
            }

            return false;
        });

    </script>
@endsection
