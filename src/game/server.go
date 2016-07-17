package game

import (
	"encoding/json"
	"fmt"
	"gopkg.in/mgo.v2"
	"html/template"
	"net/http"
)

type Message struct {
	Message string
}

func (e Message) AsJson() []byte {
	data, _ := json.Marshal(e)
	return data
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	templateName := "prod.html"
	//if strings.Contains(r.URL.Path, "/test") {
	//	templateName = "test.html"
	//}
	homeTempl := template.Must(template.ParseFiles("templates/" + templateName))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	homeTempl.Execute(w, r.Host)
}

type MoveMessage struct {
	Char GameCharPosition
	Row  int
	Col  int
}

type CreateGameParam struct {
	CharDiff  int
	AnimeDiff int
	UserName  string
}

func serveGame(w http.ResponseWriter, r *http.Request) {
	getParams := r.URL.Query()
	gameUUID := getParams.Get("gameId")
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if gameUUID != "" {
		game, err := GetGame(gameUUID)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Write(Message{err.Error()}.AsJson())
			return
		}
		switch r.Method {
		case "GET":
			body, err := game.AsJson()
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write(Message{err.Error()}.AsJson())
			} else {
				w.Write(body)
			}
		case "PUT":
			action := getParams.Get("action")
			switch action {
			case "move":
				var message MoveMessage
				err := json.NewDecoder(r.Body).Decode(&message)
				defer r.Body.Close()
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write(Message{err.Error()}.AsJson())
					return
				}
				resp, err := game.MakeTurn(message.Char, message.Row, message.Col)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write(Message{err.Error()}.AsJson())
					return
				}
				jsonResp, err := json.Marshal(resp)
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write(Message{err.Error()}.AsJson())
					return
				}
				w.Write(jsonResp)
			case "complete":
				game.CompleteCountTotalScore()
				err = game.Update()
				if err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write(Message{err.Error()}.AsJson())
					return
				}
				w.Write(Message{"ok"}.AsJson())
			}
		}
	} else {
		var gameParam CreateGameParam
		err := json.NewDecoder(r.Body).Decode(&gameParam)
		defer r.Body.Close()
		if err != nil {
			panic(err)
		}
		if r.Method == "POST" {
			game, err := CreateNewGame(gameParam)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write(Message{err.Error()}.AsJson())
				return
			}
			err = game.Save()
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write(Message{err.Error()}.AsJson())
				return
			}
			body, err := game.AsJson()
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				w.Write(Message{err.Error()}.AsJson())
				return
			}
			w.Write(body)
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

	err = http.ListenAndServe(":1502", nil)
	if err != nil {
		panic(err)
	}
	fmt.Println("stop")
}
