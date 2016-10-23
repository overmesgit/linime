package game

import (
	"encoding/json"
	"fmt"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
)

type Message struct {
	Message string
}

func (e Message) AsJson() []byte {
	data, _ := json.Marshal(e)
	return data
}

var homeTemplate *template.Template

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	homeTemplate.Execute(w, r.Host)
}

type MoveMessage struct {
	Char GameCharPosition
	Row  int
	Col  int
}

type CreateGameParam struct {
	Diff     int
	UserName string
}

func serveTargetGame(gameUUID string, method string, action string, body io.ReadCloser) (int, []byte) {
	game, err := GetGame(gameUUID)
	if err != nil {
		return http.StatusNotFound, Message{Message: err.Error()}.AsJson()
	}
	switch method {
	case "GET":
		body, err := game.AsJson()
		if err != nil {
			return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
		} else {
			return http.StatusOK, body
		}
	case "PUT":
		switch action {
		case "move":
			if game.isCompleted() {
				return http.StatusInternalServerError, Message{Message: "Game completed"}.AsJson()
			}
			var message MoveMessage
			err := json.NewDecoder(body).Decode(&message)
			defer body.Close()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			resp, err := game.MakeTurn(message.Char, message.Row, message.Col)
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			err = game.Update()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			jsonResp, err := json.Marshal(resp)
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			return http.StatusOK, jsonResp
		case "changeImg":
			var message MoveMessage
			err := json.NewDecoder(body).Decode(&message)
			defer body.Close()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			changeImage, err := game.ChangeImage(message.Char)
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			err = game.Update()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			jsonResp, err := json.Marshal(changeImage)
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			return http.StatusOK, jsonResp
		case "advice":
			advice, err := game.GetAdvice()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			err = game.Update()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			jsonResp, err := json.Marshal(advice)
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			return http.StatusOK, jsonResp
		case "complete":
			if game.isCompleted() {
				return http.StatusInternalServerError, Message{Message: "Game completed"}.AsJson()
			}
			game.CompleteCountTotalScore()
			err = game.Update()
			if err != nil {
				return http.StatusInternalServerError, Message{Message: err.Error()}.AsJson()
			}
			return http.StatusOK, Message{Message: "ok"}.AsJson()
		}
	}
	return http.StatusInternalServerError, Message{Message: "action not found"}.AsJson()
}

func serveGame(w http.ResponseWriter, r *http.Request) {
	getParams := r.URL.Query()
	gameUUID := getParams.Get("gameId")
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	if gameUUID != "" {
		status, resp := serveTargetGame(gameUUID, r.Method, getParams.Get("action"), r.Body)
		w.WriteHeader(status)
		w.Write(resp)
	} else {
		var gameParam CreateGameParam
		err := json.NewDecoder(r.Body).Decode(&gameParam)
		defer r.Body.Close()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write(Message{err.Error()}.AsJson())
			return
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
				w.Write(Message{fmt.Sprintf("error: save game %v", err.Error())}.AsJson())
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

var gormDB *gorm.DB
var logger *log.Logger

func StartServer(port, pgSettings string) {
	logger = log.New(os.Stdout, "logger: ", log.Lshortfile)

	var err error
	gormDB, err = gorm.Open("postgres", pgSettings)
	if err != nil {
		panic("failed to connect database")
	}
	defer gormDB.Close()

	gormDB.AutoMigrate(&GameModel{})

	logger.Println("start")

	homeTemplate = template.Must(template.ParseFiles("templates/prod.html"))

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/game", serveGame)
	http.HandleFunc("/", serveHome)

	err = http.ListenAndServe(":"+port, nil)
	if err != nil {
		panic(err)
	}
	logger.Println("stop")
}
