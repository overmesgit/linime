package main

import (
	"game"
	"os"
)

func main() {
	game.StartServer(os.Args[1])
}
