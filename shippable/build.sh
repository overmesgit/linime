set +e
export GOPATH=$GOPATH:/root/src/github.com/overmesgit/linime/:/root/malgopar
go test -v `ls /root/src/github.com/overmesgit/linime/src/ -I main`
go build -v /root/src/github.com/overmesgit/linime/src/main/linime_server.go
set -e