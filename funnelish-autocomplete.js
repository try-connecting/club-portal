(function() {
  function init() {
    if (!window.google || !google.maps || !google.maps.places) {
      setTimeout(init, 300);
      return;
    }
    var addressInput = document.querySelector('input[data-type="shipping_address"]');
    if (!addressInput) {
      setTimeout(init, 300);
      return;
    }
    if (document.getElementById('gac-dropdown')) return;

    // Auto-detect country from user location
    var countrySelect = document.querySelector('select[data-type="country"]');
    if (countrySelect && !countrySelect.value) {
      fetch('https://ipapi.co/json/')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.country_code && countrySelect && !countrySelect.value) {
            // Find matching option
            for (var i = 0; i < countrySelect.options.length; i++) {
              if (countrySelect.options[i].value === data.country_code) {
                countrySelect.selectedIndex = i;
                break;
              }
            }
            countrySelect.dispatchEvent(new Event('input', { bubbles: true }));
            countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
            // Force visual update for custom select renderers
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', true, true);
            countrySelect.dispatchEvent(evt);
          }
        }).catch(function() {});
    }

    // Create dropdown - inserted right after the input in DOM flow
    var dd = document.createElement('div');
    dd.id = 'gac-dropdown';
    dd.style.cssText = 'background:#fff;border:1px solid #ddd;border-top:none;z-index:99999;display:none;max-height:200px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:0 0 8px 8px;font-family:Arial,sans-serif;-webkit-overflow-scrolling:touch;margin-top:-1px;';
    // Insert right after the input element
    addressInput.parentNode.insertBefore(dd, addressInput.nextSibling);

    // Styles
    var style = document.createElement('style');
    style.textContent = '#gac-dropdown div.gac-item{padding:12px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;-webkit-tap-highlight-color:transparent;background:#fff;}#gac-dropdown div.gac-item:active{background:#e8e8e8 !important;}#gac-dropdown div.gac-item:last-child{border-bottom:none;}@media(max-width:600px){#gac-dropdown{max-height:150px;}#gac-dropdown div.gac-item{padding:14px;font-size:15px;}#gac-dropdown div.gac-item span{font-size:13px !important;}}';
    document.head.appendChild(style);

    var service = new google.maps.places.AutocompleteService();
    var placesService = new google.maps.places.PlacesService(document.createElement('div'));
    var debounce;

    addressInput.addEventListener('input', function() {
      clearTimeout(debounce);
      var val = this.value;
      if (val.length < 3) { dd.style.display = 'none'; return; }
      debounce = setTimeout(function() {
        service.getPlacePredictions({ input: val, types: ['address'] }, function(predictions, status) {
          dd.innerHTML = '';
          if (status !== 'OK' || !predictions) { dd.style.display = 'none'; return; }
          predictions.forEach(function(p) {
            var item = document.createElement('div');
            item.className = 'gac-item';
            item.innerHTML = '<strong>' + p.structured_formatting.main_text + '</strong><br><span style="color:#888;font-size:12px">' + (p.structured_formatting.secondary_text || '') + '</span>';
            item.onmouseenter = function() { this.style.backgroundColor = '#f5f5f5'; };
            item.onmouseleave = function() { this.style.backgroundColor = '#fff'; };
            item.onclick = function() {
              addressInput.value = p.structured_formatting.main_text;
              dd.style.display = 'none';
              placesService.getDetails({ placeId: p.place_id, fields: ['address_components'] }, function(place) {
                if (!place) return;
                var city = '', state = '', stateLong = '', zip = '', countryCode = '';
                place.address_components.forEach(function(c) {
                  if (c.types.includes('locality') || c.types.includes('sublocality_level_1')) city = c.long_name;
                  if (c.types.includes('administrative_area_level_1')) { state = c.short_name; stateLong = c.long_name; }
                  if (c.types.includes('postal_code')) zip = c.long_name;
                  if (c.types.includes('country')) countryCode = c.short_name;
                });

                // Set country first
                var cs = document.querySelector('select[data-type="country"]');
                if (cs && countryCode) {
                  for (var k = 0; k < cs.options.length; k++) {
                    if (cs.options[k].value === countryCode) {
                      cs.selectedIndex = k;
                      break;
                    }
                  }
                  cs.dispatchEvent(new Event('input', { bubbles: true }));
                  cs.dispatchEvent(new Event('change', { bubbles: true }));
                  var evt = document.createEvent('HTMLEvents');
                  evt.initEvent('change', true, true);
                  cs.dispatchEvent(evt);
                }

                // Fill city
                var cityIn = document.querySelector('.el-940269 input[data-type="city"]');
                if (cityIn) { cityIn.value = city; cityIn.dispatchEvent(new Event('input', { bubbles: true })); }

                // Fill zip
                var zipIn = document.querySelector('.el-940269 input[data-type="zip"]');
                if (zipIn) { zipIn.value = zip; zipIn.dispatchEvent(new Event('input', { bubbles: true })); }

                // Wait for state dropdown to load then set it
                setTimeout(function() {
                  var attempts = 0;
                  var si = setInterval(function() {
                    attempts++;
                    var stateS = document.querySelector('.el-940269 select[data-type="state"]');
                    if (stateS && stateS.options.length > 1 && state) {
                      for (var j = 0; j < stateS.options.length; j++) {
                        var opt = stateS.options[j];
                        if (opt.value === state || opt.value === stateLong || opt.text === stateLong || opt.text === state) {
                          stateS.value = opt.value;
                          stateS.dispatchEvent(new Event('change', { bubbles: true }));
                          stateS.dispatchEvent(new Event('input', { bubbles: true }));
                          clearInterval(si);
                          return;
                        }
                      }
                      clearInterval(si);
                    }
                    if (attempts > 20) clearInterval(si);
                  }, 200);
                }, 1000);
              });
            };
            dd.appendChild(item);
          });
          dd.style.display = 'block';
          // Scroll input into view so dropdown is visible
          setTimeout(function() { addressInput.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 100);
        });
      }, 300);
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
      if (!addressInput.contains(e.target) && !dd.contains(e.target)) dd.style.display = 'none';
    });
  }

  // Start polling - works regardless of load timing
  setTimeout(init, 500);
  document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 500); });
  window.addEventListener('load', function() { setTimeout(init, 500); });
})();
