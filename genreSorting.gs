const ANILIST_URL = 'https://graphql.anilist.co'
const START_DATE = 20220101
const END_DATE = 20221231
const NO_GENRE = 'No Genre'

function updateSheet() {

  // Spreadsheet stuff
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  // Populate Genre List
  var genres = getAllGenres()
  var genreColDict = {}
  var genreCounts = {}
  var i = 0;
  for (i; i < genres.length; i++) {
    sheet.getRange(1, i + 1).setValue(genres[i])
    genreColDict[genres[i]] = i + 1
    genreCounts[genres[i]] = 0
  }

  sheet.getRange(1, i + 1).setValue(NO_GENRE)
  genreColDict[NO_GENRE] = i + 1
  genreCounts[NO_GENRE] = 0

  var page = 1;
  while (true) {
    var anime = fetchAllAnime(2022, page++)
    if (anime.length == 0) break

    for (i = 0; i < anime.length; i++) {
      var j = 0;
      if (anime[i].genres.length == 0) {
        sheet.getRange(genreCounts[NO_GENRE] + 2, genreColDict[NO_GENRE])
          .setValue(anime[i].title.english)
        genreCounts[anime[i].genres[j]] += 1
        continue
      }
      for (j = 0; j < anime[i].genres.length; j++) {
        sheet.getRange(genreCounts[anime[i].genres[j]] + 2, genreColDict[anime[i].genres[j]] + 1)
          .setValue(anime[i].title.english)
        genreCounts[anime[i].genres[j]] += 1
      }
    }
  }
}

function getAllGenres() {
  var query = `{
    GenreCollection
  }`

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query
    })
  }

  var result = UrlFetchApp.fetch(ANILIST_URL, options)
  var jsonResult = JSON.parse(result.getContentText())
  return jsonResult.data.GenreCollection
}

function fetchAllAnime(year, page) {
  var query = `query ($endDateLast: FuzzyDateInt, $endDateFirst: FuzzyDateInt, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
      media (endDate_lesser: $endDateLast, endDate_greater: $endDateFirst, type: ANIME, countryOfOrigin: "JP") {
        id
        title {
          romaji
          english
        }
        genres
      }
    }
  }`

  // Define our query variables and values that will be used in the query request
  var variables = {
    endDateLast: END_DATE,
    endDateFirst: START_DATE,
    page: page,
    perPage: 50
  }

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    payload: JSON.stringify({
      query: query,
      variables: variables
    })
  }

  var result = UrlFetchApp.fetch(ANILIST_URL, options)
  var jsonResult = JSON.parse(result.getContentText())
  return jsonResult.data.Page.media
}

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('Genre')
    .addItem('Update sheet', 'updateSheet')
    .addToUi()
}
