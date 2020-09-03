const SCHEDULE_SOURCE = 'http://statsapi.mlb.com/api/v1/schedule'
const SCHEDULE_QUERY = '?hydrate=game(content(editorial(recap))),decisions&sportId=1'
const IMAGE = { width: 480, height: 270 };
// don't know about the CopyRight for this
const DEFAULT_IMG = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Major_League_Baseball_logo.svg/200px-Major_League_Baseball_logo.svg.png';

let gameListEl;
let gameData;
let playDate;

const initialize = () => {
  gameData = [];
  gameListEl = document.getElementById('gameList');
  addEventHandling();
  loadGameDataForDate();
}

/**
 * Retreive game data from source URL
 * @param {Date} date object representing game day (defaults to today) 
 */
const fetchJson = async (date = new Date()) => {
  try {
    const queryDate = date
      .toISOString()
      .split('T')[0];

    const url = `${SCHEDULE_SOURCE}${SCHEDULE_QUERY}&date=${queryDate}`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Error fetching data. ', error.message);
  }
}

/**
 * Parse for relevant data from the dates array, for every game.
 * @param {JSON} gameDataJson Game data represented in JSON 
 */
const parseGameData = (gameDataJson) => {
  if (!(gameDataJson && gameDataJson.dates)) {
    console.log('No data for game date');
    return;
  }

  return gameDataJson.dates
    .reduce((acc, cur) => acc
      .concat(cur.games
        .map(g => {
          const photoCuts = _.get(g, 'content.editorial.recap.mlb.photo.cuts', []);
          const largeImage = photoCuts.find(f => f.width === IMAGE.width && f.height === IMAGE.height);
          const away = _.get(g, 'teams.away', {name: 'Away Team'});
          const home = _.get(g, 'teams.home', {name: 'Home Team'});
                  
          return ({
            gameDate: g.gameDate,
            away: { name: away.team.name, score: away.score },
            home: { name: home.team.name, score: home.score },
            venue: g.venue || {},
            imgLarge: largeImage ? largeImage.src : DEFAULT_IMG,
            status: g.status || {},
          })
        })
      ), []);
}

/**
 * Create the element used in the game list
 * @param {JSON} game JSON game data 
 * @param {Number} idSuffix value appended to element id
 */
const createGameDiv = (game, idSuffix) => {
  const gameDiv = document.createElement('div');

  // heading
  const hSize = 'h3';
  const heading = document.createElement('hgroup');
  
  const homeTeam = document.createElement(hSize);
  homeTeam.append(game.home.name);
  heading.appendChild(homeTeam);
  
  const vs = document.createElement(hSize);
  vs.append('vs');
  heading.appendChild(vs);
  
  const awayTeam = document.createElement(hSize);
  awayTeam.append(game.away.name);
  heading.appendChild(awayTeam);
  
  heading.setAttribute('class', 'heading');
  heading.setAttribute('id', `heading-${idSuffix}`);
  gameDiv.appendChild(heading);

  // image
  const teamImage = new Image();
  teamImage.setAttribute('src', game.imgLarge);
  teamImage.setAttribute('alt', 'game image');
  teamImage.setAttribute('class', 'img-team');
  teamImage.setAttribute('id', `team-img-${idSuffix}`);
  gameDiv.appendChild(teamImage);

  // summary
  const summary = document.createElement('span');
  summary.setAttribute('class', 'summary');
  summary.setAttribute('id', `summary-${idSuffix}`);
  
  const date = new Date(game.gameDate);
  const dateString = game.gameDate ? date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const timeString = game.gameDate ? date.toLocaleTimeString() : '';

  const playDate = document.createElement('p');
  playDate.append(`${dateString} ${timeString}`);
  summary.appendChild(playDate);
  const venue = document.createElement('p');
  venue.append(game.venue.name);
  summary.appendChild(venue);

  if (game.status.statusCode === 'F') {
    const homeScore = document.createElement('p');
    homeScore.append(`${game.home.name}: ${game.home.score}`);
    summary.appendChild(homeScore);
    const awayScore = document.createElement('p');
    awayScore.append(`${game.away.name}: ${game.away.score}`);
    summary.appendChild(awayScore);
  }
  gameDiv.appendChild(summary);

  return gameDiv;
}

/**
 * Populates the game list
 */
const loadGameList = () => {
  // quick way to clear child elements
  gameListEl.textContent = '';
  
  for (let i = 0; i < gameData.length; i++) {
    gameListEl.appendChild(createGameDiv(gameData[i], i));
  }
}

/**
 * Moves list elements to the right or left
 * @param {String} direction string value of 'right' or 'left'
 */
const rotateList = (direction) => {
  if (direction === 'left') {
    // remove last element and insert it as the head
    gameListEl.insertBefore(gameListEl.lastChild, gameListEl.firstChild);
  } else {
    // remove head and append to tail
    gameListEl.appendChild(gameListEl.firstChild);
  }
}

/**
 * Key Press event handler
 * @param {Event} event triggered by key press
 */
const handleKeyPress = (event) => {
  switch (event.code) {
    case 'ArrowLeft':
      rotateList('left');
      updateFocus();
      break;
    case 'ArrowRight':
      rotateList('right');
      updateFocus();
      break;
    case 'ArrowUp':
      playDate.setDate(playDate.getDate() + 1);
      loadGameDataForDate(playDate.toISOString());
      break;
    case 'ArrowDown':
      playDate.setDate(playDate.getDate() - 1);
      loadGameDataForDate(playDate.toISOString());
      break;
  }
  
}

/**
 * Initialize event handling
 */
const addEventHandling = () => {
  document.addEventListener('keydown', handleKeyPress);
  window.addEventListener('resize', updateFocus);
}

/**
 * Set the center list item as the 'focus' element
 */
const updateFocus = () => {
  if (gameListEl.childElementCount < 1) {
    return;
  }
  // remove focus
  const focused = document.querySelector('div.focus');
  if (focused) {
    focused.removeAttribute('class');
  }
  // assign focus
  const imgWidth = gameListEl.children[0].offsetWidth || 1;
  const containerWidth = gameListEl.offsetWidth;
  let visibleElements = Math.floor(containerWidth / imgWidth);

  // I think it looks better on the left side for an even number of elements
  // if (visibleElements && visibleElements % 2 === 0) {
  //   --visibleElements;
  // }
  const center = Math.floor(visibleElements / 2);
  gameListEl.children[center].setAttribute('class', 'focus');
}

/**
 * Entry point for creating the game list
 * 
 * @param {string} date Date as a string, to get game data for
 */
const loadGameDataForDate = async (inDate) => {
  const urlParams = new URLSearchParams(window.location.search);
  // inDate is first in priority, then url provided date, finally default to today if date not supplied
  const dateString = inDate || urlParams.get('gameDate');
  playDate = Date.parse(dateString) ? new Date(dateString) : new Date();
  try {
    const gameDateJson = await fetchJson(playDate);
    gameData = parseGameData(gameDateJson);

  } catch (error) {
    console.log('Loading error: ', error.message);
  }

  loadGameList();
  updateFocus();
}