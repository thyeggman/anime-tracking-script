# Anime tracking script
Just a script to help jurors in the /r/anime awards track what they need to catch up on.

## Instructions

### Prepare your anilist account

1. Create a new sheet in google sheets
1. Go to tools -> script editor
1. Paste in the script from this repo
1. Select the "onOpen" funtion from the dropdown and run it
1. Approve your account to run the script and get access to sheets (this API does not need authentication so it's completely safe)
1. Go back to your spreadsheet - you should now have an "anime" menu button at the top
1. Enter your Anilist user id in A1
1. Add every anime you want to track to your anilist (planning is fine)
1. Enter the anime IDs you want to track in column 1 below your user ID
1. Use Anime -> Update sheet
