package server

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	db "github.com/ihi108/hello-rtc/rtc-app/db/sqlc"
)

// Server serves the HTTP request for the app
type Server struct {
	store  db.Store // interacts with the database
	router *gin.Engine
}

// NewServer creates a new HTTP server and setup routing
func NewServer(store db.Store) *Server {
	server := &Server{store: store}
	router := gin.Default()

	// Setup the cookie store for session management
	cookieStore := cookie.NewStore([]byte("secret"))
	// cookieStore.Options(sessions.Options{MaxAge: 60 * 60 * 24}) // expire in a day
	cookieStore.Options(sessions.Options{
		MaxAge:   60 * 60,
		HttpOnly: true,
		// Secure:   true,
	})
	router.Use(sessions.Sessions("session-token", cookieStore))

	router.Static("../static", "./static")
	router.LoadHTMLGlob("./templates/*")

	router.GET("/", server.rootPage)
	router.GET("/login", server.loginPage)
	router.POST("/login", server.loginUser)
	router.GET("/signup", server.signupPage)
	router.POST("/signup", server.signupUser)
	router.GET("/meet/:id", server.meetPage)

	router.Use(authRequired)

	router.GET("/setmeet", server.createMeet)
	router.GET("/apps", server.appsPage)
	router.GET("/msgs", server.msgsPage)
	router.GET("/call", server.callPage)
	router.GET("/stream", server.streamsPage)
	router.GET("/records", server.recordsPage)

	server.router = router
	return server
}

// Start runs the HTTP server on a specific address
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
