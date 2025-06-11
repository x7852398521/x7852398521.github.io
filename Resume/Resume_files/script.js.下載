const btnPrint = document.getElementById("print-btn");
var wrapBox = $("#type-js");
var typingText = $(".text-js");
var newString = "";
const typingSpeed = 200;
($ => {
  'use strict';

  $(() => {
    btnPrint.addEventListener("click", doPrint);
    autoType();
  });

})(jQuery);

var doPrint = () => {
  window.print();
};

var autoType = () => {

  let text = wrapBox.text().trim().split('');

  wrapBox.prepend('<div class="cursor" style="right: initial; left:0;"></div>');
  wrapBox.find(".text-js");

  setTimeout(function () {

    typingText.css("opacity", 1);
    typingText.prev().removeAttr("style");
    typingText.text("");

    let amntOfChars = text.length;

    for (var i = 0; i < amntOfChars; i++) {

      var char = text[i];

      getChar(i + 1, text[i]);
    }

  }, 1500);
};

var getChar = (i, char) => {
  setTimeout(function () {
    newString += char;
    typingText.text(newString);
  }, i * typingSpeed);
};