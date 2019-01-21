let eventData;
let request = new XMLHttpRequest();
const container = document.getElementById('container');

//Description : creates & appends markup for trailer description
const videoContainer = document.createElement('div');
videoContainer.setAttribute('class', 'video-container');

const iframe = document.createElement('iframe');
iframe.setAttribute('id', 'existing-iframe');

const videoDesc = document.createElement('div');
videoDesc.setAttribute('class', 'video-description');

videoDesc.innerHTML = ` <h1 id="movie-title"></h1>
                        <p id="movie-lang"></p>
                        <div id="movie-genre"></div>
                        <p class="stats">
                          <span><i class="fas fa-thumbs-up"></i></span>
                          <span>1,275 votes </span>
                          <span><i class="fas fa-calendar-alt"></i></span>
                          <span id="calendar"></span>
                        </p>
                        <p>Description about the movie (not provided in API)</p>
                        <p><a href="#">Read More</a></p>
                        <div class="footer-icons">
                          <div>
                            <i class="fas fa-thumbs-up"></i>
                            <p>WILL WATCH</p>
                            <p>1275</p>
                          </div>
                          <div>
                            <i class="far fa-question-circle"></i>
                            <p>MAYBE</p>
                            <p>0</p>
                          </div>
                          <div>
                            <i class="fas fa-thumbs-down"></i>
                            <p>WON'T WATCH</p>
                            <p>0</p>
                          </div>
                        </div>
                        `;

videoContainer.append(iframe);
videoContainer.append(videoDesc);

//Description: returns the previous closest 'left' class element so as to insert trailer video before the leftmost element
function getPrevLeftElem(element) {
    let result = element;
    if(!element.classList.contains('left')) {
      while (element = element.previousElementSibling) {
        if(element.classList.contains('left')) {
          result = element;
          break;
        }
      }
    }
    return result;
}

//Description: This function is called on clicking poster image, it inserts the video in the body & plays it
function playTrailer(e, arg) {
  e.stopPropagation();
  const cardObj = e.target.parentNode;
  let imgObj;
  if (arg == 'play') {
    imgObj = e.target.previousSibling;
  } else {
    imgObj = e.target;
  }
  const eventId = imgObj.getAttribute('data-event-id');

  const trailer = imgObj.getAttribute('data-trailer');

  let url = new URL(trailer);
  let v = url.searchParams.get("v");
  const trailerUrl = 'https://www.youtube.com/embed/' + v + '?enablejsapi=1&autoplay=1';
  iframe.setAttribute('src', trailerUrl);

  let leftElem = getPrevLeftElem(cardObj);
  leftElem.before(videoContainer);
  populateVideoDescription(eventId);
}

//Description: populates data for each trailer-description from api response
function populateVideoDescription(eventId) {
  const movieGenreStr = eventData[eventId]['EventGenre'];
  document.getElementById('movie-genre').innerHTML = '';
  if(movieGenreStr.indexOf('|') != -1) {
    const movieGenreArr = movieGenreStr.split('|');
    movieGenreArr.forEach(function(genre) {
      let span = document.createElement('span');
      span.textContent = genre;
      document.getElementById('movie-genre').append(span);
    })
  } else {
    let span = document.createElement('span');
    span.textContent = movieGenreStr;
    document.getElementById('movie-genre').append(span);
  }

  document.getElementById('movie-title').innerHTML = eventData[eventId]['EventTitle'];
  document.getElementById('movie-lang').innerHTML = eventData[eventId]['EventLanguage'];
  document.getElementById('calendar').innerHTML = eventData[eventId]['ShowDate'];
}

//Description: This function adds class 'left' to the leftmost element of the flex-box & class 'right' to the rightmost element
// so as to insert video before the leftmost element
function addClass() {
  const leftElem = container.getElementsByClassName("left");
  if(leftElem.length) {
    for (var i = 0; i < leftElem.length; i++) {
      leftElem[i].classList.remove("left");
    }
  }
  const rightElem = container.getElementsByClassName("right");
  if(rightElem.length) {
    for (var i = 0; i < rightElem.length; i++) {
      rightElem[i].classList.remove("right");
    }
  }
  container.firstElementChild.classList.add('left');
  container.lastElementChild.classList.add('right');
  const containerWidth = container.offsetWidth;
  let totalWidth = 0;
  let children = container.childNodes;
  children.forEach(function (child) {
    if(child.nodeName == 'LI') {
      totalWidth += (child.offsetWidth + 32);
      if (totalWidth > containerWidth) {
          child.classList.add('left');
          child.previousSibling.classList.add('right');
          totalWidth = child.offsetWidth;
      }
    }
  });
}

window.addEventListener("resize", addClass);
request.open('GET', 'https://in.bookmyshow.com/serv/getData?cmd=GETTRAILERS&mtype=cs', true);
request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(this.response);
    eventData = data[1];
    for (var key in eventData) {
        if (eventData.hasOwnProperty(key)) {

            const card = document.createElement('li');
            card.setAttribute('class', 'card');
            card.setAttribute('onclick', 'playTrailer(event, "img")');

            const posterImg = document.createElement('img');
            posterImg.src = `https://in.bmscdn.com/events/moviecard/${key}.jpg`;
            posterImg.dataset.trailer = eventData[key]['TrailerURL'];
            posterImg.dataset.eventId = key;

            const playBtn = document.createElement('a');
            playBtn.setAttribute('onclick', 'playTrailer(event, "play")');

            const dateObj = document.createElement('div');
            dateObj.setAttribute('class', 'show-date');
            dateObj.innerHTML = eventData[key]['ShowDate'];

            const videoObj = document.getElementById('existing-iframe');
            container.appendChild(card);
            card.appendChild(posterImg);
            card.appendChild(playBtn);
            card.appendChild(dateObj);

        }
    }
    addClass();

  } else {
    const errorMessage = document.createElement('marquee');
    errorMessage.textContent = `Oops, Something went wrong!`;
    container.appendChild(errorMessage);
  }
}
request.send();
