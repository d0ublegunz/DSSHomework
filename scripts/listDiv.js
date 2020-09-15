/**
 * Create the element used in the game list
 * @param {JSON} game JSON game data 
 * @param {Number} idSuffix value appended to element id
 */
const createGameDiv = (game, idSuffix) => {
  const gameDiv = document.createElement('div');
  gameDiv.setAttribute('id', idSuffix.toString());

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
  teamImage.setAttribute('src', game.imgTeam);
  teamImage.setAttribute('alt', 'game image');
  teamImage.setAttribute('class', 'img-team');
  teamImage.setAttribute('id', `team-img-${idSuffix}`);
  gameDiv.appendChild(teamImage);

  // summary
  const summary = document.createElement('span');
  summary.setAttribute('class', 'summary');
  summary.setAttribute('id', `summary-${idSuffix}`);
  const { dateString, timeString } = CreateDisplayDate(game.gameDate);


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