var API = 'https://bh2zs5i75f.execute-api.us-east-1.amazonaws.com/prod';

jQuery(function ($) {
  $('body').on('submit', 'form', function (e) {
    e.preventDefault();
    var $name    = $('#name');
    var name     = $name.val();
    var namePage = '/' + name.toLowerCase() + '.html';

    if (name.length === 0) {
      swal('Uh Oh!', 'Please enter a name to continue', 'error');
    } else {
      // check for spaces
      if (!/[^aA-zZ]/.test(name)) {
        $.get(namePage).done(function (res) {
          window.location.href = namePage;
        }).fail(function (jqXHR, textStatus, errorThrown) {
          if (errorThrown === 'Not Found') {
            $('#loading-group').removeClass('hidden');
            $.ajax({
              type: "POST",
              url: API,
              data: { 
                name: name 
              },
              success: function (res) {
                $('#loading-group').addClass('hidden');
                window.location.href = namePage;
              },
              dataType: 'json',
              contentType: 'application/json'
            });
          }
        });
      } else {
        swal('Uh Oh!', 'Please enter a single word name without spaces or special characters', 'error');
      }
    }
  });
});