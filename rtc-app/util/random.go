package util

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

const alphabet = "abcdefghijklmnopqrstuvwxyz"

var months = []time.Month{
	time.January,
	time.February,
	time.March,
	time.April,
	time.May,
	time.June,
	time.July,
	time.August,
	time.September,
	time.October,
	time.November,
	time.December,
}

var years = []int{
	1998,
	1999,
	2000,
	2001,
	2002,
	2003,
	2004,
}

// RandomString generates a random string of length n
func RandomString(n int) string {
	var sb strings.Builder
	k := len(alphabet)

	for i := 0; i < n; i++ {
		c := alphabet[rand.Intn(k)]
		sb.WriteByte(c)
	}

	return sb.String()
}

// RandomName generates a random name
func RandomName(n int) string {
	return RandomString(n)
}

// RandomEmail generates a random email
func RandomEmail() string {
	return fmt.Sprintf("%s@email.com", RandomString(9))
}

// RandomBirthDay generates a random birth day date
func RandomBirthDay() time.Time {
	return time.Date(years[rand.Intn(7)], months[rand.Intn(12)], rand.Intn(28)+1, 0, 0, 0, 0, time.Local)
}
