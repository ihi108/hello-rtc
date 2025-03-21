package server

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	db "github.com/ihi108/hello-rtc/rtc-app/db/sqlc"
	"github.com/ihi108/hello-rtc/rtc-app/util"
)

type loginUserFormRequest struct {
	Username string `form:"username" binding:"required,alphanum"` // no special characters in username
	Password string `form:"password" binding:"required,min=6"`
}

func (server *Server) loginUser(ctx *gin.Context) {
	var userData loginUserFormRequest

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

type createUserFormRequest struct {
	Username    string    `form:"username" binding:"required,alphanum"`
	FirstName   string    `form:"first_name" binding:"required,alphanum"`
	LastName    string    `form:"last_name" binding:"required,alphanum"`
	MiddleName  string    `form:"middle_name"`
	Email       string    `form:"email" binding:"required,alphanum"`
	Password    string    `form:"password" binding:"required,alphanum"`
	DateOfBirth time.Time `form:"date_of_birth" binding:"required"`
}

func (server *Server) signupUser(ctx *gin.Context) {
	var userFormData createUserFormRequest

	session := sessions.Default(ctx)
	meet_id := session.Get("meet_id")

	if err := ctx.ShouldBind(&userFormData); err != nil {
		ctx.HTML(http.StatusUnauthorized, "register.html", errorResponse(err))
		return
	}

	hashedPassword, err := util.GeneratePasswordHash(userFormData.Password)
	if err != nil {
		ctx.HTML(http.StatusInternalServerError, "register.html", errorResponse(err))
		return
	}

	arg := db.CreateUserParams{
		Username:       userFormData.Username,
		FirstName:      userFormData.FirstName,
		LastName:       userFormData.LastName,
		MiddleName:     sql.NullString{String: userFormData.MiddleName, Valid: true},
		Email:          userFormData.Email,
		HashedPassword: hashedPassword,
		DateOfBirth:    userFormData.DateOfBirth,
	}

	user, err := server.store.CreateUser(ctx, arg)
	if err != nil {
		ctx.HTML(http.StatusUnauthorized, "register.html", errorResponse(err))
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
