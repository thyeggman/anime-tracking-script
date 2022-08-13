const var USERNAME_OFFSET = 8;
const var ANIME_OFFSET = 2

function updateSheet() {
  
  // Spreadsheet stuff
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Usernames start from G1 (1, 8), are 1 row and an arbitrary number of columns
  var userNames = sheet.getRange(1, USERNAME_OFFSET, 1, 100).getValues();

  // Anime start from A2 (2,1), are an arbitrary number of rows and 1 column
  var awardsAnimeList = sheet.getRange(ANIME_OFFSET, 1, 100, 1).getValues();

  var i = 0;
  var j = 0;
  for (i; i < userNames.length; i++) {

    // Get the user id by their username
    var userName = sheet.getRange(1, i + USERNAME_OFFSET)
    if (userName.isBlank()) continue;
    var userId = fetchUserId(userName)

    var numAnime = 0;
    for (j; j < awardsAnimeList.length; j++) {
      if (sheet.getRange(j + ANIME_OFFSET, 1).isBlank()) {
        break;
      }
      
      var anime = fetchAnimeData(awardsAnimeList[j][0], userId);
      var jsonResult = JSON.parse(anime.getContentText());
      var mediaList = jsonResult.data.MediaList;
      sheet.getRange(j + ANIME_OFFSET, 2).setValue(mediaList.media.title.english);
      sheet.getRange(j + ANIME_OFFSET, 6).setValue(mediaList.media.episodes);
      sheet.getRange(j + ANIME_OFFSET, 7).setValue(mediaList.media.duration);
      sheet.getRange(j + ANIME_OFFSET, i + USERNAME_OFFSET).setValue(mediaList.progress);
    }
  }
}

function fetchUserId(username) {
  var query1 = `
  {
    MediaList(userName: \"` + userName + `\") {
      id
      userId
    }
  }`;

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query1,
      variables: variables
    })
  };

  var url = 'https://graphql.anilist.co';
  var result = UrlFetchApp.fetch(url, options);
  var jsonResult = JSON.parse(result.getContentText());
  return jsonResult.data.MediaList.userId;
}

function fetchAnimeData(animeId, userId) {
  // Here we define our query as a multi-line string
  // Storing it in a separate .graphql/.gql file is also possible
  var query2 = `
    query ($animeId: Int, $userId: Int) {
      MediaList(userId: $userId, mediaId: $animeId) {
        id
        media {
          id
          title {
            romaji
            english
          }
          duration
          episodes
        }
        progress
      }
    }`;

  // Define our query variables and values that will be used in the query request
  var variables = {
    animeId: animeId,
    userId: userId
  };

  // Define the config we'll need for our Api request
  options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query2,
      variables: variables
    })
  };

  return UrlFetchApp.fetch(url, options);
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Anime')
      .addItem('Update sheet','updateSheet')
      .addToUi();
}
