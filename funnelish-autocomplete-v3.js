(function() {
  // Helper function to find fields with fallback data-types
  function findField(tag, types) {
    for (var i = 0; i < types.length; i++) {
      var el = document.querySelector('.el-940269 ' + tag + '[data-type="' + types[i] + '"]');
      if (el) return el;
    }
    return document.querySelector(tag + '[data-type="' + types[0] + '"]');
  }

  function init() {
    if (!window.google || !google.maps || !google.maps.places) { setTimeout(init, 300); return; }
    var addressInput = document.querySelector('input[data-type="shipping_address"]');
    if (!addressInput) { setTimeout(init, 300); return; }
    if (document.getElementById('gac-dropdown')) return;
    var countrySelect = document.querySelector('select[data-type="country"]');
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;width:100%;flex:1 1 100%;';
    addressInput.parentNode.insertBefore(wrap, addressInput);
    wrap.appendChild(addressInput);
    var dd = document.createElement('div');
    dd.id = 'gac-dropdown';
    dd.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #ddd;border-top:none;z-index:99999;display:none;max-height:200px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:0 0 8px 8px;font-family:Arial,sans-serif;-webkit-overflow-scrolling:touch;margin-top:0;width:100%;box-sizing:border-box;';
    wrap.appendChild(dd);
    var style = document.createElement('style');
    style.textContent = '#gac-dropdown .gac-item{padding:12px 14px;cursor:pointer;border-bottom:1px solid #f0f0f0;-webkit-tap-highlight-color:transparent;background:#fff;}#gac-dropdown .gac-item:active{background:#e8e8e8 !important;}#gac-dropdown .gac-item:hover{background:#f5f5f5;}#gac-dropdown .gac-item:last-child{border-bottom:none;}@media(max-width:600px){#gac-dropdown{max-height:150px;}#gac-dropdown .gac-item{padding:14px;font-size:15px;}#gac-dropdown .gac-item span{font-size:13px !important;}}';
    document.head.appendChild(style);
    var service = new google.maps.places.AutocompleteService();
    var placesService = new google.maps.places.PlacesService(document.createElement('div'));
    var debounce;
    var justSelected = false;
    function getSelectedCountry() {
      if (!countrySelect || !countrySelect.value || countrySelect.selectedIndex === 0) return null;
      return countrySelect.value;
    }
    addressInput.addEventListener('input', function() {
      clearTimeout(debounce);
      if (justSelected) { justSelected = false; return; }
      var val = this.value;
      if (val.length < 3) { dd.style.display = 'none'; return; }
      debounce = setTimeout(function() {
        var opts = { input: val, types: ['address'] };
        var country = getSelectedCountry();
        if (country) { opts.componentRestrictions = { country: country }; }
        service.getPlacePredictions(opts, function(predictions, status) {
          dd.innerHTML = '';
          if (status !== 'OK' || !predictions) { dd.style.display = 'none'; return; }
          predictions.forEach(function(p) {
            var item = document.createElement('div');
            item.className = 'gac-item';
            item.innerHTML = '<strong>' + p.structured_formatting.main_text + '</strong><br><span style="color:#888;font-size:12px">' + (p.structured_formatting.secondary_text || '') + '</span>';
            item.onclick = function() {
              justSelected = true;
              addressInput.value = p.structured_formatting.main_text;
              addressInput.dispatchEvent(new Event('input', { bubbles: true }));
              dd.style.display = 'none';
              placesService.getDetails({ placeId: p.place_id, fields: ['address_components'] }, function(place) {
                if (!place) return;
                var city = '', state = '', stateLong = '', zip = '';
                place.address_components.forEach(function(c) {
                  if (c.types.includes('locality') || c.types.includes('sublocality_level_1')) city = c.long_name;
                  if (c.types.includes('administrative_area_level_1')) { state = c.short_name; stateLong = c.long_name; }
                  if (c.types.includes('postal_code')) zip = c.long_name;
                });
                var cityIn = findField('input', ['shipping_city', 'city']);
                if (cityIn) { cityIn.value = city; cityIn.dispatchEvent(new Event('input', { bubbles: true })); }
                var zipIn = findField('input', ['shipping_zip', 'zip']);
                if (zipIn) { zipIn.value = zip; zipIn.dispatchEvent(new Event('input', { bubbles: true })); }
                setTimeout(function() {
                  var attempts = 0;
                  var si = setInterval(function() {
                    attempts++;
                    var stateS = findField('select', ['shipping_state', 'state']);
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
        });
      }, 300);
    });
    document.addEventListener('click', function(e) {
      if (!addressInput.contains(e.target) && !dd.contains(e.target)) dd.style.display = 'none';
    });
  }
  setTimeout(init, 500);
  document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 500); });
  window.addEventListener('load', function() { setTimeout(init, 500); });
})();