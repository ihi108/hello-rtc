package server

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (server *Server) login(ctx *gin.Context) {
	session := sessions.Default(ctx)
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")
	meet_id := session.Get("meet_id")
	var user User
	fmt.Println(username, password)

	// Validate form input
	if strings.Trim(username, " ") == "" || strings.Trim(password, " ") == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty"})
		return
	}

	for _, userData := range DB {
		if userData.Username == username && userData.Password == password {
			user = userData
			fmt.Println(user)
			break
		}
	}

	if user.Username == username && user.Password == password {

		// save the username in the session with the userData(username & password)
		session.Set("user", user)
		session.Save()

		if meet_id == nil {
			ctx.Redirect(http.StatusFound, "/apps")
		} else {
			ctx.Redirect(http.StatusFound, "/meet/"+meet_id.(string))
		}
		return
	}

	ctx.HTML(http.StatusUnauthorized, "login.html", gin.H{
		"error": "incorrect username or password",
	})
}
