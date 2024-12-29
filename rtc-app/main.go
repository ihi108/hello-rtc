package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("templates/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"title": "Main website",
		})
	})

	router.GET("/apps", func(c *gin.Context) {
		c.HTML(http.StatusOK, "apps.tmpl", gin.H {
			"title": "Landing Page",
		})
	})

	router.GET("/meet", func(c *gin.Context) {
		c.HTML(http.StatusOK, "meet.tmpl", gin.H{
			"title": "Meetings",
		})
	})

	router.GET("/msgs", func(c *gin.Context) {
		c.HTML(http.StatusOK, "messages.tmpl", gin.H{
			"title": "Messages",
		})
	})

	router.GET("/call", func(c *gin.Context) {
		c.HTML(http.StatusOK, "call.tmpl", gin.H{
			"title": "Make a Call",
		})
	})

	router.GET("/stream", func(c *gin.Context) {
		c.HTML(http.StatusOK, "stream.tmpl", gin.H{
			"title": "Start a stream",
		})
	})

	router.GET("/records", func(c *gin.Context) {
		c.HTML(http.StatusOK, "records.tmpl", gin.H{
			"title": "View recordings",
		})
	})

	router.Run()
}