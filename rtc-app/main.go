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
	router.Static("/static", "./static")
	router.LoadHTMLGlob("templates/*")
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "Main website",
		})
	})

	router.GET("/apps", func(c *gin.Context) {
		c.HTML(http.StatusOK, "apps.html", gin.H{
			"title": "Landing Page",
		})
	})

	router.GET("/meet", func(c *gin.Context) {
		c.HTML(http.StatusOK, "meet.html", gin.H{
			"title": "Meetings",
		})
	})

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

	router.Run()
}
