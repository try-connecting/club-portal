// PDF Filter Function
function dcPdfFilter(btn, cat) {
  document.querySelectorAll('#dc-playbooks .dc-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.dc-pdf-card').forEach(function(card){
    var cardCat = card.getAttribute('data-pdf-cat');
    card.style.display = (cat === 'all' || cardCat === cat) ? '' : 'none';
  });
}

// Video Filter Functions
function dcFilter(btn, val, panelId) {
  btn.parentElement.querySelectorAll('.dc-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters(panelId);
}

function dcTopicFilter(btn, val, panelId) {
  btn.parentElement.querySelectorAll('.dc-topic-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters(panelId);
}

function applyFilters(panelId) {
  var panel = document.getElementById(panelId);
  var activeDur = panel.querySelector('.dc-filter-btn.active');
  var activeTopic = panel.querySelector('.dc-topic-btn.active');
  var durVal = activeDur.getAttribute('onclick').split("'")[1];
  var topicVal = activeTopic.getAttribute('onclick').split("'")[1];
  panel.querySelectorAll('.dc-vid-card').forEach(function(card){
    var dOk = (durVal==='all') || card.getAttribute('data-duration')===durVal;
    var tOk = (topicVal==='all') || card.getAttribute('data-topic')===topicVal;
    card.style.display = (dOk && tOk) ? '' : 'none';
  });
}

// Movie Genre Filter
function dcMovieFilter(button, genre) {
  var movieSection = document.getElementById('movies');
  if (!movieSection) return;
  var rows = movieSection.querySelectorAll('.dc-filter-row');
  var genreRow = rows[0];
  if (genreRow) genreRow.querySelectorAll('.dc-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  button.classList.add('active');
  applyMovieFilters();
}

// Movie Platform Filter
function dcMoviePlatformFilter(button, platform) {
  var platformRow = document.getElementById('movie-platform-filters');
  if (platformRow) platformRow.querySelectorAll('.dc-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  button.classList.add('active');
  applyMovieFilters();
}

function applyMovieFilters() {
  var movieSection = document.getElementById('movies');
  if (!movieSection) return;
  var rows = movieSection.querySelectorAll('.dc-filter-row');
  var genreRow = rows[0];
  var activeGenreBtn = genreRow ? genreRow.querySelector('.dc-filter-btn.active') : null;
  var activeGenre = 'all';
  if (activeGenreBtn) { activeGenre = activeGenreBtn.getAttribute('onclick').split("'")[1] || 'all'; }
  var platformRow = document.getElementById('movie-platform-filters');
  var activePlatBtn = platformRow ? platformRow.querySelector('.dc-filter-btn.active') : null;
  var activePlatform = 'all';
  if (activePlatBtn) { activePlatform = activePlatBtn.getAttribute('onclick').split("'")[1] || 'all'; }
  movieSection.querySelectorAll('.movie-card').forEach(function(card) {
    var genres = card.getAttribute('data-genre') || '';
    var platforms = card.getAttribute('data-platform') || '';
    var gOk = (activeGenre === 'all') || genres.indexOf(activeGenre) !== -1;
    var pOk = (activePlatform === 'all') || platforms.indexOf(activePlatform) !== -1;
    card.style.display = (gOk && pOk) ? '' : 'none';
  });
}

// Secrets Card Interaction
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.secret-card').forEach(function(card) {
    card.addEventListener('click', function() {
      card.classList.toggle('revealed');
    });
  });
});

// Tab Functions
document.addEventListener('DOMContentLoaded', function() {
  var tabButtons = document.querySelectorAll('.tab-button');
  var tabContents = document.querySelectorAll('.tab-content');

  function switchTab(targetTab) {
    tabButtons.forEach(function(btn) { btn.classList.remove('active'); });
    tabContents.forEach(function(content) {
      content.classList.remove('active');
      content.style.cssText = '';
      content.querySelectorAll('.dc-vid-card, .premium-card, .dc-pdf-card, .movie-card').forEach(function(card) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = '';
      });
    });
    var activeButton = document.querySelector('[data-tab="' + targetTab + '"]');
    var activeContent = document.getElementById(targetTab) || document.getElementById('dc-' + targetTab);
    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');
      activeContent.style.cssText = 'display: block !important';
      var nav = document.querySelector('.tab-navigation');
      if (nav) nav.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activeContent.querySelectorAll('.dc-filter-btn').forEach(function(b){ b.classList.remove('active'); });
      activeContent.querySelectorAll('.dc-topic-btn').forEach(function(b){ b.classList.remove('active'); });
      var allBtns = activeContent.querySelectorAll('.dc-filter-row');
      allBtns.forEach(function(row) {
        var first = row.querySelector('.dc-filter-btn');
        if (first) first.classList.add('active');
      });
      var allTopic = activeContent.querySelector('.dc-topic-btn');
      if (allTopic) allTopic.classList.add('active');
    }
  }

  tabButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      switchTab(button.getAttribute('data-tab'));
    });
  });
});
