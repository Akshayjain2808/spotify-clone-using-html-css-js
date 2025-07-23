console.log("Let's start JS");
let currentSong = new Audio();
let songs;
let currentFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a") //all anchor tags

    songs = [];
    for (let index = 0; index < as.length; index++) { //as.length -> all anchor tags basically inside HTML collection
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
            //this will split the href in two parts by split and give array so [1] <- we took after part of /songs/
            //http://127.0.0.1:3000/songs/Chahun%20Main%20Ya%20Naa%20-%20(Raag.Fm).mp3 
            // by split("/songs/") 
            // [http://127.0.0.1:3000, Chahun%20Main%20Ya%20Naa%20-%20(Raag.Fm).mp3]
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="icons/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Shraddha</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="icons/play.svg" alt="">
                            </div> </li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    //  let audio = new Audio("/songs/" + track);
    // console.log("track : ", track)
    // let play = document.querySelector("#play");
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="49.9" height="49.9">
                                <!-- Green filled circle -->
                                <circle cx="12" cy="12" r="10" fill="#1fdf64" />

                                <!-- Black filled play shape -->
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="black" />
                            </svg>
                        </div>

                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //load the playList whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            // play the first song in the new folder (paused initially)
            playMusic(songs[0])
        });
    });

    // console.log(anchors)
}

async function main() {
    // let play = document.querySelector("#play");
    await getSongs("songs/cs") //if you use await then you get resolved value(which is array in this case) otherwise you will get a promise
    // console.log(songs)
    playMusic(songs[0], true)

    //Display all the albums on the page
    await displayAlbums();


    //Attach an event listener to previous, play and next
    
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "icons/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "icons/play.svg";
        }
    })

    //listen for time update event -> time update ho rha hai gaane ka
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbaar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width ,e.offsetX);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //add event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listener to previous and next
    document.querySelector("#previous").addEventListener("click", () => {
        // console.log("previous clicked")
        currentSong.pause();
        let presentSong = currentSong.src.split(`/${currentFolder}/`)[1]
        console.log(presentSong);
        // console.log(presentSong);
        let idx = songs.indexOf(presentSong)
        // console.log(idx);
        console.log(songs);
        // console.log(idx)
        if (idx - 1 >= 0) {
            playMusic(songs[idx - 1])
        }
    })

    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause();
        let presentSong = currentSong.src.split(`/${currentFolder}/`)[1]
        // console.log(presentSong);
        let idx = songs.indexOf(presentSong)
        // console.log(idx)
        if (idx + 1 < songs.length) {
            playMusic(songs[idx + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to :", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("icons/mute.svg", "icons/volume.svg");
        }
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        // console.log(e.target);
        if (e.target.src.includes("icons/volume.svg")) {
            e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()