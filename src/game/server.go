package game

import (
	"encoding/json"
	"fmt"
	"gopkg.in/mgo.v2"
	"html/template"
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

func serveGame(w http.ResponseWriter, r *http.Request) {
	getParams := r.URL.Query()
	gameUUID := getParams.Get("gameId")
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if gameUUID != "" {
		if r.Method == "GET" {
			game, err := GetGame(gameUUID)
			if err != nil {
				w.WriteHeader(http.StatusNotFound)
				w.Write(ErrorMessage{err.Error()}.AsJson())
			} else {
				w.Write(game.AsJson())
			}
		} else {
			//action
			//MakeAction(action)
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
