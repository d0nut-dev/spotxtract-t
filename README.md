# spotxtract-t

### Description:
_**tl;dr: Spotify migration helper or 'zspotify' and 'spotify_folders' wrapper.**_

Creates folders and downloads all your spotify playlists trough [zspotify](https://github.com/jsavargas/zspotify) according to 'hierarchy.json' that was extracted with [spotify_folders](https://github.com/mikez/spotify-folders). Also downloads their covers with curl.

If you don't have any spotify folders and want to download one, or few of your playlists - consider to use [zspotify](https://github.com/jsavargas/zspotify) solely. Nevertheless, if you want to download all your playlists and their cover images - this script is for you.

Constists of two separate parts:
1. index.js - main body;
2. spotify-module.js - spotify authorisation and API interactions;

### Dependencies:

- NodeJS
- FFmpeg
- curl
- Python3
- pip
- [zspotify](https://github.com/jsavargas/zspotify)
- [spotify_folders](https://github.com/mikez/spotify-folders)

### Usage:

0. Open and login into Spotify;
1. Install NodeJS, Python, pip;
2. Clone the repo;
3. Cd into folder;
4. Create python environment(Optionally): 
   - ```python -m venv mus_env```
   - ```source mus_env/bin/activate```
5. Install required packages:
   - ```pip install zspotify```
   - ```pip install spotify_folders```
6. Get hierarchy.json: 
   - ```spotify_folders > hierarchy.json```
7. Get SpotifyAPI keys from [Sptify Dashboard](https://developer.spotify.com/dashboard);
8. Insert them into 'spotify-module.js';
9. Run: 
   - ```node index.js```
10. Enter your Spotify credentials for 'zspotify' _**(According to 'zspotify' it's better to use a burner account to avoid ban. We think so as well. Altough you still can use your main account to get API credentials);**_

#### Tips: 

- If some of your playlists hadn't been downloaded for whatever reasons, their spotify-uri will be saved to 'failed-uri'.
- After the execution creates file 'hierarchy-mod.json' that contains data from 'hierarchy.json' but with the appended playlist's names.
- Cover images are being saved to ```'playlist_name'/pl_cover.png``` .
- 'zspotify' saves the list of your downloaded songs to '~/.zspotify'.
- Also, you can freely re-run the script if you want to sync your playlists.

### Current tasks:
- Add linking;
- Add 'Yes/No', 'Download/Check All' options.
