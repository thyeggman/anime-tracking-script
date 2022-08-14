const USERNAME_OFFSET = 8
const ANIME_OFFSET = 2
const ANILIST_URL = 'https://graphql.anilist.co'

function updateSheet() {
  
  // Spreadsheet stuff
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Usernames start from G1 (1, 8), are 1 row and an arbitrary number of columns
  var userNames = sheet.getRange(1, USERNAME_OFFSET, 1, 100).getValues()

  // Anime start from A2 (2,1), are an arbitrary number of rows and 1 column
  var awardsAnimeList = sheet.getRange(ANIME_OFFSET, 1, 100, 1).getValues()

  var i = 0;
  for (i; i < userNames[0].length; i++) {

    // Get the user id by their username
    var userName = sheet.getRange(1, i + USERNAME_OFFSET).getValue()
    if (userName == "") {
      break
    }
    var userId = fetchUserId(userName)

    var j = 0;
    for (j; j < awardsAnimeList.length; j++) {
      if (sheet.getRange(j + ANIME_OFFSET, 1).getValue() == "") {
        break
      }
      
      var anime = fetchAnimeData(awardsAnimeList[j][0], userId)
      if (anime == null) {
        continue
      }
      var jsonResult = JSON.parse(anime.getContentText())
      var mediaList = jsonResult.data.MediaList

      // Only fetch the anime data once
      if (sheet.getRange(j + ANIME_OFFSET, 2).getValue() == "") {
        sheet.getRange(j + ANIME_OFFSET, 2).setValue(mediaList.media.title.english)
        sheet.getRange(j + ANIME_OFFSET, 6).setValue(mediaList.media.episodes)
        sheet.getRange(j + ANIME_OFFSET, 7).setValue(mediaList.media.duration)
      }
      sheet.getRange(j + ANIME_OFFSET, i + USERNAME_OFFSET).setValue(mediaList.progress)
    }
  }
}

function fetchUserId(userName) {
  var query1 = `
  {
    MediaList(userName: \"` + userName + `\") {
      id
      userId
    }
  }`


  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query1
    })
  }

  var result = UrlFetchApp.fetch(ANILIST_URL, options)
  var jsonResult = JSON.parse(result.getContentText())
  return jsonResult.data.MediaList.userId
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
    }`

  // Define our query variables and values that will be used in the query request
  var variables = {
    animeId: animeId,
    userId: userId
  }

  // Define the config we'll need for our Api request
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query2,
      variables: variables
    })
  }

  var res = null;
  try {
    res = UrlFetchApp.fetch(ANILIST_URL, options)
  }
  catch {
    return null
  }
  if (res.getResponseCode() != 200) {
    return null
  }
  return res
}

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('Anime')
      .addItem('Update sheet','updateSheet')
      .addToUi()
}
