package main

import (
	"fmt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
	"mal/parser"
)

func main() {
	mongoSession, err := mgo.Dial("127.0.0.1")
	if err != nil {
		panic(err)
	}
	defer mongoSession.Close()
	mongoDB := mongoSession.DB("mal")
	anime := mongoDB.C("anime")
	exists := bson.M{"$exists": true}
	var titles []parser.Title
	var currentGroups []int
	animeLimit := 100
	err = anime.Find(bson.M{"characters.2": exists, "group": bson.M{"$nin": currentGroups}}).Sort("-members").Limit(animeLimit).All(&titles)

	if err != nil {
		panic(err)
	}
	fmt.Println(titles)
	fmt.Println(len(titles))
}
