# Anime tracking script
Just a script to help jurors in the /r/anime awards track what they need to catch up on.

## Instructions

1. Create a new sheet in google sheets
2. Go to tools -> script editor
3. Paste in the script from this repo
4. Select the "onOpen" funtion from the dropdown and run it
5. Approve your account to run the script and get access to sheets (this API does not need authentication so it's completely safe)
6. Go back to your spreadsheet - you should now have an "anime" menu button at the top
8. Enter your anilist username in A1 on your spreadsheet
9. Add every anime you want to track to your anilist (planning is fine)
10. Enter the anime IDs you want to track in column 1 below your user ID
11. Use Anime -> Update sheet
