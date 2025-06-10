console.log('PulseTune:JavaScripts')
let currentSong = new Audio()
let currentSongIndex = 0;
let currentPlaylist
async function getSongs(playlist) {
    let a = await fetch(`http://127.0.0.1:3000/songs/${playlist}`);

    let response = await a.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchorTags = div.getElementsByTagName('a')


    let songs = []
    for (let index = 0; index < anchorTags.length; index++) {
        const element = anchorTags[index];
        if (element.href.endsWith('mp3')) {
            songs.push(element.innerText)
        }
    }
    return songs;

}

const playMuisc = (muisc, playlist, pause = false) => {
    currentSong.src = `songs/${playlist}/${muisc}.mp3`
    if (!pause) {
        currentSong.play()
        play.src = "img/pausebutton.svg";

    }

    document.querySelector(".songInfo").innerHTML = `<img src="img/musicbar.svg" alt="musicbar"><p>${muisc}</p>`
    

}

function convertToMinutesAndSeconds(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (`${minutes}:${seconds.toString().padStart(2, '0')}` == "NaN:NaN") return "00:00";
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


// get playlist
async function getPlaylist() {
    let p = await fetch('http://127.0.0.1:3000/songs/')

    let response = await p.text();

    let div = document.createElement('div');
    div.innerHTML = response;

    let anchorTags = div.getElementsByTagName('a')

    let playlist = []
    for (let index = 1; index < anchorTags.length; index++) {
        const element = anchorTags[index];
        if (element.href.includes("/songs")) {
            // get meta data of each playlist 
            let metadata = await fetch(`http://127.0.0.1:3000/songs/${element.innerText}/playlistInfo.json`)
            let m = await metadata.json()
            playlist.push(m)


        }
    }
    return playlist;

}


async function main() {
    let AllPlaylists = await getPlaylist()

    // display playlist
    let cardContainer = document.querySelector(".cardContainer")
    for (const playlist of AllPlaylists) {

        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-playlist="${playlist.title}" class="card     bg-grey-3 rounded">
                                                                <img src="songs/${playlist.title}/cover.png" alt="playlist1">
                                                                <img class="playbtn" src="img/playbutton.svg" alt="playbutton">
                                                                <h4>${playlist.title}</h4>
                                                                <p>${playlist.tagline}</p>
                                                            </div>`
    }

    // add event listener to each playlist
    document.querySelectorAll(".card").forEach(item => {
        item.addEventListener("click", async () => {
            currentPlaylist = item.dataset.playlist;
            globalThis.Allsongs = await getSongs(item.dataset.playlist)
            let songUl = document.querySelector('.songlist').getElementsByTagName('ul')[0]
            songUl.innerHTML = ""
            for (const song of Allsongs) {
                songUl.innerHTML = songUl.innerHTML + `<li class = "bg-grey-3 rounded"><img class="invert" src="img/music.svg" alt="music">
                                                             <div class = "songTitle">
                                                              <p>${song.split(".mp3")[0]}</p>
                                                              </div>
                                                             <img src="img/playbutton.svg" alt="playbutton"  >
                                                         </li>`
            }
            Array.from(document.querySelector('.songlist').getElementsByTagName('li')).forEach((e, i) => {
                e.addEventListener("click", () => {
                    playMuisc(e.innerText, currentPlaylist)
                    currentSongIndex = i
                    
                })
            })
            document.querySelector(".left").style.left = "0"

        })
    });


    play.addEventListener("click", (e) => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pausebutton.svg";
        }
        else {
            currentSong.pause()
            play.src = "img/playbutton.svg"
        }
    
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerText = convertToMinutesAndSeconds(currentSong.currentTime) + " / " + convertToMinutesAndSeconds(currentSong.duration)
        document.querySelector(".bar").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".bar").style.width = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;

    })

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    document.querySelector(".previousbtn").addEventListener("click", () => {
        if (currentSongIndex <= 0) {
            currentSongIndex = Allsongs.length;

        }
        currentSongIndex--;
        playMuisc(Allsongs[currentSongIndex].split(".mp3")[0], currentPlaylist)

    })

    document.querySelector(".nextbtn").addEventListener("click", () => {
        if (currentSongIndex >= Allsongs.length - 1) {
            currentSongIndex = -1;

        }
        currentSongIndex++;
        playMuisc(Allsongs[currentSongIndex].split(".mp3")[0], currentPlaylist)

    })

    volume.addEventListener("input", (e) => {
        currentSong.volume = volume.value
    })


    document.querySelector('.volume > img').addEventListener('click', (e) => {
        if (e.target.src.includes('volume')) {
            e.target.src = "img/mute.svg"
            volume.value = 0

        }
        else {
            e.target.src = 'img/volume.svg'
            volume.value = 1
        }
        currentSong.volume = volume.value
    })



}
main()