set +e
go get github.com/jinzhu/gorm
go get github.com/jinzhu/gorm/dialects/postgres
go get github.com/PuerkitoBio/goquery
git clone -b dev https://github.com/overmesgit/malgopar /root/src/github.com/overmesgit/malgopar/

export GOPATH=$GOPATH:/root/src/github.com/overmesgit/linime/:/root/src/github.com/overmesgit/malgopar/
go test -v `ls /root/src/github.com/overmesgit/linime/src/ -I main`
go build -v /root/src/github.com/overmesgit/linime/src/main/linime_server.go
set -e