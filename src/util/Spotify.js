let accessToken;
let expires_in = '';
//const REDIRECT_URI = 'http://localhost:3000/';
const REDIRECT_URI = 'http://onyekam.surge.sh';
const CLIENT_ID = 'bdc709ec022e406781719531fa4a9b12';
const spotifyUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${REDIRECT_URI}`;
const windowUrl = window.location.href;
const existingToken = windowUrl.match(/access_token=([^&]*)/);
const existingExpiry = windowUrl.match(/expires_in=([^&]*)/);
const Spotify = {
    getAccessToken(){
        if (accessToken) {
            return accessToken;
        } else if (existingToken && existingExpiry) {
            accessToken = existingToken[1];
            expires_in = existingExpiry[1];
            window.setTimeout(() => accessToken = null, expires_in * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            window.location = spotifyUrl;
        }
    },
    search(term) {
        this.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&limit=20&q=${term}`, {
            
                headers: { Authorization: `Bearer ${accessToken}` }
            
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Request Failed!');
        }, networkError => console.log(networkError))
        .then(jsonResponse => {
            if (jsonResponse.tracks) {
                return jsonResponse.tracks.items.map(track => {
                    return {
                        id: track.id,
                        name: track.name,
                        uri: track.uri,
                        artist: track.artists[0].name,
                        album: track.album.name
                    }
                });
            } else {
                return [];
            }
        });
    },
    savePlaylist(playlistName, trackURIS){
        this.getAccessToken();
        let currentAccessToken = '';
        let headers = { Authorization: `Bearer ${accessToken}` };
        let userId;
        let playlistID;
        
        return fetch(`https://api.spotify.com/v1/me`, {

            headers: headers

        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (jsonResponse.id) {
                userId = jsonResponse.id;
                return userId;
            }
            }).then(() => { return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({
                    "name": playlistName
                })
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request failed!');
            }, networkError => {
                console.log(networkError.message)
            })
            .then(jsonResponse => {
                playlistID = jsonResponse.id
            })})   
            .then(() => { return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({
                        uris: trackURIS
                    })
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Request failed!');
                }, networkError => {
                    console.log(networkError.message)
                }).then(jsonResponse => {
                    playlistID = jsonResponse.id
                })})
    }
};
export default Spotify;