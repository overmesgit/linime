package main

import (
	"fmt"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func main() {
	mongoSession, err := mgo.Dial("127.0.0.1")
	if err != nil {
		panic(err)
	}
	defer mongoSession.Close()
	mongoDB := mongoSession.DB("mal")
	anime := mongoDB.C("anime")
	notEmpty := bson.M{"$not": bson.M{"$size": 0}}
	var currentGroups []int
	err = anime.Find(bson.M{"characters": notEmpty, "_id.i": bson.M{"$in": []int{5300}}}).Distinct("group", &currentGroups)
	if err != nil {
		panic(err)
	}
	fmt.Println(currentGroups)
}
