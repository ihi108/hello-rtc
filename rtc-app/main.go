package main

import (
	"encoding/gob"
	"encoding/json"
	"fmt"
	"hash/fnv"
	"log"
	"net/http"
	"os"
	"reflect"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var DB []User

func init() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	gob.Register(User{}) // register the User type

	// get data from db.json
	file, err := os.ReadFile("db.json")
	if err != nil {
		log.Fatal("Failed database access")
	}
	err = json.Unmarshal(file, &DB)
	if err != nil {
		log.Fatal(err)
		log.Fatal("Failed to load DB")
	}

}

var secret = []byte("secret")

func main() {
	router := gin.Default()

	// Setup the cookie store for session management
	store := cookie.NewStore(secret)
	// store.Options(sessions.Options{MaxAge: 60 * 60 * 24}) // expire in a day
	store.Options(sessions.Options{
		MaxAge:   60 * 60,
		HttpOnly: true,
		// Secure:   true,
	}) // expire in a day
	router.Use(sessions.Sessions("session-token", store))

	router.Static("/static", "./static")
	router.LoadHTMLGlob("templates/*")
	router.GET("/", func(c *gin.Context) {
		session := sessions.Default(c)
		user := session.Get("user")
		if reflect.DeepEqual(user, nil) {
			c.HTML(http.StatusOK, "index.html", gin.H{
				"title": "Main website",
			})
		} else {
			c.Redirect(http.StatusFound, "/apps")
		}
	})

	router.GET("/login", func(c *gin.Context) {
		c.HTML(http.StatusOK, "login.html", gin.H{
			"title": "Login Page",
		})
	})

	router.POST("/login", func(c *gin.Context) {
		session := sessions.Default(c)
		username := c.PostForm("username")
		password := c.PostForm("password")
		var user User
		fmt.Println(username, password)

		// Validate form input
		if strings.Trim(username, " ") == "" || strings.Trim(password, " ") == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty"})
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
			if err := session.Save(); err != nil {
				c.HTML(http.StatusInternalServerError, "login.html", gin.H{
					"error": "Failed to save session reload page and Try again.",
				})
				fmt.Println(err)
				return
			}

			c.Redirect(http.StatusFound, "/apps")
			return
		}

		c.HTML(http.StatusUnauthorized, "login.html", gin.H{
			"error": "incorrect username or password",
		})

	})

	router.GET("/signup", func(c *gin.Context) {
		c.HTML(http.StatusOK, "register.html", gin.H{
			"title": "Register Page",
		})
	})

	router.GET("/meet/:id", func(c *gin.Context) {
		var data map[string]interface{}
		session := sessions.Default(c)
		user := session.Get("user")
		create := session.Get("create")
		id := c.Param("id")
		room := roomId(id)
		fmt.Println("ID", id)

		data = make(map[string]interface{})
		if reflect.DeepEqual(user, nil) {
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

		c.HTML(http.StatusOK, "meet.html", data)
	})

	router.Use(AuthRequired)

	router.GET("/setmeet", func(c *gin.Context) {
		session := sessions.Default(c)
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
			c.Redirect(http.StatusFound, "/meet/"+id)
		}
	})

	router.GET("/apps", func(c *gin.Context) {
		session := sessions.Default(c)
		user := session.Get("user")
		fmt.Println(user)
		c.HTML(http.StatusOK, "apps.html", gin.H{
			"User": user,
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

// AuthRequired is a simple middleware to check the session.
func AuthRequired(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.Redirect(http.StatusFound, "/login")
		return
	}
	// Continue down the chain to handler etc
	c.Next()
}

func roomId(s string) uint32 {
	h := fnv.New32a()
	h.Write([]byte(s))
	return h.Sum32()
}
