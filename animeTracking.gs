function updateSheet() {
  
  // Spreadsheet stuff
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  var userName = sheet.getRange(1,1).getValue();
  var awardsAnimeList = sheet.getRange(2,1,100,1).getValues();

  var i = 0;
  for (i; i < awardsAnimeList.length; i++) {
    if (sheet.getRange(i + 2, 1).isBlank()) continue;
    var anime = fetchAnimeData(awardsAnimeList[i][0], userName);
    var jsonResult = JSON.parse(anime.getContentText());
    var mediaList = jsonResult.data.MediaList;
    sheet.getRange(i + 2, 2).setValue(mediaList.media.title.romaji);
    sheet.getRange(i + 2, 3).setValue(mediaList.media.title.english);
    sheet.getRange(i + 2, 4).setValue(mediaList.progress);
    sheet.getRange(i + 2, 5).setValue(mediaList.media.episodes);
    sheet.getRange(i + 2, 6).setValue(mediaList.media.duration);
  }
}

function fetchAnimeData(animeId, userName) {
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
  var userId = jsonResult.data.MediaList.userId;

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
