const ANILIST_URL = 'https://graphql.anilist.co'
const START_DATE = 20220101
const END_DATE = 20221231
const NO_GENRE = 'No Genre'
const AWARDS_YEAR = 2022
const ANIME_FORMAT_COL = 1
const MOVIE_FORMAT_COL = 2
const SHORT_FORMAT_COL = 3
const SHORT_SERIES_COL = 4
const UNKNOWN_FORMAT_COL = 5

function updateGenreSheet() {

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
          .setValue(getTitle(anime[i]))
        genreCounts[NO_GENRE] += 1
        continue
      }
      for (j = 0; j < anime[i].genres.length; j++) {
        sheet.getRange(genreCounts[anime[i].genres[j]] + 2, genreColDict[anime[i].genres[j]])
          .setValue(getTitle(anime[i]))
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
        episodes
        duration
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

function updateFormatSheet() {

  // Spreadsheet stuff
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();

  sheet.getRange(1, ANIME_FORMAT_COL).setValue("TV Anime")
  sheet.getRange(1, MOVIE_FORMAT_COL).setValue("Movie")
  sheet.getRange(1, SHORT_FORMAT_COL).setValue("Short")
  sheet.getRange(1, SHORT_SERIES_COL).setValue("Short Series")
  sheet.getRange(1, UNKNOWN_FORMAT_COL).setValue("Uncategorized")

  var formatCounts = {}
  for (i = 0; i < UNKNOWN_FORMAT_COL; i++) {
    formatCounts[i + 1] = 0 
  }

  var page = 1;
  while (true) {
    var anime = fetchAllAnime(AWARDS_YEAR, page++)
    if (anime.length == 0) break

    for (i = 0; i < anime.length; i++) {
      if (anime[i].episodes != null && anime[i].duration != null) {
        if (anime[i].episodes == 1) {
          if (anime[i].duration <= 40) {
            sheet.getRange(formatCounts[SHORT_FORMAT_COL] + 2, SHORT_FORMAT_COL).setValue(getTitle(anime[i]))
            formatCounts[SHORT_FORMAT_COL] += 1
          }
          else {
            sheet.getRange(formatCounts[MOVIE_FORMAT_COL] + 2, MOVIE_FORMAT_COL).setValue(getTitle(anime[i]))
            formatCounts[MOVIE_FORMAT_COL] += 1
          }
        }
        else {
          if (anime[i].duration <= 15) {
            sheet.getRange(formatCounts[SHORT_SERIES_COL] + 2, SHORT_SERIES_COL).setValue(getTitle(anime[i]))
            formatCounts[SHORT_SERIES_COL] += 1
          }
          else {
            sheet.getRange(formatCounts[ANIME_FORMAT_COL] + 2, ANIME_FORMAT_COL).setValue(getTitle(anime[i]))
            formatCounts[ANIME_FORMAT_COL] += 1
          }
        }
      }
      else {
        sheet.getRange(formatCounts[UNKNOWN_FORMAT_COL] + 2, UNKNOWN_FORMAT_COL).setValue(getTitle(anime[i]))
        formatCounts[UNKNOWN_FORMAT_COL] += 1
      }
    }
  }
}

function getTitle(anime) {
  if (anime.title.english != null) {
    return anime.title.english
  }
  else {
    return anime.title.romaji
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('Genre')
    .addItem('Update genre sheet', 'updateGenreSheet')
    .addItem('Update format sheet', 'updateFormatSheet')
    .addToUi()
}
