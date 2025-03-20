package server

import (
	"log"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

func (server *Server) createMeet(ctx *gin.Context) {
	session := sessions.Default(ctx)
	// set create; meeting create operation
	session.Set("create", true)

	// when meeting info is checked from database if user created
	// the meeting, we add admin property to the session

	if err := session.Save(); err != nil {
		log.Fatal(err)
		return
	} else {

		id, err := gonanoid.New()
		if err != nil {
			log.Fatal(err)
		}
		ctx.Redirect(http.StatusFound, "/meet/"+id)
	}
}
