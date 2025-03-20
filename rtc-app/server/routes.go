package server

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func (server *Server) rootPage(ctx *gin.Context) {
	session := sessions.Default(ctx)
	user := session.Get("user")
	if user == "" {
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
	var data map[string]interface{}
	session := sessions.Default(ctx)
	session.Delete("meet_id")
	user := session.Get("user")
	create := session.Get("create")
	id := ctx.Param("id")
	room := roomId(id)

	data = make(map[string]interface{})
	if user == nil {
		data["id"] = id
		data["username"] = ""
		data["create"] = create
		data["key"] = os.Getenv("API")
		data["room"] = room
		data["login"] = false
	} else {
		data["id"] = id
		data["username"] = user.(User).Username
		data["create"] = create
		data["key"] = os.Getenv("API")
		data["room"] = room
		data["login"] = true
	}

	ctx.HTML(http.StatusOK, "meet.html", data)
}

func (server *Server) appsPage(ctx *gin.Context) {
	session := sessions.Default(ctx)
	user := session.Get("user")
	fmt.Println(user)
	ctx.HTML(http.StatusOK, "apps.html", gin.H{
		"User": user,
	})
}


router.GET("/msgs", func(c *gin.Context) {
	c.HTML(http.StatusOK, "messages.html", gin.H{
		"title": "Messages",
	})
})

router.GET("/call", func(c *gin.Context) {
	c.HTML(http.StatusOK, "call.html", gin.H{
		"title": "Make a Call",
	})
})

router.GET("/stream", func(c *gin.Context) {
	c.HTML(http.StatusOK, "stream.html", gin.H{
		"title": "Start a stream",
	})
})

router.GET("/records", func(c *gin.Context) {
	c.HTML(http.StatusOK, "records.html", gin.H{
		"title": "View recordings",
	})
})