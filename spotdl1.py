import os
import json
import spotipy
from spotipy.oauth2 import SpotifyOAuth



# Set Spotify API credentials
client_id = ''
client_secret = ''
redirect_uri = ''


os.system(f'export SPOTIPY_CLIENT_ID="{client_id}"')
os.system(f'export SPOTIPY_CLIENT_SECRET="{client_secret}"')

# Create Spotify API object
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=client_id,
                                               client_secret=client_secret,
                                               redirect_uri=redirect_uri,
                                               scope=["playlist-read-private"]))

# Create folder for playlists
playlists_folder = "playlists"
os.makedirs(playlists_folder, exist_ok=True)

# Set limit and offset
limit = 50
offset = 0
playlists = []

# Get current user's playlists
while True:
    response = sp.current_user_playlists(limit=limit, offset=offset)
    playlists += response['items']
    if response['next']:
        offset += limit
    else:
        break

# Ask user for choice
print("Choose an option:")
print("1. Download playlists using savify")
print("2. Scan and compare playlists with existing ones")
print("3. Scan and add JSON of your playlists\n")

choice = input("\n:")
if choice == "1":
    # Iterate through playlists
    for playlist in playlists:
        # Get playlist's name
        playlist_name = playlist["name"]
        # Check if a folder with the same name as the playlist already exists
        if os.path.exists(os.path.join(playlists_folder, playlist_name)):
            print(f"{playlist_name} already exists.")
        else:
            # Create folder for current playlist
            playlist_folder = os.path.join(playlists_folder, playlist_name)
            os.makedirs(playlist_folder, exist_ok=True)

            # Get playlist's Spotify URL
            playlist_url = playlist["external_urls"]["spotify"]
            # Use savify to download playlist as mp3
            os.system(f'savify -t playlist "{playlist_url}" -q best -f mp3 -o "{playlist_folder}"')
            print(f"{playlist_name} downloaded.")
elif choice == "2":
    # Iterate through playlists
    for playlist in playlists:
        # Get playlist's name
        playlist_name = playlist["name"]
        # Check if a folder with the same name as the playlist already exists
        if os.path.exists(os.path.join(playlists_folder, playlist_name)):
            print(f"{playlist_name} already exists.")
        else:
            print(f"{playlist_name} does not exist.")
            # Ask user if they want to download the missing playlist
            download = input(f"Do you want to download {playlist_name}? (y/n)")
            if download == "y":
                # Create folder for current playlist
                playlist_folder = os.path.join(playlists_folder, playlist_name)
                os.makedirs(playlist_folder, exist_ok=True)

                # Get playlist's Spotify URL
                playlist_url = playlist["external_urls"]["spotify"]
                # Use savify to download playlist as mp3
                os.system(f'savify -t playlist "{playlist_url}" -q best -f mp3 -o "{playlist_folder}"')
                print(f"{playlist_name} downloaded.")
            elif download == "n":
                print(f"{playlist_name} not downloaded.")
            else:
                print("Invalid choice.")
if choice == "3":
    # Create JSON object to store playlists and songs information
    playlists_json = {
        "playlists": []
    }
    print("\nCreating JSON object.")

    # Iterate through playlists
    for playlist in playlists:
        # Get playlist's name and tracks
        playlist_name = playlist["name"]
        tracks = sp.playlist_tracks(playlist["id"])["items"]

        # Create playlist object in JSON
        playlist_json = {
            "name": playlist_name,
            "tracks": []
        }

        # Iterate through tracks
        for track in tracks:
            track_json = {
                "name": track["track"]["name"],
                "artist": track["track"]["artists"][0]["name"],
                # "album": track["track"]["album"]["name"],
                "order": track["track"]["track_number"]
            }
            playlist_json["tracks"].append(track_json)

        # Check if the playlist already exists in the JSON object
        existing_playlist = next((x for x in playlists_json["playlists"] if x["name"] == playlist_name), None)
        if existing_playlist:
            # Iterate through existing tracks and add new tracks
            for track in playlist_json["tracks"]:
                existing_track = next((x for x in existing_playlist["tracks"] if x["name"] == track["name"]), None)
                if not existing_track:
                    existing_playlist["tracks"].append(track)
        else:
            playlists_json["playlists"].append(playlist_json)

    # Check if the JSON file already exists
    if os.path.exists("playlists.json"):
        print("File already exist.")
        print("Loading existing file.")
        
        # Load existing JSON file
        with open("playlists.json", "r") as file:
            existing_json = json.load(file)
        print("Checking the written info.")
        # Iterate through playlists and add new playlists
        for playlist in playlists_json["playlists"]:
            existing_playlist = next((x for x in existing_json["playlists"] if x["name"] == playlist["name"]), None)
            if not existing_playlist:
                existing_json["playlists"].append(playlist)
        playlists_json = existing_json

    # Write JSON object to file
    print("Writing JSON.")
    with open("playlists.json", "w") as file:
        json.dump(playlists_json, file)
    print("Finish.")
else:
    print("Invalid choice.")
