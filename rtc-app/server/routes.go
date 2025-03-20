package server

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	db "github.com/ihi108/hello-rtc/rtc-app/db/sqlc"
	"github.com/ihi108/hello-rtc/rtc-app/util"
)

type appsPageResponse struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

type meetsPageResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Create   bool   `json:"create"`
	APIKey   string `json:"key"`
	Room     uint32 `json:"room"`
	Login    bool   `json:"login"`
}

func (server *Server) rootPage(ctx *gin.Context) {
	session := sessions.Default(ctx)
	user := session.Get("user")
	if user == nil {
		ctx.HTML(http.StatusOK, "index.html", gin.H{
			"title": "Main website",
		})
	} else {
		ctx.Redirect(http.StatusFound, "/apps")
	}
}

func (server *Server) loginPage(ctx *gin.Context) {
	session := sessions.Default(ctx)

	meet_id := ctx.Query("meet")

	if meet_id != "" {
		session.Set("meet_id", meet_id)
		session.Save()
	}

	ctx.HTML(http.StatusOK, "login.html", gin.H{
		"title": "Login Page",
	})
}

func (server *Server) signupPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "register.html", gin.H{
		"title": "Register Page",
	})
}

func (server *Server) meetPage(ctx *gin.Context) {
	var username string
	var login bool

	session := sessions.Default(ctx)
	session.Delete("meet_id")
	user := session.Get("user")
	create := session.Get("create")
	id := ctx.Param("id")
	room := util.RoomId(id)

	if user == nil {
		login = false
		username = ""
	} else {
		login = true
		username = user.(db.User).Username
	}

	response := meetsPageResponse{
		ID:       id,
		Username: username,
		Create:   create.(bool),
		APIKey:   server.store.Key,
		Room:     room,
		Login:    login,
	}

	ctx.HTML(http.StatusOK, "meet.html", response)
}

func (server *Server) appsPage(ctx *gin.Context) {
	session := sessions.Default(ctx)
	user := session.Get("user")

	userData := appsPageResponse{
		Username: user.(db.User).Username,
		Avatar:   user.(db.User).Avatar,
	}
	fmt.Println(user)
	ctx.HTML(http.StatusOK, "apps.html", gin.H{
		"User": userData,
	})
}

func (server *Server) msgsPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "messages.html", gin.H{
		"title": "Messages",
	})
}

func (server *Server) callPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "call.html", gin.H{
		"title": "Make a Call",
	})
}

func (server *Server) streamsPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "stream.html", gin.H{
		"title": "Start a stream",
	})
}

func (server *Server) recordsPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "records.html", gin.H{
		"title": "View recordings",
	})
}
