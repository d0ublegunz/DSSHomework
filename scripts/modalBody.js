/**
 * Create the body contents for the modal body
 * @param {JSON} modalJson recap JSON data
 */
const CreateModalBody = (modalJson) => {
  const bodyDiv = document.createElement('div');
  bodyDiv.setAttribute('id', 'modal-body-content');

  if (!modalJson.blurb) {
    bodyDiv.append('No recap available.');
    return bodyDiv;
  }

  // title
  const title = document.createElement('h3');
  title.append(modalJson.headline);  
  title.setAttribute('class', 'title');
  title.setAttribute('id', 'modal-body-title');
  bodyDiv.appendChild(title);

  // recap
  const recap = document.createElement('main');
  recap.setAttribute('class', 'recap');
  recap.setAttribute('id', 'modal-body-recap');
  
  const { dateString, timeString } = CreateDisplayDate(modalJson.date);
  const recapDate = document.createElement('p');
  recapDate.append(`${dateString} ${timeString}`);
  recap.appendChild(recapDate);
  const blurb = document.createElement('p');
  blurb.append(modalJson.blurb);
  recap.appendChild(blurb);

  bodyDiv.appendChild(recap);

  return bodyDiv;
}