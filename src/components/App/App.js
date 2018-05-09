import React, { Component } from 'react';
import './App.css';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import SearchBar from '../SearchBar/SearchBar';
import Spotify from '../../util/Spotify';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
        this.state = {
            playlistName: 'My PlayList',
            playlistTracks: [],
            searchResults: []
        };

    }
    removeTrack(track) {
        console.log(track);
        if (this.state.playlistTracks.find(removedTrack => removedTrack.id === track.id)) {
            this.setState({
                playlistTracks: this.state.playlistTracks.filter(removedTrack => {
                    return removedTrack.id !== track.id
                })
            });
        } else {
            return;
        }
    }
    addTrack(track) {

        if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
            return;
        } else {
            this.setState(previousState => ({
                playlistTracks: [...previousState.playlistTracks, {
                    name: track.name,
                    artist: track.artist,
                    album: track.album,
                    id: track.id,
                    uri: track.uri
                }]
            }));
        }
    }
    updatePlaylistName(name) {
        this.setState({
            playlistName: name
        })
    }
    savePlaylist() {
        const trackURIs = [];
        this.state.playlistTracks.map(track => {
            trackURIs.push(track.uri);
        })
        Spotify.savePlaylist(this.state.playlistName, trackURIs);
    }
    search(term){
        Spotify.search(term).then(tracks => {
            this.setState({ searchResults: tracks });
        });
    }

    render() {
        return (
            <div>
                <h1>Ja<span className="highlight">mmm</span>ing</h1>
                <div className="App">
                    <SearchBar onSearch={this.search} />
                    <div className="App-playlist">
                        <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
                        <Playlist onSave={this.savePlaylist} onNameChange={this.updatePlaylistName} playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} />
                    </div>
                </div>
            </div>
        );
    }
}

export default App;