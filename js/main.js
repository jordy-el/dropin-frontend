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

  let placedMarker;

  // Fetch and place all markers
  axios.get(pinsUrl).then((response) => {
    if (response.data.length > 0) {
      response.data.forEach((p) => {
        const marker = new google.maps.Marker({
          position: { lat: Number(p.latitude), lng: Number(p.longitude) },
          map: map
        });
        const infowindow = new google.maps.InfoWindow({
          content: `<p>${p.message}</p>`
        });
        marker.addListener('click', function() {
          map.panTo({lat: this.position.lat(), lng: this.position.lng()});
          infowindow.open(map, marker);
        });
      });
    }
    $('#map-loader').fadeOut(300);
  });

  // Listener for creating marker on click
  google.maps.event.addListener(map, 'click', function(event) {
    if (placedMarker !== undefined) placedMarker.setMap(null);
    placedMarker = new google.maps.Marker({
      position: event.latLng,
      map: map
    });
    const infowindow = new google.maps.InfoWindow({
      content: `<textarea id="dropped-pin-message" class="uk-textarea uk-width-1-1" rows="3" placeholder="Message"></textarea>
                <div class="uk-margin-small">
                    <button id="dropped-pin-submit" class="uk-button uk-button-primary uk-width-1-1">Drop Pin</button>
                </div>`
    });
    infowindow.open(map, placedMarker);
    $('#dropped-pin-submit').click(function() {
      $('#latitude').val(event.latLng.lat);
      $('#longitude').val(event.latLng.lng);
      $('#message').val($('#dropped-pin-message').val());
      $('#submit').trigger('click');
    });
    google.maps.event.addListener(infowindow,'closeclick',function(){
      placedMarker.setMap(null);
    });
  });
}

function main() {

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
