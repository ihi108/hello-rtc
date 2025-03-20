package server

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/ihi108/hello-rtc/rtc-app/util"
)

type createUserFormRequest struct {
	Username string `form:"username" binding:"required,alphanum"` // no special characters in username
	Password string `form:"password" binding:"required,min=6"`
}

func (server *Server) loginUser(ctx *gin.Context) {
	var userData createUserFormRequest

	session := sessions.Default(ctx)
	meet_id := session.Get("meet_id")

	if err := ctx.ShouldBind(&userData); err != nil {
		ctx.HTML(http.StatusUnauthorized, "login.html", errorResponse(err))
		return
	}

	user, err := server.store.GetUser(ctx, userData.Username)
	if err != nil {
		ctx.HTML(http.StatusUnauthorized, "login.html", errorResponse(err))
		return
	}

	if err = util.CheckPassword(userData.Password, user.HashedPassword); err != nil {
		ctx.HTML(http.StatusUnauthorized, "login.html", errorResponse(err))
		return
	}

	// save the username in the session with the userData(username & password)
	session.Set("user", user)
	session.Save()

	if meet_id == nil {
		ctx.Redirect(http.StatusFound, "/apps")
	} else {
		ctx.Redirect(http.StatusFound, "/meet/"+meet_id.(string))
	}
}

func (server *Server) signupUser(ctx *gin.Context) {
}
