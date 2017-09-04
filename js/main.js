'use strict';

// Pin API
const pinsUrl = 'https://radiant-plains-19783.herokuapp.com/pins';

// Initialize google map
function initMap(customCenter = false) {
  const center = {
    lat: -25.344,
    lng: 131.036
  };

  const map = new google.maps.Map(document.getElementById('map'), { zoom: 4, center: customCenter || center });

  axios.get(pinsUrl).then((response => {
    if (response.data.length > 0) {
      response.data.forEach((p) => {
        const marker = new google.maps.Marker({
          position: { lat: Number(p.latitude), lng: Number(p.longitude) },
          map: map
        });
        const infowindow = new google.maps.InfoWindow({
          content: `<h5>${p.message}</h5>`
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      });
    }
    $('#map-loader').fadeOut(300);
  }));
}

function main() {

  $('.input-error').hide();

  // Initialize form input nodes
  const $latitude = $('#latitude');
  const $longitude = $('#longitude');
  const $message = $('#message');
  const formInputs = [$latitude, $longitude, $message];

  // Add add/remove invalid class on inputs
  function validateForm(valid) {
    formInputs.forEach((n) => {
      if (n.hasClass('uk-form-danger') && valid) {
        n.removeClass('uk-form-danger');
      } else if (!n.hasClass('uk-form-danger') && !valid) {
        n.addClass('uk-form-danger');
      }
    });
  }

  // Function for submitting form data
  function submitForm() {
    axios.post(pinsUrl, {
      latitude: $latitude[0].value,
      longitude: $longitude[0].value,
      message: $message[0].value
    })
      .then(() => {
        validateForm(true);
      $('.input-error').hide(100);
        initMap({ lat: Number($latitude[0].value), lng: Number($longitude[0].value) });
        formInputs.forEach((n) => { n.val('') });
    })
      .catch(() => {
        validateForm(false);
        $('.input-error').show(200);
    })
  }

  // Handler for form submission
  $('#submit').click(() => {
    if (formInputs.every((n) => { return n[0].value !== '' })) {
      $('#submit').next('p').text('');
      submitForm();
    } else {
      validateForm(false);
      $('#submit').next('p').text('All fields must be filled.');
    }
    return false;
  });

}

document.addEventListener('DOMContentLoaded', main);
