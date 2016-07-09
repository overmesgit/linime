package game

import (
	"encoding/json"
	"fmt"
	"gopkg.in/mgo.v2"
	"html/template"
	"io/ioutil"
	"net/http"
)

type ErrorMessage struct {
	Message string
}

func (e ErrorMessage) AsJson() []byte {
	data, _ := json.Marshal(e)
	return data
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	homeTempl := template.Must(template.ParseFiles("templates/home.html"))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	homeTempl.Execute(w, r.Host)
}

type MoveMessage struct {
	Char GameCharPosition
	Row  int
	Col  int
}

type MoveResponse struct {
	Path      [][2]int
	Completed [][2]int
	//NewItems     []GameCharPosition
	//CompletedNew [][2]int
	//GameScore    string
}

func serveGame(w http.ResponseWriter, r *http.Request) {
	getParams := r.URL.Query()
	gameUUID := getParams.Get("gameId")
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if gameUUID != "" {
		game, err := GetGame(gameUUID)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write(ErrorMessage{err.Error()}.AsJson())
		}
		switch r.Method {
		case "GET":
			w.Write(game.AsJson())
		case "PUT":
			body, err := ioutil.ReadAll(r.Body)
			if err != nil {
				panic(err)
			}
			defer r.Body.Close()
			action := getParams.Get("action")
			switch action {
			case "move":
				var message MoveMessage
				err := json.Unmarshal(body, &message)
				if err != nil {
					panic(err)
				}
				path, err := game.MoveCharacter(message.Char, message.Row, message.Col)
				if err != nil {
					w.WriteHeader(http.StatusNotFound)
					w.Write(ErrorMessage{err.Error()}.AsJson())
				} else {
					completed := game.CheckCompleted()
					//newChars := game.CreateNewChars()
					//completedNew := game.CheckCompleted()
					//w.Write(MoveResponse{path, completed, newChars, completedNew})
					jsonResp, err := json.Marshal(MoveResponse{path, completed})
					if err != nil {
						panic(err)
					}
					w.Write(jsonResp)
				}
			}
		}
	} else {
		if r.Method == "POST" {
			game := CreateNewGame()
			game.Save()
			w.Write(game.AsJson())
		}
	}
}

var mongoSession *mgo.Session
var mongoDB *mgo.Database

func StartServer() {
	var err error
	mongoSession, err = mgo.Dial("127.0.0.1")
	if err != nil {
		panic(err)
	}
	defer mongoSession.Close()
	mongoDB = mongoSession.DB("mal")

	fmt.Println("start")

	char_fs := http.FileServer(http.Dir("/home/overmes/PycharmProjects/maspy/char_images"))
	http.Handle("/static/char/", http.StripPrefix("/static/char/", char_fs))

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/game", serveGame)
	http.HandleFunc("/", serveHome)

	err = http.ListenAndServe("127.0.0.1:7105", nil)
	if err != nil {
		panic(err)
	}
	fmt.Println("stop")
}
